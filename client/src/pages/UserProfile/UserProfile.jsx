import React, { useState } from "react";
import { User, MapPin, Award, Code, Github, Linkedin, FileText, Edit2, Save, X, Star, Trophy, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
const UserProfile = () => {
  // Hardcoded User Data
  const initialUserData = {
    name: "Tanishk Dhope",
    age: 19,
    rank: 1,
    points: 2500,
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "HTML",
      "CSS",
      "Git",
      "GSAP",
      "Three.js",
      "Firebase",
    ],
    bio: "Frontend developer passionate about creating interactive and high-performance web applications.",
    location: "Pune, India",
    badges: ["Top Coder", "React Master", "Open Source Contributor"],
    profilePic: "",
    github: "https://github.com/tanishkdhope",
    linkedin: "https://linkedin.com/in/tanishkdhope",
    resumeUrl: "https://tanishkdhope-resume.com",
    problemsSolved: 150,
    streak: 42,
    contributions: 230,
  };
  const navigate = useNavigate();

  const [userData, setUserData] = useState(initialUserData);
  const [isEditing, setIsEditing] = useState(false);
  const [newBio, setNewBio] = useState(userData.bio);

  const handleEditToggle = () => {
    if (isEditing) {
      setNewBio(userData.bio); // Reset if canceling
    }
    setIsEditing(!isEditing);
  };

  const handleBioChange = (e) => {
    setNewBio(e.target.value);
  };

  const handleSaveBio = () => {
    setUserData({ ...userData, bio: newBio });
    setIsEditing(false);
  };

  const handleCreateResume = () => {
    navigate("/resume");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden mb-8 border border-gray-700">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-500">
            <div className="absolute inset-0 bg-black opacity-20"></div>
          </div>
          
          <div className="relative px-6 pb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 mb-6">
              <div className="relative">
                <img
                  src={userData.profilePic || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500"}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-xl"
                />
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  {userData.name}
                </h1>
                <div className="flex items-center justify-center sm:justify-start mt-2 text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{userData.location}</span>
                  <span className="mx-2">•</span>
                  <span>{userData.age} years old</span>
                </div>
              </div>

              <button
                onClick={handleCreateResume}
                className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                Create Resume
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 p-4 rounded-xl border border-blue-700/50">
                <div className="flex items-center justify-between">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-xs text-gray-400">Rank</span>
                </div>
                <p className="text-2xl font-bold mt-2">#{userData.rank}</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 p-4 rounded-xl border border-purple-700/50">
                <div className="flex items-center justify-between">
                  <Star className="w-6 h-6 text-purple-400" />
                  <span className="text-xs text-gray-400">Points</span>
                </div>
                <p className="text-2xl font-bold mt-2">{userData.points}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 p-4 rounded-xl border border-green-700/50">
                <div className="flex items-center justify-between">
                  <Target className="w-6 h-6 text-green-400" />
                  <span className="text-xs text-gray-400">Solved</span>
                </div>
                <p className="text-2xl font-bold mt-2">{userData.problemsSolved}</p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 p-4 rounded-xl border border-orange-700/50">
                <div className="flex items-center justify-between">
                  <Award className="w-6 h-6 text-orange-400" />
                  <span className="text-xs text-gray-400">Streak</span>
                </div>
                <p className="text-2xl font-bold mt-2">{userData.streak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-blue-400" />
              About Me
            </h3>
            <button
              onClick={isEditing ? handleSaveBio : handleEditToggle}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isEditing
                  ? "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                  : "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4" />
                  Edit
                </>
              )}
            </button>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                className="w-full p-4 bg-gray-900 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                value={newBio}
                onChange={handleBioChange}
                rows="4"
                placeholder="Tell us about yourself..."
              />
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-gray-300 leading-relaxed text-lg">{userData.bio}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Skills Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Code className="w-6 h-6 text-green-400" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {userData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-teal-700 transition-all duration-200 cursor-default shadow-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Badges Section */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400" />
              Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              {userData.badges.map((badge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 cursor-default transform hover:scale-105"
                >
                  <span className="mr-2">🏆</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-700">
          <h3 className="text-2xl font-bold mb-6 text-center">Connect With Me</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={userData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </a>
            <a
              href={userData.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Linkedin className="w-5 h-5" />
              <span className="font-medium">LinkedIn</span>
            </a>
            <a
              href={userData.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">View Resume</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;