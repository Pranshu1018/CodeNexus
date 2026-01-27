import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { Plus } from "lucide-react";
import Button from "../components/Button";
import MatrixBackground from "../components/MatrixBackground";

export default function AddQuiz() {
  const [step, setStep] = useState(1);

  // Quiz basic info state
  const [quizInfo, setQuizInfo] = useState({
    title: "",
    description: "",
    numberOfQuestions: "",
  });

  // Questions state: an array of question objects
  const [questions, setQuestions] = useState([]);

  // All quizzes that have been added
  const [quizzes, setQuizzes] = useState([]);

  // Handle changes in the quiz info form (Step 1)
  const handleQuizInfoChange = (e) => {
    setQuizInfo({ ...quizInfo, [e.target.name]: e.target.value });
  };

  // Handle submission of quiz info form
  const handleQuizInfoSubmit = (e) => {
    e.preventDefault();
    const num = parseInt(quizInfo.numberOfQuestions, 10);
    if (!quizInfo.title || !quizInfo.description || !num || num <= 0) {
      alert("Please fill in all required fields with valid data.");
      return;
    }
    // Initialize questions array with empty question text and four empty options for each question
    const initialQuestions = Array.from({ length: num }, () => ({
      question: "",
      options: ["", "", "", ""],
    }));
    setQuestions(initialQuestions);
    setStep(2);
  };

  // Handle changes to a specific question’s text
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  // Handle changes to a specific option for a question
  const handleOptionChange = (qIndex, oIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  // Handle final submission of the quiz (Step 2)
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    // Simple validation: Ensure each question and all four options are filled
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() || q.options.some((opt) => !opt.trim())) {
        alert(`Please fill in all fields for Question ${i + 1}.`);
        return;
      }
    }
    // Create a new quiz object
    const newQuiz = {
      id: Date.now(),
      ...quizInfo,
      questions,
    };
    setQuizzes([...quizzes, newQuiz]);
    // Reset all form states and go back to step 1
    setQuizInfo({ title: "", description: "", numberOfQuestions: "" });
    setQuestions([]);
    setStep(1);
  };

  // Animate quiz cards when new quizzes are added
  useEffect(() => {
    gsap.fromTo(
      ".quiz-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );
  }, [quizzes]);

  // Scroll to top when the page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <MatrixBackground opacity={0.03} />

      {/* Header & Form Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 mb-6 neon-glow">
              Add Quiz
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Create a new quiz by filling in the details and adding questions.
            </p>

            {/* Step 1: Basic Quiz Info */}
            {step === 1 && (
              <form
                onSubmit={handleQuizInfoSubmit}
                className="bg-gray-900/80 p-6 rounded-lg shadow-lg max-w-lg mx-auto"
              >
                <div className="mb-4">
                  <label htmlFor="title" className="block text-gray-300 mb-2">
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={quizInfo.title}
                    onChange={handleQuizInfoChange}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green text-white"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-gray-300 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={quizInfo.description}
                    onChange={handleQuizInfoChange}
                    rows="4"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green text-white"
                    required
                  ></textarea>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="numberOfQuestions"
                    className="block text-gray-300 mb-2"
                  >
                    Number of Questions{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="numberOfQuestions"
                    name="numberOfQuestions"
                    value={quizInfo.numberOfQuestions}
                    onChange={handleQuizInfoChange}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green text-white"
                    required
                  />
                </div>
                <Button variant="neon" size="md" type="submit">
                  Next: Add Questions
                </Button>
              </form>
            )}

            {/* Step 2: Questions & Options */}
            {step === 2 && (
              <form
                onSubmit={handleQuizSubmit}
                className="bg-gray-900/80 p-6 rounded-lg shadow-lg max-w-3xl mx-auto"
              >
                <h2 className="text-2xl font-bold text-gray-300 mb-4">
                  Enter Questions
                </h2>
                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="mb-6 border border-gray-800 p-4 rounded-lg"
                  >
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">
                        Question {qIndex + 1}
                      </label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) =>
                          handleQuestionChange(qIndex, e.target.value)
                        }
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green text-white"
                        placeholder="Enter your question"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex}>
                          <label className="block text-gray-300 mb-2">
                            Option {oIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-green text-white"
                            placeholder={`Enter option ${oIndex + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <Button variant="neon" size="md" type="submit">
                  Submit Quiz
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Display Added Quizzes Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-300 mb-8 text-center">
            Added Quizzes
          </h2>
          {quizzes.length > 0 ? (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="quiz-card bg-gray-900/80 p-6 rounded-lg shadow-lg border border-gray-800 mb-8"
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  {quiz.title}
                </h3>
                <p className="text-gray-300 mb-4">{quiz.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quiz.questions.map((question, index) => (
                    <div
                      key={index}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-700"
                    >
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Q{index + 1}: {question.question}
                      </h4>
                      <ul className="list-disc list-inside text-gray-300">
                        {question.options.map((option, oIndex) => (
                          <li key={oIndex}>{option}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">
              <p>No quizzes added yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}