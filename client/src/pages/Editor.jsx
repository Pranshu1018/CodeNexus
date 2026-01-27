import React, { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { oneDark } from "@codemirror/theme-one-dark";
import { githubLight } from "@uiw/codemirror-theme-github";
import { useTheme } from "../context/ThemeContext.jsx";

import {
  executeCode as judge0Execute,
  formatExecutionResult,
  DEFAULT_CODE_TEMPLATES,
} from "../services/judge0Service";

// Firebase imports - adjust path as needed
import { collection, getDocs } from "../Firebase/firebase.js";
import { db } from "../Firebase/firebase.js"; // Adjust import path

const languageExtensions = {
  71: python(),
  63: javascript(),
  62: java(),
  54: cpp(),
  50: cpp(),
  51: cpp(),
  72: python(),
  60: cpp(),
  73: cpp(),
  68: javascript(),
  74: javascript(),
  83: cpp(),
  78: java(),
  80: python(),
  82: cpp(),
};

const languageNames = {
  71: "Python",
  63: "JavaScript",
  62: "Java",
  54: "C++",
  50: "C",
  51: "C#",
  72: "Ruby",
  60: "Go",
  73: "Rust",
  68: "PHP",
  74: "TypeScript",
  83: "Swift",
  78: "Kotlin",
  80: "R",
  82: "SQL",
};

const Editor = () => {
  const [code, setCode] = useState(DEFAULT_CODE_TEMPLATES[71]);
  const [languageId, setLanguageId] = useState(71);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [isError, setIsError] = useState(false);
  const [activeTab, setActiveTab] = useState("output"); // "output" or "questions"
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const { theme } = useTheme();
  const editorTheme = theme === "dark" ? oneDark : githubLight;

  // Auto scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch questions from Firebase
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoadingQuestions(true);
      try {
        const questionsCollection = collection(db, "questions"); // Adjust collection name
        const questionsSnapshot = await getDocs(questionsCollection);
        const questionsList = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setQuestions(questionsList);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  // Update code template when language changes
  useEffect(() => {
    if (DEFAULT_CODE_TEMPLATES[languageId]) {
      setCode(DEFAULT_CODE_TEMPLATES[languageId]);
    }
  }, [languageId]);

  const handleExecuteCode = async () => {
    setOutput("");
    setIsError(false);
    setLoading(true);
    setOutput("Running...");
    setActiveTab("output"); // Switch to output tab
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const result = await judge0Execute(code, languageId, stdin);
      const formattedResult = formatExecutionResult(result);
      setOutput(formattedResult.output);
      setIsError(formattedResult.isError);
    } catch (error) {
      setOutput(`Error executing code: ${error.message}`);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 w-full max-w-7xl mx-auto p-8 transition-all duration-300 ease-in-out sm:mb-10 sm:mt-20">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r gradient-text mb-4">
          Code Editor
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="w-full md:w-48">
              <label
                htmlFor="language-select"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Language
              </label>
              <select
                id="language-select"
                value={languageId}
                onChange={(e) => setLanguageId(parseInt(e.target.value))}
                className="w-full p-2 bg-gray-800 text-white border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
              >
                {Object.entries(languageNames).map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowStdin(!showStdin)}
                className="px-4 py-2 dark:bg-gray-700 cursor-pointer dark:hover:bg-gray-600 text-white rounded-md transition-colors duration-200 text-sm"
              >
                {showStdin ? "Hide Input" : "Add Input"}
              </button>
            </div>
          </div>
          <button
            onClick={handleExecuteCode}
            disabled={loading}
            className={`w-full md:w-auto px-6 py-2 rounded-md text-white font-medium ${
              loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:from-green-700 active:to-green-800"
            } transition-all duration-200 flex items-center justify-center gap-2 shadow-lg`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Running...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Run Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Standard Input Section */}
      {showStdin && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Standard Input (stdin)
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Enter input for your program here..."
            className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 font-mono text-sm"
            rows="4"
          />
        </div>
      )}

      {/* Main Content Grid: Editor + Questions/Output Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Code Editor - Takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-95 rounded-xl shadow-2xl p-6">
            <div className="border border-gray-700 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <CodeMirror
                value={code}
                theme={theme === "dark" ? oneDark : githubLight}
                extensions={[languageExtensions[languageId]]}
                onChange={(value) => setCode(value)}
                height="500px"
                className="overflow-hidden"
              />
            </div>
          </div>
        </div>

        {/* Questions/Output Panel - Takes 1 column */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-95 rounded-xl shadow-2xl p-6 h-full">
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-gray-700">
              <button
                onClick={() => setActiveTab("output")}
                className={`px-4 py-2 font-medium transition-all duration-200 ${
                  activeTab === "output"
                    ? "text-green-400 border-b-2 border-green-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                Output
              </button>
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 font-medium transition-all duration-200 ${
                  activeTab === "questions"
                    ? "text-green-400 border-b-2 border-green-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                DSA Questions
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "output" ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-300">Output</h3>
                  {output && (
                    <button
                      onClick={() => {
                        setOutput("");
                        setIsError(false);
                      }}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <pre
                  className={`${
                    isError
                      ? "bg-red-900 bg-opacity-30 border-red-500"
                      : "bg-gray-800 border-gray-700"
                  } border text-white p-4 rounded-xl overflow-x-auto whitespace-pre-wrap min-h-96 max-h-[500px] transition-all duration-300 font-mono text-sm overflow-y-auto`}
                >
                  {output || "Your code output will appear here..."}
                </pre>
              </div>
            ) : (
              <div className="h-full">
                <h3 className="text-xl font-semibold text-gray-300 mb-4">DSA Questions</h3>
                {loadingQuestions ? (
                  <div className="flex items-center justify-center h-96">
                    <svg
                      className="animate-spin h-8 w-8 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                ) : questions.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No questions available yet.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {questions.map((question) => (
                      <div
                        key={question.id}
                        onClick={() => setSelectedQuestion(
                          selectedQuestion?.id === question.id ? null : question
                        )}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-all duration-200 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-white font-medium text-sm flex-1">
                            {question.title || question.name}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              question.difficulty === "Easy"
                                ? "bg-green-900 text-green-300"
                                : question.difficulty === "Medium"
                                ? "bg-yellow-900 text-yellow-300"
                                : "bg-red-900 text-red-300"
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        </div>
                        {selectedQuestion?.id === question.id && (
                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-gray-300 text-sm mb-3">
                              {question.description}
                            </p>
                            
                            {/* Examples Section */}
                            {question.examples && question.examples.length > 0 && (
                              <div className="mb-3">
                                <h5 className="text-gray-200 font-medium text-xs mb-2">Examples:</h5>
                                <div className="space-y-2">
                                  {question.examples.map((example, idx) => (
                                    <div key={idx} className="bg-gray-900 rounded p-2 text-xs">
                                      <div className="mb-1">
                                        <span className="text-green-400 font-medium">Input: </span>
                                        <span className="text-gray-300 font-mono">{example.input}</span>
                                      </div>
                                      <div className="mb-1">
                                        <span className="text-blue-400 font-medium">Output: </span>
                                        <span className="text-gray-300 font-mono">{example.output}</span>
                                      </div>
                                      {example.explanation && (
                                        <div>
                                          <span className="text-yellow-400 font-medium">Explanation: </span>
                                          <span className="text-gray-400">{example.explanation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Tags Section */}
                            {question.tags && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {question.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>💡 Tip:</strong> Code is executed using Judge0 API. Select
          your language, write your code, and click "Run Code" to see the
          results. Browse DSA questions on the right panel for practice!
        </p>
      </div>
    </div>
  );
};

export default Editor;