import React from "react";
import { useNavigate } from "react-router-dom";

const ExercisesButton = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-8 left-8 z-50">
      {/* Button */}
      <button
        onClick={() => navigate("/exercises")}
        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold shadow-md rounded-lg 
                   hover:scale-105 hover:shadow-lg hover:from-green-600 hover:to-green-800 
                   transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-green-400"
      >
        🚀 Exercises
      </button>
    </div>
  );
};

export default ExercisesButton;