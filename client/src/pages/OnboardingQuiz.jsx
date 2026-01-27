import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award, 
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Flame,
  Brain
} from 'lucide-react';
import { db } from '../Firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getUserInfo } from '../hooks/getUserInfo';

const quizQuestions = [
  {
    id: 1,
    topic: 'Python',
    question: 'What is the output of: print(type([]))?',
    options: [
      '<class \'list\'>',
      '<class \'dict\'>',
      '<class \'tuple\'>',
      '<class \'set\'>'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10
  },
  {
    id: 2,
    topic: 'Python',
    question: 'Which of these is used to define a function in Python?',
    options: ['function', 'def', 'func', 'define'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10
  },
  {
    id: 3,
    topic: 'JavaScript',
    question: 'What does "===" check in JavaScript?',
    options: [
      'Value only',
      'Type only',
      'Both value and type',
      'Neither value nor type'
    ],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 15
  },
  {
    id: 4,
    topic: 'JavaScript',
    question: 'Which method is used to add an element at the end of an array?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 10
  },
  {
    id: 5,
    topic: 'C++',
    question: 'Which operator is used to access members of a class through a pointer?',
    options: ['.', '->', '::', '&'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 15
  },
  {
    id: 6,
    topic: 'C++',
    question: 'What is the default access specifier for class members in C++?',
    options: ['public', 'private', 'protected', 'internal'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 15
  },
  {
    id: 7,
    topic: 'Java',
    question: 'Which keyword is used to inherit a class in Java?',
    options: ['inherits', 'extends', 'implements', 'super'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10
  },
  {
    id: 8,
    topic: 'Java',
    question: 'What is the size of int data type in Java?',
    options: ['16 bits', '32 bits', '64 bits', 'Depends on system'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 10
  },
  {
    id: 9,
    topic: 'React',
    question: 'What hook is used to manage state in functional components?',
    options: ['useEffect', 'useState', 'useContext', 'useReducer'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 15
  },
  {
    id: 10,
    topic: 'Data Structures',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 15
  }
];

const OnboardingQuiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [topicScores, setTopicScores] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const { userId } = getUserInfo();

  const handleAnswerSelect = (answerIndex) => {
    if (answered) return;
    
    setSelectedAnswer(answerIndex);
    setAnswered(true);
    
    const question = quizQuestions[currentQuestion];
    const correct = answerIndex === question.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      const newScore = score + 1;
      const newStreak = streak + 1;
      const newPoints = totalPoints + question.points;
      
      setScore(newScore);
      setStreak(newStreak);
      setTotalPoints(newPoints);
      
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      // Update topic scores
      setTopicScores(prev => ({
        ...prev,
        [question.topic]: (prev[question.topic] || 0) + 1
      }));
      
      // Show celebration for correct answer
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1000);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setIsCorrect(false);
    } else {
      setShowResult(true);
      saveQuizResults();
    }
  };

  const saveQuizResults = async () => {
    if (!userId) return;
    
    try {
      const quizData = {
        score,
        totalQuestions: quizQuestions.length,
        topicScores,
        maxStreak,
        totalPoints,
        completedAt: new Date().toISOString(),
        recommendations: getRecommendations()
      };
      
      await setDoc(doc(db, 'quizResults', userId), quizData);
    } catch (error) {
      console.error('Error saving quiz results:', error);
    }
  };

  const getRecommendations = () => {
    const recommendations = [];
    const topics = Object.keys(topicScores);
    
    // Find weak topics (score < 50%)
    topics.forEach(topic => {
      const topicQuestions = quizQuestions.filter(q => q.topic === topic).length;
      const topicScore = topicScores[topic] || 0;
      const percentage = (topicScore / topicQuestions) * 100;
      
      if (percentage < 50) {
        recommendations.push({
          topic,
          reason: 'Needs improvement',
          priority: 'high'
        });
      } else if (percentage < 75) {
        recommendations.push({
          topic,
          reason: 'Good foundation, can improve',
          priority: 'medium'
        });
      }
    });
    
    return recommendations;
  };

  const getPerformanceLevel = () => {
    const percentage = (score / quizQuestions.length) * 100;
    if (percentage >= 80) return { level: 'Expert', color: 'text-purple-500', icon: Trophy };
    if (percentage >= 60) return { level: 'Advanced', color: 'text-blue-500', icon: Star };
    if (percentage >= 40) return { level: 'Intermediate', color: 'text-green-500', icon: Target };
    return { level: 'Beginner', color: 'text-yellow-500', icon: Zap };
  };

  const handleFinish = () => {
    navigate('/courses');
  };

  if (showResult) {
    const performance = getPerformanceLevel();
    const PerformanceIcon = performance.icon;
    const recommendations = getRecommendations();

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-4">
              <PerformanceIcon className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Quiz Complete!</h1>
            <p className={`text-2xl font-semibold ${performance.color}`}>{performance.level}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-gray-200 text-sm">Score</p>
              <p className="text-3xl font-bold text-white">{score}/{quizQuestions.length}</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-600 to-red-600 p-6 rounded-xl text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-gray-200 text-sm">Max Streak</p>
              <p className="text-3xl font-bold text-white">{maxStreak}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-xl text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <p className="text-gray-200 text-sm">Total Points</p>
              <p className="text-3xl font-bold text-white">{totalPoints}</p>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-purple-400" />
                Recommended Courses for You
              </h2>
              <div className="space-y-3">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' 
                        ? 'bg-red-900/30 border-red-500' 
                        : 'bg-yellow-900/30 border-yellow-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{rec.topic}</h3>
                        <p className="text-gray-300 text-sm">{rec.reason}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        rec.priority === 'high' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-yellow-500 text-gray-900'
                      }`}>
                        {rec.priority === 'high' ? 'High Priority' : 'Medium Priority'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center mx-auto"
            >
              Explore Recommended Courses
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-purple-500/10 rounded-full animate-pulse"
            style={{
              width: Math.random() * 100 + 50 + 'px',
              height: Math.random() * 100 + 50 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 2 + 's',
              animationDuration: Math.random() * 3 + 2 + 's'
            }}
          />
        ))}
      </div>

      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <Sparkles className="w-32 h-32 text-yellow-400 animate-ping" />
        </div>
      )}

      <div className="max-w-3xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-indigo-500/30 shadow-2xl relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-orange-600 px-4 py-2 rounded-full">
                <Flame className="w-5 h-5 text-yellow-300 mr-2" />
                <span className="text-white font-bold">{streak} Streak</span>
              </div>
              <div className="flex items-center bg-purple-600 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-300 mr-2" />
                <span className="text-white font-bold">{totalPoints} pts</span>
              </div>
            </div>
            <span className="text-gray-300 font-semibold">
              Question {currentQuestion + 1}/{quizQuestions.length}
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="px-3 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full mr-3">
              {question.topic}
            </span>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              question.difficulty === 'easy' 
                ? 'bg-green-600 text-white' 
                : 'bg-yellow-600 text-white'
            }`}>
              {question.points} points
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">{question.question}</h2>
          
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={answered}
                className={`w-full p-4 rounded-lg text-left transition-all duration-300 transform hover:scale-102 ${
                  answered
                    ? index === question.correctAnswer
                      ? 'bg-green-600 text-white border-2 border-green-400'
                      : index === selectedAnswer
                      ? 'bg-red-600 text-white border-2 border-red-400'
                      : 'bg-gray-700 text-gray-300'
                    : selectedAnswer === index
                    ? 'bg-indigo-600 text-white border-2 border-indigo-400'
                    : 'bg-gray-700 text-white hover:bg-gray-600 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {answered && (
                    index === question.correctAnswer ? (
                      <CheckCircle className="w-6 h-6 text-green-300" />
                    ) : index === selectedAnswer ? (
                      <XCircle className="w-6 h-6 text-red-300" />
                    ) : null
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Next button */}
        {answered && (
          <div className="text-center">
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/50 flex items-center mx-auto"
            >
              {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingQuiz;
