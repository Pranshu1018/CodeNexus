// API Configuration
// This file centralizes API endpoints for easier deployment configuration

// Get API URL from environment variable or use localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Export commonly used endpoints
export const endpoints = {
  chat: `${API_BASE_URL}/chat`,
  login: `${API_BASE_URL}/login`,
  checkRole: `${API_BASE_URL}/check-role`,
  generateResume: `${API_BASE_URL}/generate-resume`,
};

export default API_BASE_URL;
