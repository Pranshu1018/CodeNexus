import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Code } from "lucide-react"; // Assuming you're using lucide-react for icons
import { useNavigate } from "react-router-dom";

const CodeEditorButton = () => {

  const togglePopup = () => {
    navigate("/editor");
  };
  const navigate=useNavigate()

  return (
    <div className="fixed bottom-23 right-8 z-50">

      {/* Button */}
      <button
        onClick={togglePopup}   
        className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
        aria-label="Open code editor"
      >
        <Code size={24} />
      </button>

    
    </div>
  );
};

export default CodeEditorButton;