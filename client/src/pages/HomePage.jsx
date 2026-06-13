import { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Code, BookOpen, Users, Award, Zap, MessageSquare, Lightbulb, Calendar, CreditCard } from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import subscriptionService from '../services/subscriptionService';
import API_BASE_URL from '../config/api';

import CodeEditorButton from '../components/CodeEditorButton';
import ExercisesButton from '../components/ExercisesButton';
import RoleContext, { useRole } from '../context/RoleContext';
import Chatbot from './Chatbot';
import SubscriptionModal from '../components/SubscriptionModal';

const HomePage = () => {

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const {role, setUserRole} = useContext(RoleContext);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const { isAuth } = getUserInfo();

  
  // Define your four sentences here.
  const sentences = [
    {
      badge: "Full Stack Development LMS",
      header: (
        <>
          Master <span className="gradient-text">Full Stack</span> Development
        </>
      ),
    },
    {
      badge: "Web-Sockets",
      header: (
        <>
          Learn <span className="gradient-text">Web-Sockets</span> End-to-End
        </>
      ),
    },
    {
      badge: "Django",
      header: (
        <>
          Master <span className="gradient-text">Django</span> Programming
        </>
      ),
    },
    {
      badge: "Pratice Makes the Man Perfect",
      header: (
        <>
          Practice Your <span className="gradient-text ">Coding</span> Skills
        </>
      ),
    },
  ];

  useEffect(() => {
    if(role==="user")
    {
    gsap.registerPlugin(ScrollTrigger);

    // Hero animation for all children of hero-content
    gsap.fromTo(
      '.hero-content > *',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.2, duration: 1, ease: 'power3.out' }
    );

    // Features animation
    gsap.fromTo(
      '.feature-card',
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
        },
      }
    );

    // Stats animation
    gsap.fromTo(
      '.stat-item',
      { scale: 0.8, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
        },
      }
    );

    // CTA animation
    gsap.fromTo(
      '.cta-content',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
        },
      
      }
        
    );
  }
  let matrixInterval
  let sentenceInterval
      window.scrollTo({ top: 0, behavior: "smooth" });
  if(role==="user")
  {
    // Animated background code effect (Matrix effect)
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789';
    const columns = canvas.width / 20;
    const drops = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    function draw() {
      ctx.fillStyle = 'rgba(10, 14, 23, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0f0';
      ctx.font = '15px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

     matrixInterval = setInterval(draw, 33);

    // Toggle between sentences every 3 seconds.
    sentenceInterval = setInterval(() => {
      setCurrentSentenceIndex((prevIndex) => (prevIndex + 1) % sentences.length);
    }, 3000);
  }

    return () => {
      if(role==="user")
      {
      clearInterval(matrixInterval);
      clearInterval(sentenceInterval);
      }
    };
  }, [sentences.length])

  useEffect(() => {
    const checkAndShowModal = async () => {
      try {
        console.log("Checking subscription modal conditions...");
        
        // Only show if user is authenticated
        if (!isAuth) {
          console.log("User not authenticated - skipping modal");
          return;
        }

        // Check if user has already seen the modal THIS SESSION
        const modalShownThisSession = sessionStorage.getItem('subscriptionModalShown');
        if (modalShownThisSession) {
          console.log("Modal already shown this session");
          return;
        }

        // Get user info from localStorage
        const authInfo = JSON.parse(localStorage.getItem('authInfo') || '{}');
        const userEmail = authInfo.email;

        // Check if user has active subscription
        if (userEmail && subscriptionService.hasActiveSubscription(userEmail)) {
          console.log("User has active subscription");
          return;
        }

        // Show modal for authenticated users after 2 seconds
        console.log("Showing subscription modal in 2 seconds...");
        setTimeout(() => {
          console.log("Opening subscription modal now");
          setIsSubscriptionModalOpen(true);
          // Mark as shown for this session
          sessionStorage.setItem('subscriptionModalShown', 'true');
        }, 2000);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    // Check when user is authenticated
    if (isAuth) {
      checkAndShowModal();
    }
  }, [isAuth])

  // Handle modal close - don't mark as permanently seen, just for this session
  const handleCloseModal = () => {
    setIsSubscriptionModalOpen(false);
    // Already marked in sessionStorage, so it won't show again this session
  };

  return (
    role === 'user' ? (
    <div className="overflow-hidden">
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"></canvas>

      <CodeEditorButton />

      <ExercisesButton />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center pt-20 pb-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div className="hero-content space-y-6 z-10">
            {/* Toggling Text Container */}
            <div className="relative min-h-[150px]">
              {sentences.map((item, index) => (
                <div
                  key={index}
                  className={`absolute transition-opacity duration-1000 ${
                    index === currentSentenceIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="inline-block bg-green-500/20 px-4 py-1 rounded-full text-green-400 text-sm font-medium">
                    {item.badge}
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    {item.header}
                  </h1>
                </div>
              ))}
            </div>

            <p className="text-gray-300 text-lg md:text-xl max-w-lg">
              Bridge the gap between theory and practice with our hands-on learning platform designed for aspiring developers.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary">
                Get Started
              </Link>
              <Link to="/courses" className="btn-secondary">
                Learn More
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Over 10,000 developers already learning</span>
            </div>
          </div>
          <div className="hero-content relative hidden md:block">
            <div className="relative bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 p-6 shadow-xl">
              <div className="absolute -top-3 -left-3 w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg -z-10 blur-xl"></div>
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 text-sm text-gray-400">index.js</div>
              </div>
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
                <code>
                  {`import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`}
                </code>
              </pre>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Master Coding</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our platform combines interactive learning, real-world projects, and community support to help you become a professional developer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <BookOpen className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Daily Quizzes</h3>
              <p className="text-gray-400">
                Test your knowledge with daily coding challenges and quizzes to reinforce your learning.
              </p>
              <Link to="/quizzes" className="inline-block mt-4 text-green-500 hover:text-green-400">
                Start Learning →
              </Link>
            </div>
<Chatbot />
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <Award className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Recruitment</h3>
              <p className="text-gray-400">
                Connect with top companies looking for talented developers through our recruitment platform.
              </p>
              <Link to="/recruitment" className="inline-block mt-4 text-blue-500 hover:text-blue-400">
                Find Opportunities →
              </Link>
            </div>

            <div className="feature-card card group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Zap className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Hackathons</h3>
              <p className="text-gray-400">
                Participate in exciting hackathons to solve real-world problems and showcase your skills.
              </p>
              <Link to="/hackathons" className="inline-block mt-4 text-purple-500 hover:text-purple-400">
                Join Events →
              </Link>
            </div>

            <div className="feature-card card group">
              <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
                <MessageSquare className="text-pink-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-gray-400">
                Join our vibrant community of developers to share knowledge, ask questions, and collaborate.
              </p>
              <Link to="/community" className="inline-block mt-4 text-pink-500 hover:text-pink-400">
                Join Discussion →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors">
                <Users className="text-yellow-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Mentorship</h3>
              <p className="text-gray-400">
                Get personalized guidance from industry experts who will help you navigate your coding journey.
              </p>
              <Link to="/mentorship" className="inline-block mt-4 text-yellow-500 hover:text-yellow-400">
                Find a Mentor →
              </Link>
            </div>

            <div className="feature-card card group">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-500/30 transition-colors">
                <Calendar className="text-red-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Seminars</h3>
              <p className="text-gray-400">
                Attend live webinars and seminars on cutting-edge technologies and development practices.
              </p>
              <Link to="/seminars" className="inline-block mt-4 text-red-500 hover:text-red-400">
                View Schedule →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold text-green-500 mb-2">10K+</div>
              <p className="text-gray-400">Active Students</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold text-blue-500 mb-2">500+</div>
              <p className="text-gray-400">Coding Challenges</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-500 mb-2">50+</div>
              <p className="text-gray-400">Expert Mentors</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold text-pink-500 mb-2">95%</div>
              <p className="text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our <span className="gradient-text">Students Say</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Hear from developers who have transformed their careers through our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card relative">
              <div className="absolute -top-4 -left-4 text-5xl text-green-500 opacity-30">"</div>
              <p className="text-gray-300 mb-6 relative z-10">
                This platform completely changed how I approach coding. The daily challenges and mentor feedback helped me land my dream job at a tech startup.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <img src="https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Student" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Alex Johnson</h4>
                  <p className="text-sm text-gray-400">Frontend Developer</p>
                </div>
              </div>
            </div>

            <div className="card relative">
              <div className="absolute -top-4 -left-4 text-5xl text-blue-500 opacity-30">"</div>
              <p className="text-gray-300 mb-6 relative z-10">
                The hackathons were game-changing for me. I built my portfolio through these events and connected with amazing developers who are now my colleagues.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <img src="https://plus.unsplash.com/premium_photo-1690296204289-14e517830d8e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Student" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Samantha Lee</h4>
                  <p className="text-sm text-gray-400">Full Stack Developer</p>
                </div>
              </div>
            </div>

            <div className="card relative">
              <div className="absolute -top-4 -left-4 text-5xl text-purple-500 opacity-30">"</div>
              <p className="text-gray-300 mb-6 relative z-10">
                The community support is incredible. Whenever I got stuck, there was always someone ready to help. The mentorship program accelerated my learning by months.
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden mr-4">
                  <img src="https://images.unsplash.com/photo-1532170579297-281918c8ae72?q=80&w=2968&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Student" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-sm text-gray-400">Backend Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gray-900 rounded-xl p-8 border border-gray-700 shadow-2xl cta-content">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to <span className="gradient-text">Level Up</span> Your Coding Skills?
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join thousands of developers who are building their future with CodeNexus. Start your journey today!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="btn-primary text-center">
                Start Learning Now
              </Link>
              <Link to="/about" className="btn-secondary text-center">
                Explore Our Curriculum
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={handleCloseModal}
        type="both"
      />
    </div>
    ) : role === 'instructor' ? (
      <div className="overflow-hidden">
      {/* Instructor Dashboard Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome to Your Instructor Dashboard
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              As an instructor, you have the ability to manage your courses, mentor students, and track progress.
            </p>
          </div>
  
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Management */}
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                <BookOpen className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Course Management</h3>
              <p className="text-gray-400">
                Create, update, and manage your courses. Track student progress and provide feedback.
              </p>
              <Link to="/instructor/courses" className="inline-block mt-4 text-blue-500 hover:text-blue-400">
                Manage Courses → 
              </Link>
            </div>
  
            {/* Student List */}
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <Users className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Student List</h3>
              <p className="text-gray-400">
                View the list of students enrolled in your courses and monitor their learning progress.
              </p>
              <Link to="/instructor/students" className="inline-block mt-4 text-green-500 hover:text-green-400">
                View Students → 
              </Link>
            </div>
  
            {/* Mentorship Program */}
            <div className="feature-card card group">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Users className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Mentorship</h3>
              <p className="text-gray-400">
                Offer mentorship to students and guide them on their coding journey. Share your expertise.
              </p>
              <Link to="/instructor/mentorship" className="inline-block mt-4 text-purple-500 hover:text-purple-400">
                Become a Mentor → 
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
    ) : null
  );
};

export default HomePage;