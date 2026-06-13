import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Local storage keys
const STORAGE_KEYS = {
  CURRENT_SESSION: 'mock_interview_session',
  INTERVIEW_HISTORY: 'mock_interview_history'
};

// Save interview session to localStorage
export const saveSessionToStorage = (session) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, JSON.stringify(session));
  } catch (error) {
    console.error('Error saving session to storage:', error);
  }
};

// Load interview session from localStorage
export const loadSessionFromStorage = () => {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error loading session from storage:', error);
    return null;
  }
};

// Clear current session
export const clearCurrentSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
};

// Save completed interview to history
export const saveInterviewToHistory = (interviewData) => {
  try {
    const history = getInterviewHistory();
    history.push({
      ...interviewData,
      completedAt: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving interview to history:', error);
  }
};

// Get interview history
export const getInterviewHistory = () => {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.INTERVIEW_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error loading interview history:', error);
    return [];
  }
};

// API call to save interview session (if backend is available)
export const saveInterviewSession = async (sessionData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/mockinterview/save`, sessionData);
    return response.data;
  } catch (error) {
    console.error('Error saving interview session to backend:', error);
    // Fallback to local storage if backend fails
    saveSessionToStorage(sessionData);
    return { success: true, message: 'Saved locally' };
  }
};

// API call to get feedback (if AI backend is available)
export const getAnswerFeedback = async (question, answer) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/mockinterview/feedback`, {
      question,
      answer
    });
    return response.data;
  } catch (error) {
    console.error('Error getting feedback from backend:', error);
    // Return basic feedback if backend fails
    return generateBasicFeedback(answer);
  }
};

// Generate basic feedback locally
const generateBasicFeedback = (answer) => {
  const wordCount = answer.trim().split(/\s+/).length;
  const hasExamples = /example|instance|case|situation|time when/i.test(answer);
  const isStructured = /first|second|finally|additionally|moreover/i.test(answer);
  
  let feedback = {
    score: 0,
    strengths: [],
    improvements: []
  };

  // Word count analysis
  if (wordCount < 20) {
    feedback.improvements.push('Try to provide more detailed answers (aim for 50-150 words)');
    feedback.score += 2;
  } else if (wordCount >= 50 && wordCount <= 150) {
    feedback.strengths.push('Good answer length - detailed but concise');
    feedback.score += 4;
  } else if (wordCount > 150) {
    feedback.improvements.push('Consider being more concise in your responses');
    feedback.score += 3;
  } else {
    feedback.score += 3;
  }

  // Content analysis
  if (hasExamples) {
    feedback.strengths.push('Great use of examples to support your answer');
    feedback.score += 3;
  } else {
    feedback.improvements.push('Try adding specific examples to strengthen your answer');
  }

  if (isStructured) {
    feedback.strengths.push('Well-structured response with clear flow');
    feedback.score += 3;
  } else {
    feedback.improvements.push('Use transition words to structure your answer better');
  }

  return feedback;
};

// Calculate overall interview score
export const calculateInterviewScore = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const totalScore = responses.reduce((sum, response) => {
    return sum + (response.feedback?.score || 0);
  }, 0);
  
  const maxScore = responses.length * 10;
  return Math.round((totalScore / maxScore) * 100);
};

// Format duration
export const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};
