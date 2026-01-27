import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDuration } from '../services/mockInterviewService';

const InterviewResults = ({ sessionData, onRestart }) => {
  const navigate = useNavigate();

  const { 
    roleTitle, 
    responses, 
    totalDuration, 
    overallScore,
    startTime,
    endTime 
  } = sessionData;

  const totalQuestions = responses.length;
  const answeredQuestions = responses.filter(r => r.answer && r.answer.trim()).length;

  return (
    <div className="min-h-screen text-white py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Interview Complete! 🎉</h1>
          <p className="text-xl text-gray-300">
            {roleTitle} Mock Interview
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold mb-2">{overallScore}%</div>
            <div className="text-gray-200">Overall Score</div>
          </div>
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold mb-2">{answeredQuestions}/{totalQuestions}</div>
            <div className="text-gray-200">Questions Answered</div>
          </div>
          <div className="bg-gradient-to-br from-pink-600 to-pink-800 p-6 rounded-2xl shadow-xl text-center">
            <div className="text-5xl font-bold mb-2">{formatDuration(totalDuration)}</div>
            <div className="text-gray-200">Total Duration</div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="bg-gradient-to-r from-indigo-800 to-purple-900 p-6 rounded-2xl shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-6">Question-by-Question Feedback</h2>
          
          <div className="space-y-6">
            {responses.map((response, index) => (
              <div key={index} className="bg-black bg-opacity-30 p-5 rounded-xl">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-blue-300">
                    Question {index + 1}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    response.feedback?.score >= 8 ? 'bg-green-500' :
                    response.feedback?.score >= 6 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {response.feedback?.score || 0}/10
                  </span>
                </div>
                
                <p className="text-gray-300 mb-3 italic">"{response.question}"</p>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-200 bg-black bg-opacity-40 p-3 rounded-lg">
                    {response.answer || "No answer provided"}
                  </p>
                </div>

                {response.feedback && (
                  <div className="mt-4 space-y-2">
                    {response.feedback.strengths && response.feedback.strengths.length > 0 && (
                      <div>
                        <p className="text-green-400 font-semibold mb-1">✓ Strengths:</p>
                        <ul className="list-disc list-inside text-gray-300 text-sm">
                          {response.feedback.strengths.map((strength, i) => (
                            <li key={i}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {response.feedback.improvements && response.feedback.improvements.length > 0 && (
                      <div>
                        <p className="text-yellow-400 font-semibold mb-1">→ Areas for Improvement:</p>
                        <ul className="list-disc list-inside text-gray-300 text-sm">
                          {response.feedback.improvements.map((improvement, i) => (
                            <li key={i}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {response.feedback.overallFeedback && (
                      <div>
                        <p className="text-blue-400 font-semibold mb-1">Overall Feedback:</p>
                        <p className="text-gray-300 text-sm">{response.feedback.overallFeedback}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-3 text-xs text-gray-500">
                  Duration: {formatDuration(response.duration || 0)} | 
                  Category: <span className="capitalize">{response.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition duration-300"
          >
            Try Another Interview
          </button>
          <button
            onClick={() => navigate('/i')}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-300"
          >
            Back to Interview Home
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-800 transition duration-300"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewResults;
