import axios from "axios";

// Judge0 API Configuration
const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "your-rapidapi-key-here";
const RAPIDAPI_HOST = "judge0-ce.p.rapidapi.com";

// Language ID mappings for Judge0
export const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  csharp: 51,
  ruby: 72,
  go: 60,
  rust: 73,
  php: 68,
  typescript: 74,
  swift: 83,
  kotlin: 78,
  r: 80,
  sql: 82,
};

// Default code templates for each language
export const DEFAULT_CODE_TEMPLATES = {
  63: '// JavaScript\nconsole.log("Hello, World!");',
  71: '# Python\nprint("Hello, World!")',
  62: '// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  54: '// C++\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
  50: '// C\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  51: '// C#\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  72: '# Ruby\nputs "Hello, World!"',
  60: '// Go\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  73: '// Rust\nfn main() {\n    println!("Hello, World!");\n}',
  68: '<?php\n// PHP\necho "Hello, World!\\n";\n?>',
  74: '// TypeScript\nconsole.log("Hello, World!");',
  83: '// Swift\nprint("Hello, World!")',
  78: '// Kotlin\nfun main() {\n    println("Hello, World!")\n}',
  80: '# R\nprint("Hello, World!")',
  82: '-- SQL\nSELECT "Hello, World!" AS message;',
};

/**
 * Execute code using Judge0 API
 * @param {string} code - The source code to execute
 * @param {number} languageId - Judge0 language ID
 * @param {string} stdin - Optional standard input
 * @returns {Promise<Object>} - Execution result
 */
export const executeCode = async (code, languageId, stdin = "") => {
  try {
    // Step 1: Submit the code for execution
    const submissionResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: stdin,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      }
    );

    const { token } = submissionResponse.data;

    // Step 2: Get the submission result
    const resultResponse = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
      {
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": RAPIDAPI_HOST,
        },
      }
    );

    return resultResponse.data;
  } catch (error) {
    if (error.response) {
      // API returned an error response
      throw new Error(`Judge0 API Error: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // Network error
      throw new Error("Network Error");
    } else {
      // Other errors
      throw new Error(error.message);
    }
  }
};

/**
 * Format the execution result for display
 * @param {Object} result - Judge0 execution result
 * @returns {Object} - Formatted result with output and error flag
 */
export const formatExecutionResult = (result) => {
  const { status, stdout, stderr, compile_output, message, time, memory } = result;

  // Status descriptions
  const statusDescriptions = {
    1: "In Queue",
    2: "Processing",
    3: "Accepted",
    4: "Wrong Answer",
    5: "Time Limit Exceeded",
    6: "Compilation Error",
    7: "Runtime Error (SIGSEGV)",
    8: "Runtime Error (SIGXFSZ)",
    9: "Runtime Error (SIGFPE)",
    10: "Runtime Error (SIGABRT)",
    11: "Runtime Error (NZEC)",
    12: "Runtime Error (Other)",
    13: "Internal Error",
    14: "Exec Format Error",
  };

  let output = "";
  let isError = false;

  // Handle compilation errors
  if (status.id === 6 && compile_output) {
    output = `Compilation Error:\n${compile_output}`;
    isError = true;
  }
  // Handle runtime errors
  else if (status.id >= 7 && status.id <= 12) {
    output = `Runtime Error (${statusDescriptions[status.id]}):\n${stderr || message || "Unknown runtime error"}`;
    isError = true;
  }
  // Handle time limit exceeded
  else if (status.id === 5) {
    output = `Time Limit Exceeded\n${stderr || ""}`;
    isError = true;
  }
  // Handle internal errors
  else if (status.id === 13 || status.id === 14) {
    output = `Internal Error: ${message || statusDescriptions[status.id]}`;
    isError = true;
  }
  // Handle successful execution
  else if (status.id === 3) {
    output = stdout || "(No output)";
    
    // Append execution stats
    if (time || memory) {
      output += `\n\n--- Execution Stats ---\n`;
      if (time) output += `Time: ${time}s\n`;
      if (memory) output += `Memory: ${memory} KB`;
    }
  }
  // Handle stderr (warnings or errors)
  else if (stderr) {
    output = stderr;
    isError = true;
  }
  // Default case
  else {
    output = stdout || message || "No output";
  }

  return {
    output: output.trim(),
    isError,
    status: statusDescriptions[status.id] || status.description,
  };
};
