import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import UserProfile from "./UserProfile/UserProfile";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import img1 from '../assets/Progress/img1.jpg';
import img2 from '../assets/Progress/img2.jpg';
import img4 from '../assets/Progress/img4.jpg';
import {
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Code,
  FileText,
  Layers,
  Zap,
} from "lucide-react";

const BASE_URL = "http://127.0.0.1:8000"; // Update if needed

const ProgressTracker = () => {
  const headerRef = useRef(null);
  const statsRef = useRef(null);
  const coursesRef = useRef(null);
  const analyticsRef = useRef(null);
  
  const [quizChart, setQuizChart] = useState("");
  const [studyTimeChart, setStudyTimeChart] = useState("");
  const [skillChart, setSkillChart] = useState("");
  const [predictionData, setPredictionData] = useState(null);

  useEffect(() => {
    setQuizChart(`${BASE_URL}/quiz-performance-chart`);
    setStudyTimeChart(`${BASE_URL}/weekly-study-time-chart`);
    setSkillChart(`${BASE_URL}/skill-distribution-chart`);
  }, []);
<UserProfile />
  // Sample data for course completion
  const courseCompletionData = [
    {
      id: 1,
      title: "Full Stack Web Development",
      progress: 75,
      modules: 12,
      completedModules: 9,
      icon: <Code className="text-green-500" size={24} />,
      color: "green",
    },
    {
      id: 2,
      title: "Advanced C++ Programming",
      progress: 60,
      modules: 10,
      completedModules: 6,
      icon: <FileText className="text-blue-500" size={24} />,
      color: "blue",
    },
    {
      id: 3,
      title: "Python for Data Science",
      progress: 90,
      modules: 8,
      completedModules: 7,
      icon: <Layers className="text-purple-500" size={24} />,
      color: "purple",
    },
    {
      id: 4,
      title: "Java Programming Fundamentals",
      progress: 40,
      modules: 15,
      completedModules: 6,
      icon: <BookOpen className="text-pink-500" size={24} />,
      color: "pink",
    },
  ];

  const achievementsData = [
    {
      title: "Perfect Score",
      description: "Achieved 100% on 5 quizzes",
      icon: <Award className="text-yellow-500" size={20} />,
    },
    {
      title: "Streak Master",
      description: "30 days continuous learning",
      icon: <Zap className="text-orange-500" size={20} />,
    },
    {
      title: "Code Ninja",
      description: "Completed 50 coding challenges",
      icon: <Code className="text-green-500" size={20} />,
    },
  ];

  const statsData = [
    { value: "465", label: "Quizzes Taken", icon: <FileText className="text-blue-500" size={24} /> },
    { value: "87%", label: "Average Score", icon: <Activity className="text-green-500" size={24} /> },
    { value: "42", label: "Days Streak", icon: <Zap className="text-purple-500" size={24} /> },
    { value: "12", label: "Courses Enrolled", icon: <BookOpen className="text-pink-500" size={24} /> },
  ];

  // Fetch prediction from FastAPI endpoint on component mount
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        // Sample input data that matches your model's features
        const sampleData = {
          average_time_per_problem: 12.5,
          success_rate: 0.75,
          problems_solved: 150,
          rating: 1800,
          max_rating: 2000,
        };

        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sampleData),
        });

        const result = await response.json();
        setPredictionData(result);
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    };

    fetchPrediction();
  }, []);

  // GSAP animations
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Header animation
    gsap.fromTo(
      ".header-content > *",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: "power3.out" }
    );

    // Stats animation
    gsap.fromTo(
      ".stat-card",
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
      }
    );

    // Courses animation
    gsap.fromTo(
      ".course-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: coursesRef.current, start: "top 80%" },
      }
    );

    // Analytics animation
    gsap.fromTo(
      ".chart-card",
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: analyticsRef.current, start: "top 80%" },
      }
    );

    // Animated background (Matrix effect)
    const canvas = document.getElementById("matrix-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const characters = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789";
      const columns = canvas.width / 20;
      const drops = new Array(Math.floor(columns)).fill(1);
      function draw() {
        ctx.fillStyle = "rgba(10, 14, 23, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0f0";
        ctx.font = "15px monospace";
        for (let i = 0; i < drops.length; i++) {
          const text = characters.charAt(Math.floor(Math.random() * characters.length));
          ctx.fillText(text, i * 20, drops[i] * 20);
          if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
      const matrixInterval = setInterval(draw, 33);
      return () => clearInterval(matrixInterval);
    }
  }, []);

  // Render progress bar for course cards
  const renderProgressBar = (progress, color) => (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`h-2.5 rounded-full bg-${color}-500`} style={{ width: `${progress}%` }}></div>
    </div>
  );

  return (
    <div className="overflow-hidden">
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"></canvas>

      {/* Header Section with Model Prediction */}
      <section ref={headerRef} className="relative pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="header-content space-y-6 z-10 max-w-4xl mx-auto text-center">
            <div className="inline-block bg-green-500/20 px-4 py-1 rounded-full text-green-400 text-sm font-medium">
              Your Learning Journey
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Track Your <span className="gradient-text">Progress</span> & Performance
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
              Monitor your learning journey, analyze quiz performance, and track course completion all in one place.
            </p>

            {/* Display Model Prediction if available */}
            {predictionData && (
              <div className="mt-8 p-4 bg-gray-800 rounded-lg">
                <h2 className="text-2xl font-bold text-green-400">
                  Your Progress Score: {predictionData.progress_score.toFixed(2)}
                </h2>
                <p className="text-gray-400 mt-2">{predictionData.suggestion}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-card card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Progress Section */}
      <section ref={coursesRef} className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Your <span className="gradient-text">Course</span> Progress
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Track your progress across all enrolled courses and continue where you left off.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {courseCompletionData.map((course) => (
              <div key={course.id} className="course-card card p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 bg-${course.color}-500/20 rounded-lg flex items-center justify-center`}>
                    {course.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mb-3">
                      <Clock size={16} className="mr-1" />
                      <span>
                        {course.completedModules} of {course.modules} modules completed
                      </span>
                    </div>
                    {renderProgressBar(course.progress, course.color)}
                    <div className="flex justify-between mt-2 text-sm">
                      <span className="text-gray-400">{course.progress}% Complete</span>
                      <Link
                        to={`/courses/${course.id}`}
                        className={`text-${course.color}-500 hover:text-${course.color}-400`}
                      >
                        Continue Learning →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/courses" className="btn-secondary">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section ref={analyticsRef} className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Performance <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Visualize your quiz performance and learning patterns to identify strengths and areas for improvement.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Quiz Performance Chart */}
            <div className="chart-card card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <BarChart className="text-blue-500 mr-2" size={20} />
                Quiz Performance by Topic
              </h3>
              <div className="h-80 flex items-center justify-center relative  rounded-lg overflow-hidden">
                <img src={img1} alt="Quiz Performance Chart" className="w-9/10 h-full object-contain" />
                
              </div>
            </div>

            {/* Weekly Study Time Chart */}
            <div className="chart-card card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <LineChart className="text-green-500 mr-2" size={20} />
                Weekly Study Time (minutes)
              </h3>
              <div className="h-80 flex items-center justify-center relative rounded-lg overflow-hidden">
                <img src={img2} alt="Weekly Study Time Chart" className="w-9/10 h-full object-contain" />
                
              </div>
            </div>

            {/* Skill Distribution Chart */}
            <div className="chart-card card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <PieChart className="text-purple-500 mr-2" size={20} />
                Skill Distribution
              </h3>
              <div className="h-80 flex items-center justify-center relative rounded-lg overflow-hidden">
                <img src={img4} alt="Skill Distribution Chart" className="w-9/10 h-full object-contain" />
                
              </div>
            </div>

            {/* Achievements */}
            <div className="chart-card card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Award className="text-yellow-500 mr-2" size={20} />
                Recent Achievements
              </h3>
              <div className="space-y-4">
                {achievementsData.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      {achievement.icon}
                    </div>
                    <div>
                      <h4 className="font-bold">{achievement.title}</h4>
                      <p className="text-sm text-gray-400">{achievement.description}</p>
                    </div>
                    <div className="ml-auto">
                      <CheckCircle className="text-green-500" size={20} />
                    </div>
                  </div>
                ))}
                <div className="text-center mt-4">
                  <Link to="/achievements" className="text-blue-500 hover:text-blue-400 text-sm">
                    View All Achievements →
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link to="/analytics" className="btn-primary">
              View Detailed Analytics
            </Link>
          </div>
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Personalized <span className="gradient-text">Recommendations</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Based on your performance and learning patterns, we recommend these resources to help you improve.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <FileText className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Advanced JavaScript Concepts</h3>
              <p className="text-gray-400 mb-4">
                Strengthen your JavaScript skills with this advanced tutorial on closures and prototypes.
              </p>
              <Link to="/courses" className="inline-block text-blue-500 hover:text-blue-400">
                Start Learning →
              </Link>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <Code className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">C++ Data Structures</h3>
              <p className="text-gray-400 mb-4">
                Improve your understanding of data structures implementation in C++ with practical examples.
              </p>
              <Link to="/" className="inline-block text-green-500 hover:text-green-400">
                Explore Now →
              </Link>
            </div>
            <div className="card group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Activity className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Algorithm Challenges</h3>
              <p className="text-gray-400 mb-4">
                Practice these algorithm challenges to improve your problem-solving skills and coding efficiency.
              </p>
              <Link to="/exercises" className="inline-block text-purple-500 hover:text-purple-400">
                Take Challenge →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgressTracker;