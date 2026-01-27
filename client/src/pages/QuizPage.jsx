import { useEffect, useState , useContext } from 'react';
import { gsap } from 'gsap';
import { Clock, CheckCircle, XCircle, ArrowRight, Award, Code, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRole } from '../context/RoleContext';
import RoleContext from '../context/RoleContext'

const QuizPage = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const {role, setRole} = useContext(RoleContext);

    // State for the instructor to add a new question
    const [newQuestion, setNewQuestion] = useState('');
    const [newOptions, setNewOptions] = useState(['', '', '', '']);
    const [newCorrectAnswer, setNewCorrectAnswer] = useState(null);
    const [newExplanation, setNewExplanation] = useState('');

 
  // Sample quiz data
  const quizzes = {
    daily: {
      title: "Today's JavaScript Challenge",
      description: "Test your JavaScript knowledge with today's challenge.",
      questions: [
        {
          question: "What will be the output of the following code?\n\nconst arr = [1, 2, 3];\nconst [a, ...rest] = arr;\nconsole.log(rest);",
          options: [
            "[2, 3]",
            "[1, 2, 3]",
            "[1]",
            "SyntaxError"
          ],
          correctAnswer: 0,
          explanation: "The rest operator (...) collects the remaining elements into a new array. So 'a' gets the value 1, and 'rest' gets [2, 3]."
        },
        {
          question: "Which of the following is NOT a valid way to create a new array in JavaScript?",
          options: [
            "const arr = new Array(3)",
            "const arr = Array.from('123')",
            "const arr = [1, 2, 3]",
            "const arr = Array.create(3)"
          ],
          correctAnswer: 3,
          explanation: "Array.create() is not a valid method in JavaScript. The valid ways are using the Array constructor, Array.from(), or array literals []."
        },
        {
          question: "What is the output of the following code?\n\nconst promise = new Promise((resolve, reject) => {\n  setTimeout(() => resolve('Success!'), 1000);\n});\n\npromise.then(console.log);",
          options: [
            "undefined",
            "'Success!'",
            "A Promise object",
            "Error"
          ],
          correctAnswer: 1,
          explanation: "The Promise resolves with the value 'Success!' after 1 second, and the then() method passes this value to console.log."
        }
      ]
    },
    weekly: {
      title: "React Fundamentals",
      description: "Test your knowledge of React core concepts.",
      questions: [
        {
          question: "What hook would you use to run code only when a component mounts?",
          options: [
            "useEffect(() => {}, [])",
            "useState()",
            "useEffect(() => {})",
            "useCallback(() => {}, [])"
          ],
          correctAnswer: 0,
          explanation: "useEffect with an empty dependency array ([]) will only run once when the component mounts."
        }
      ]
    },
    monthly: {
      title: "Full Stack Challenge",
      description: "Test your knowledge across the entire stack.",
      questions: [
        {
          question: "Which of the following is NOT a valid HTTP status code?",
          options: [
            "200 OK",
            "404 Not Found",
            "500 Internal Server Error",
            "600 Server Timeout"
          ],
          correctAnswer: 3,
          explanation: "600 is not a valid HTTP status code. Valid status codes range from 100-599."
        }
      ]
    }
  };

  useEffect(() => {
    if(role==="user")
    {
    // Animate the page elements
    gsap.fromTo(
      '.quiz-header > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.quiz-tabs > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.quiz-content',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    
    );
  }
    window.scrollTo({ top: 0, behavior: "smooth" });

  }, []);


  useEffect(() => {
    // Reset quiz state when changing tabs
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(60);
  }, [activeTab]);

  useEffect(() => {
    // Timer for quiz
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered]);

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setIsAnswered(true);
    
    const currentQuiz = quizzes[activeTab];
    const isCorrect = optionIndex === currentQuiz.questions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Animate the result
    gsap.to('.option-btn', {
      scale: 0.95,
      duration: 0.2,
      ease: 'power2.out',
    });

    gsap.to('.explanation', {
      height: 'auto',
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

   // Function to handle form submission (instructor adding a question)
   const handleAddQuestion = () => {
    const newQuizData = {
      question: newQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer,
      explanation: newExplanation
    };
    const updatedQuizzes = { ...quizzes };
    updatedQuizzes[activeTab].questions.push(newQuizData);  // Adding the new question to the active quiz

    // Reset form fields
    setNewQuestion('');
    setNewOptions(['', '', '', '']);
    setNewCorrectAnswer(null);
    setNewExplanation('');

    alert('New question added!');
  };

  const renderInstructorForm = () => {
    return (
      <div className="instructor-form bg-gray-900 rounded-lg p-6 shadow-lg mt-8">
        <h3 className="text-2xl font-bold mb-4">Add a New Question</h3>
        <form>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Question</label>
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
              placeholder="Enter your question here"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Options</label>
            {newOptions.map((option, index) => (
              <input
                key={index}
                type="text"
                value={option}
                onChange={(e) => {
                  const updatedOptions = [...newOptions];
                  updatedOptions[index] = e.target.value;
                  setNewOptions(updatedOptions);
                }}
                className="w-full p-3 mb-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
              />
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Correct Answer (0-3)</label>
            <input
              type="number"
              value={newCorrectAnswer}
              onChange={(e) => setNewCorrectAnswer(Number(e.target.value))}
              min="0"
              max="3"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Explanation</label>
            <textarea
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
              placeholder="Enter the explanation for the correct answer"
            />
          </div>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full p-3 bg-green-500 text-white font-bold rounded-md"
          >
            Add Question
          </button>
        </form>
      </div>
    );
  };


  const nextQuestion = () => {
    const currentQuiz = quizzes[activeTab];
    
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(60);
      
      // Animate transition to next question
      gsap.fromTo(
        '.question-content',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setTimeLeft(60);
    
    // Animate reset
    gsap.fromTo(
      '.quiz-content',
      { opacity: 0.5 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  };

  const renderQuiz = () => {
    const currentQuiz = quizzes[activeTab];
    const question = currentQuiz.questions[currentQuestion];

    if (currentQuestion >= currentQuiz.questions.length) {
      // Quiz completed
      return (
        <div className="quiz-completed text-center py-10">
          <div className="inline-block p-4 rounded-full bg-green-500/20 mb-6">
            <Award className="h-16 w-16 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
          <p className="text-xl mb-6">
            Your score: <span className="text-green-500 font-bold">{score}</span> / {currentQuiz.questions.length}
          </p>
          <button
            onClick={resetQuiz}
            className="flex items-center justify-center mx-auto space-x-2 btn-primary"
          >
            <RefreshCw size={18} />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return (
      <div className="question-content">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {currentQuiz.questions.length}
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Clock size={16} className={timeLeft < 10 ? "text-red-500" : "text-gray-400"} />
            <span className={timeLeft < 10 ? "text-red-500" : "text-gray-400"}>
              {timeLeft} seconds
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm md:text-base">
            {question.question}
          </pre>
        </div>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isAnswered && handleAnswer(index)}
              disabled={isAnswered}
              className={`option-btn w-full text-left p-4 rounded-lg transition-all duration-200 ${
                isAnswered
                  ? index === question.correctAnswer
                    ? "bg-green-500/20 border border-green-500"
                    : index === selectedOption
                    ? "bg-red-500/20 border border-red-500"
                    : "bg-gray-800 border border-gray-700"
                  : "bg-gray-800 border border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-start">
                <div className="mr-3 mt-0.5">
                  {isAnswered && index === question.correctAnswer ? (
                    <CheckCircle size={18} className="text-green-500" />
                  ) : isAnswered && index === selectedOption ? (
                    <XCircle size={18} className="text-red-500" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center">
                      {String.fromCharCode(65 + index)}
                    </div>
                  )}
                </div>
                <span className="font-mono">{option}</span>
              </div>
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className="explanation mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4 opacity-0 h-0 overflow-hidden">
            <h4 className="font-bold mb-2 text-gray-200">Explanation:</h4>
            <p className="text-gray-300">{question.explanation}</p>
          </div>
        )}

        {isAnswered && currentQuestion < currentQuiz.questions.length - 1 && (
          <button
            onClick={nextQuestion}
            className="mt-6 btn-primary w-full flex items-center justify-center"
          >
            <span>Next Question</span>
            <ArrowRight size={18} className="ml-2" />
          </button>
        )}

        {isAnswered && currentQuestion === currentQuiz.questions.length - 1 && (
          <button
            onClick={() => setCurrentQuestion(currentQuiz.questions.length)}
            className="mt-6 btn-primary w-full flex items-center justify-center"
          >
            <span>See Results</span>
            <ArrowRight size={18} className="ml-2" />
          </button>
        )}
      </div>
    );
  };

  return (
    role === 'user' ? (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="quiz-header text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Daily <span className="gradient-text">Coding Quizzes</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Test your knowledge with our daily coding challenges. Complete quizzes to earn points and track your progress.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="quiz-tabs flex border-b border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'daily'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Daily Challenge
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'weekly'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Weekly Quiz
            </button>
            <button
              onClick={() => setActiveTab('monthly')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'monthly'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Monthly Challenge
            </button>
          </div>

          <div className="quiz-content bg-gray-900 rounded-xl border border-gray-800 p-6 shadow-lg">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{quizzes[activeTab].title}</h2>
              <p className="text-gray-400">{quizzes[activeTab].description}</p>
            </div>

            {renderQuiz()}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-3">
                  <Code size={20} className="text-green-500" />
                </div>
                <h3 className="font-bold">Practice Mode</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Practice with unlimited quizzes on specific topics to strengthen your skills.
              </p>
              <Link to = '/exercises'>
                <button className="text-green-500 text-sm font-medium hover:text-green-400 transition-colors">
                  Start Practice →
                </button>
              </Link>
              
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <Award size={20} className="text-blue-500" />
                </div>
                <h3 className="font-bold">Leaderboard</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Compete with other developers and see where you rank on our global leaderboard.
              </p>
              <Link to="/leaderboard" >
                <button className="text-blue-500 text-sm font-medium hover:text-blue-400  transition-colors">
                  View Leaderboard →
                </button>
              </Link>
              
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <Clock size={20} className="text-purple-500" />
                </div>
                <h3 className="font-bold">Quiz History</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Review your past quiz attempts and track your improvement over time.
              </p>
              <button className="text-purple-500 text-sm font-medium hover:text-purple-400 transition-colors">
                See History →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    ) : role === 'instructor' ? (
      <div className="min-h-screen pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="quiz-header text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Instructor Dashboard
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              As an instructor, you can add quiz questions to the challenges below.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="quiz-tabs flex border-b border-gray-700 mb-8">
              {/* Tabs for daily, weekly, and monthly quizzes */}
              <button onClick={() => setActiveTab('daily')}>Daily Challenge</button>
              <button onClick={() => setActiveTab('weekly')}>Weekly Quiz</button>
              <button onClick={() => setActiveTab('monthly')}>Monthly Challenge</button>
            </div>

            {/* Render Instructor Form */}
            {renderInstructorForm()}
          </div>
        </div>
      </div>
    ) : null
  );
};

export default QuizPage;