import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAddInfo } from "../hooks/useAddInfo";
import { getUserInfo } from "../hooks/getUserInfo";
import { createMentor } from "../services/mentorService";
import { Users, GraduationCap, BookOpen } from "lucide-react";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student", // student, mentor, or instructor
  });

  const { isAuth } = getUserInfo();
  const { addUser } = useAddInfo();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(""); // Clear error on input change
  };

  const handleLogin = async () => {
    navigate('/login');
  }

  const createUser = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      // Create a new user with Firebase
      const result = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password,
      );
     
      // Save user data to Firestore
      const authInfo = {
        userId: result.user.uid,
        name: formData.name,
        email: result.user.email,
        displayName: formData.name,
        isAuth: true,
      };

      console.log('User created:', authInfo);

      // Save to Firestore
      await addUser({
        name: formData.name,
        email: result.user.email,
        userId: result.user.uid,
        role: formData.role,
      });

      // If signing up as mentor, create mentor profile automatically
      if (formData.role === 'mentor') {
        await createMentor({
          userId: result.user.uid,
          name: formData.name,
          email: result.user.email,
          bio: `${formData.name} is a mentor on CodeNexus`,
          expertise: ['Programming', 'Software Development'],
          experience: 0,
          hourlyRate: 0,
          availability: [],
          verified: true, // Auto-verified for instant access
        });
        setSuccess("Mentor account created! Redirecting to dashboard...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/mentor-dashboard"), 1000);
      } else if (formData.role === 'instructor') {
        setSuccess("Instructor account created! Redirecting to creator dashboard...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/creator-dashboard"), 1000);
      } else {
        setSuccess("Signup successful! Redirecting to quiz...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/onboarding-quiz"), 1000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Better error messages
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Please login instead.");
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address. Please check and try again.");
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please use at least 6 characters.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Error creating account. Please try again.");
      }
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Google signup result:", result);
      
      const authInfo = {
        userId: result.user.uid,
        name: result.user.displayName || "Google User",
        email: result.user.email,
        displayName: result.user.displayName || "Google User",
        isAuth: true,
      };

      // Save to Firestore
      await addUser({
        name: result.user.displayName || "Google User",
        email: result.user.email,
        userId: result.user.uid,
        role: formData.role,
      });

      // If signing up as mentor, create mentor profile
      if (formData.role === 'mentor') {
        await createMentor({
          userId: result.user.uid,
          name: result.user.displayName || "Google User",
          email: result.user.email,
          bio: `${result.user.displayName || "Google User"} is a mentor on CodeNexus`,
          expertise: ['Programming', 'Software Development'],
          experience: 0,
          hourlyRate: 0,
          availability: [],
          verified: true,
        });
        setSuccess("Mentor account created! Redirecting to dashboard...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/mentor-dashboard"), 1000);
      } else if (formData.role === 'instructor') {
        setSuccess("Instructor account created! Redirecting to creator dashboard...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/creator-dashboard"), 1000);
      } else {
        setSuccess("Google signup successful! Redirecting to quiz...");
        localStorage.setItem("authInfo", JSON.stringify(authInfo));
        setTimeout(() => navigate("/onboarding-quiz"), 1000);
      }
    } catch (error) {
      console.error("Google signup error:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Signup cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please enable popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setError("Network error. Please check your connection.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError("An account with this email already exists. Please login.");
      } else {
        setError("Google signup failed. Please try again.");
      }
      setSuccess("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      setSuccess("");
      return;
    }

    // Validate name
    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      setSuccess("");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setSuccess("");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSuccess("");
      return;
    }

    createUser();
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Dark green to dark gray gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-gray-900 opacity-30 blur-2xl animate-pulse"></div>
      
      {/* Glassmorphism container */}
      <div className="bg-white/5 p-8 rounded-lg shadow-lg w-full max-w-md relative backdrop-blur-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">
          Signup / <span onClick={handleLogin} className="cursor-pointer text-green-500 hover:text-green-400 transition-colors">Login</span>
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
          {/* Name Input */}
          <div className="relative">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="Full Name"
              autoComplete="name"
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
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              placeholder="Password (min 6 characters)"
              autoComplete="new-password"
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

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              I want to join as:
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'student' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.role === 'student'
                    ? 'border-green-500 bg-green-900/30 text-green-300'
                    : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <GraduationCap className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Student</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'mentor' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.role === 'mentor'
                    ? 'border-purple-500 bg-purple-900/30 text-purple-300'
                    : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <Users className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Mentor</div>
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'instructor' })}
                className={`p-3 rounded-lg border-2 transition-all ${
                  formData.role === 'instructor'
                    ? 'border-blue-500 bg-blue-900/30 text-blue-300'
                    : 'border-gray-700 bg-gray-900/50 text-gray-400 hover:border-gray-600'
                }`}
              >
                <BookOpen className="w-6 h-6 mx-auto mb-1" />
                <div className="text-xs font-medium">Instructor</div>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {formData.role === 'student' && '• Learn from courses, mentors, and challenges'}
              {formData.role === 'mentor' && '• Guide students through 1-on-1 mentorship'}
              {formData.role === 'instructor' && '• Create and publish courses'}
            </p>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-800 text-white py-3 rounded hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "Creating Account..." : "Signup"}
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
            {isLoading ? "Processing..." : "Sign up with Google"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;