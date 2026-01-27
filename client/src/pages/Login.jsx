import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../Firebase/firebase";
import { useNavigate } from "react-router-dom";
import { useAddInfo } from "../hooks/useAddInfo";
import { getUserInfo } from "../hooks/getUserInfo";
import axios from "axios";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignup = () => {
    navigate('/signup');
  }

  const loginUser = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const authInfo = { userId: result.user.uid, email: result.user.email, isAuth: true };
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      setSuccess("Login successful!");
      await axios.post("http://localhost:8000/login", { email: result.user.email }, { withCredentials: true });
      navigate("/");
    } catch (error) {
      setError("Invalid email or password.");
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log(result)
      const authInfo = { userId: result.user.uid, email: result.user.email, isAuth: true };
      localStorage.setItem("authInfo", JSON.stringify(authInfo));
      setSuccess("Login successful!");
      await axios.post("http://localhost:8000/login", { email: result.user.email }, { withCredentials: true });
      navigate("/");  
    } catch (error) {
      setError("Something went wrong. Try again.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    loginUser();
  };

   const { isAuth } = getUserInfo();

   

  useEffect(()=>{
    if(isAuth)
    {
        navigate("/")
    }
  })

  return (
    <div className="w-full h-screen flex items-center justify-center bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-gray-800 opacity-30 blur-2xl animate-pulse"></div>
      <div className="bg-white/5 p-8 rounded-lg shadow-lg w-full max-w-md relative backdrop-blur-md border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Login / <span onClickCapture={handleSignup} className="cursor-pointer text-green-500 hover:text-green-400">Sign Up</span></h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10"
              placeholder="Email"
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
              className="w-full px-4 py-3 bg-gray-900/80 text-white border border-gray-700 rounded focus:ring-2 focus:ring-green-500 pr-10"
              placeholder="Password"
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
            className="w-full bg-green-800 text-white py-3 rounded hover:bg-green-700 transition"
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center bg-gray-800/80 text-white py-3 rounded hover:bg-gray-700 transition"
          >
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z" />
            </svg>
            Sign in with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;