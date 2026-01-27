import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import robot3 from "../assets/robot3.gif";
import { getQuestionsForRole, getRoleTitle } from '../data/interviewQuestions';
import { 
  saveSessionToStorage, 
  loadSessionFromStorage, 
  clearCurrentSession,
  saveInterviewToHistory,
  getAnswerFeedback,
  calculateInterviewScore
} from '../services/mockInterviewService';
import InterviewResults from '../components/InterviewResults';

const MockInterview = () => {
  const { id } = useParams();
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answer, setAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isWebCamOn, setIsWebCamOn] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [micStream, setMicStream] = useState(null);
  const [responses, setResponses] = useState([]);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'voice'

  // Load questions and check for saved session
  useEffect(() => {
    const roleQuestions = getQuestionsForRole(id);
    
    if (!roleQuestions || roleQuestions.length === 0) {
      setError('No questions available for this role. Please try another role.');
      return;
    }

    setQuestions(roleQuestions);

    // Check for saved session
    const savedSession = loadSessionFromStorage();
    if (savedSession && savedSession.roleId === id) {
      // Resume saved session
      const resumeSession = window.confirm(
        'You have an unfinished interview. Would you like to resume?'
      );
      
      if (resumeSession) {
        setResponses(savedSession.responses);
        setCurrentQuestionIndex(savedSession.currentQuestionIndex);
        setSessionStartTime(new Date(savedSession.sessionStartTime));
        setInterviewStarted(true);
        setQuestionStartTime(Date.now());
      } else {
        clearCurrentSession();
      }
    }

    // Cleanup on component unmount
    return () => {
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [id]);

  // Auto-save session
  useEffect(() => {
    if (interviewStarted && sessionStartTime) {
      const sessionData = {
        roleId: id,
        roleTitle: getRoleTitle(id),
        responses,
        currentQuestionIndex,
        sessionStartTime: sessionStartTime.toISOString()
      };
      saveSessionToStorage(sessionData);
    }
  }, [responses, currentQuestionIndex, interviewStarted, sessionStartTime, id]);

  const startInterview = () => {
    setInterviewStarted(true);
    setSessionStartTime(new Date());
    setQuestionStartTime(Date.now());
    setCurrentQuestionIndex(0);
    setResponses([]);
    setAnswer("");
  };

  const setupSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please use text input or try Chrome/Edge.');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('Speech recognition started.');
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setAnswer(prev => prev + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      console.log('Speech recognition ended.');
      setIsRecording(false);
    };

    return recognition;
  };

  const startRecording = () => {
    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      const recognition = setupSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }
    }
  };

  const handleNextQuestion = async () => {
    if (!answer.trim()) {
      const proceed = window.confirm('You haven\'t provided an answer. Do you want to skip this question?');
      if (!proceed) return;
    }

    setIsLoading(true);
    const questionDuration = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQuestion = questions[currentQuestionIndex];

    try {
      // Get feedback for the answer
      const feedback = await getAnswerFeedback(currentQuestion.question, answer);

      const responseData = {
        question: currentQuestion.question,
        answer: answer,
        category: currentQuestion.category,
        duration: questionDuration,
        feedback: feedback,
        timestamp: new Date().toISOString()
      };

      const newResponses = [...responses, responseData];
      setResponses(newResponses);

      // Check if this was the last question
      if (currentQuestionIndex >= questions.length - 1) {
        // Interview complete
        await completeInterview(newResponses);
      } else {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer("");
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error processing answer:', error);
      alert('Error processing your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Load previous answer if available
      if (responses[currentQuestionIndex - 1]) {
        setAnswer(responses[currentQuestionIndex - 1].answer);
      }
    }
  };

  const completeInterview = async (finalResponses) => {
    const totalDuration = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    const overallScore = calculateInterviewScore(finalResponses);

    const sessionData = {
      roleId: id,
      roleTitle: getRoleTitle(id),
      responses: finalResponses,
      totalDuration,
      overallScore,
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString()
    };

    // Save to history
    saveInterviewToHistory(sessionData);
    
    // Clear current session
    clearCurrentSession();

    // Show results
    setShowResults(true);
  };

  const restartInterview = () => {
    setShowResults(false);
    setInterviewStarted(false);
    setCurrentQuestionIndex(0);
    setResponses([]);
    setAnswer("");
    clearCurrentSession();
  };

  const toggleMic = async () => {
    if (isMicOn) {
      micStream.getTracks().forEach(track => track.stop());
      setMicStream(null);
      setIsMicOn(false);
    } else {
      try {
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(mic);
        setIsMicOn(true);
      } catch (error) {
        console.error('Error accessing microphone: ', error);
        alert('Unable to access microphone. Please check permissions.');
      }
    }
  };

  const toggleWebCam = async () => {
    if (isWebCamOn) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setIsWebCamOn(false);
    } else {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = cam;
        setStream(cam);
        setIsWebCamOn(true);
      } catch (error) {
        console.error('Error accessing webcam: ', error);
        alert('Unable to access webcam. Please check permissions.');
      }
    }
  };

  // Show results screen
  if (showResults) {
    const sessionData = {
      roleTitle: getRoleTitle(id),
      responses,
      totalDuration: Math.floor((Date.now() - sessionStartTime.getTime()) / 1000),
      overallScore: calculateInterviewScore(responses),
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString()
    };
    return <InterviewResults sessionData={sessionData} onRestart={restartInterview} />;
  }

  // Show error screen
  if (error) {
    return (
      <div className="min-h-screen text-white py-10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Error</h1>
          <p className="text-xl mb-8">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show start screen
  if (!interviewStarted) {
    return (
      <div className="min-h-screen text-white py-10 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h1 className="text-5xl font-bold mb-6">
            {getRoleTitle(id)} Mock Interview
          </h1>
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 p-8 rounded-2xl shadow-xl mb-8">
            <h2 className="text-2xl font-semibold mb-4">Interview Details</h2>
            <div className="text-left space-y-3 text-gray-200">
              <p>📝 <strong>Total Questions:</strong> {questions.length}</p>
              <p>⏱️ <strong>Estimated Time:</strong> {Math.ceil(questions.length * 2)} - {Math.ceil(questions.length * 3)} minutes</p>
              <p>🎯 <strong>Categories:</strong> Technical, HR, Behavioral</p>
              <p>🎤 <strong>Input Methods:</strong> Voice or Text</p>
            </div>
          </div>
          <div className="bg-yellow-900 bg-opacity-50 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-semibold mb-3">📌 Instructions</h3>
            <ul className="text-left space-y-2 text-gray-200">
              <li>✓ Answer each question thoughtfully</li>
              <li>✓ You can use voice input or type your answers</li>
              <li>✓ Your progress is automatically saved</li>
              <li>✓ You'll receive feedback after each answer</li>
              <li>✓ Take your time - there's no strict time limit</li>
            </ul>
          </div>
          <button
            onClick={startInterview}
            className="px-12 py-4 bg-gradient-to-r from-green-500 to-green-700 text-white text-xl font-bold rounded-2xl shadow-lg hover:from-green-600 hover:to-green-800 transition duration-300 transform hover:scale-105"
          >
            Start Interview 🚀
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen text-white py-10 sm:my-20">
      <div className="container mx-auto px-4">
        {/* Header with Progress */}
        <div className="mb-8">
          <h1 className="text-center text-4xl font-bold mb-4">
            {getRoleTitle(id)} Mock Interview
          </h1>
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between text-sm mb-2">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="capitalize">{currentQuestion.category}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Interview Question and Video Feed */}
          <div className="flex flex-col space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-purple-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-sm text-gray-300 mb-2">Question {currentQuestionIndex + 1}:</h3>
              <p className="text-xl text-white font-semibold mb-4">{currentQuestion.question}</p>
              <div className="relative mt-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-80 object-cover rounded-xl border-4 border-transparent shadow-2xl bg-gray-900"
                />
                {!isWebCamOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-xl">
                    <p className="text-gray-400">Webcam Off</p>
                  </div>
                )}
                <div className="absolute bottom-4 left-4 flex space-x-4">
                  <button
                    onClick={toggleWebCam}
                    className={`${
                      isWebCamOn ? 'bg-red-500' : 'bg-green-500'
                    } text-white py-2 px-4 rounded-lg shadow transition duration-300 hover:opacity-80`}
                  >
                    {isWebCamOn ? '📹 Turn Off' : '📹 Turn On'}
                  </button>
                  <button
                    onClick={toggleMic}
                    className={`${
                      isMicOn ? 'bg-red-500' : 'bg-yellow-500'
                    } text-white py-2 px-4 rounded-lg shadow transition duration-300 hover:opacity-80`}
                  >
                    {isMicOn ? '🎤 Mic Off' : '🎤 Mic On'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={startRecording}
                disabled={isLoading}
                className={`flex-1 ${
                  isRecording 
                    ? 'bg-gradient-to-r from-red-500 to-red-700 animate-pulse' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-500'
                } text-white py-3 px-8 rounded-2xl shadow-lg hover:opacity-90 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? '🔴 Recording... (Click to Stop)' : '🎤 Start Voice Input'}
              </button>
            </div>
          </div>

          {/* Right Side - Answer Input and Navigation */}
          <div className="flex flex-col space-y-6">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-800 p-6 rounded-2xl shadow-xl flex-1">
              <h2 className="text-2xl font-semibold text-center mb-4">Your Answer</h2>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here or use voice input..."
                className="w-full h-64 p-4 bg-black bg-opacity-40 text-white rounded-lg border-2 border-gray-600 focus:border-blue-500 outline-none resize-none"
                disabled={isLoading}
              />
              <div className="mt-3 text-sm text-gray-300">
                Words: {answer.trim().split(/\s+/).filter(w => w).length}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0 || isLoading}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl shadow-lg hover:from-gray-700 hover:to-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white py-3 px-6 rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : currentQuestionIndex >= questions.length - 1 ? 'Finish Interview ✓' : 'Next →'}
              </button>
            </div>

            <div className="flex justify-center">
              <img
                src={robot3}
                alt="3D Robot"
                className="w-48 h-48 rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterview;
