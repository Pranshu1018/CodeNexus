import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAddInfo } from "../hooks/useAddInfo";
import { getUserInfo } from "../hooks/getUserInfo";
import API_BASE_URL from "../config/api";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addUser } = useAddInfo();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error on input change
  };

  const handleSignup = () => {
    navigate('/signup');
  }

  const loginUser = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const authInfo = { 
        userId: result.user.uid, 
        email: result.user.email, 
        isAuth: true 
      };
      
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      setSuccess("Login successful! Redirecting...");
      
      // Call backend login endpoint
      await axios.post(`${API_BASE_URL}/login`, 
        { email: result.user.email }, 
        { withCredentials: true }
      );
      
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up.");
      } else if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google login result:", result);
      
      const authInfo = { 
        userId: result.user.uid, 
        email: result.user.email, 
        name: result.user.displayName,
        isAuth: true 
      };
      
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      
      // Check if user exists in database, if not create them
      try {
        await addUser({
          name: result.user.displayName || "Google User",
          email: result.user.email,
          userId: result.user.uid,
          role: "user",
        });
      } catch (dbError) {
        console.log("User might already exist:", dbError);
      }
      
      // Call backend login endpoint
      await axios.post(`${API_BASE_URL}/login`, 
        { email: result.user.email }, 
        { withCredentials: true }
      );
      
      setSuccess("Google login successful! Redirecting...");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      console.error("Google login error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Login cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please enable popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    loginUser();
  };

  const { isAuth } = getUserInfo();

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-gray-800 opacity-30 blur-2xl animate-pulse"></div>
      <div className="bg-white/5 p-8 rounded-lg shadow-lg w-full max-w-md relative backdrop-blur-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Login / <span onClick={handleSignup} className="cursor-pointer text-green-500 hover:text-green-400 transition-colors">Sign Up</span>
        </h1>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4 text-center">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="Email"
              autoComplete="email"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="Password"
              autoComplete="current-password"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-800 text-white py-3 rounded hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-gray-800/80 text-white py-3 rounded hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
            </svg>
            {isLoading ? "Processing..." : "Sign in with Google"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;