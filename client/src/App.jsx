import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage'
import RoadmapsDetail from './pages/Roadmap/RoadmapsDetails' // Import the RoadmapsDetail component
import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import QuizPage from './pages/QuizPage';
import RecruitmentPage from './pages/RecruitmentPage';
import HackathonPage from './pages/HackathonPage';
import CommunityPage from './pages/CommunityPage';
import Excercises from './pages/Excercises';
import AccessDenied from './pages/AccessDenied';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Test } from './pages/test';
import Editor from './pages/Editor';

import ResumeBuilder from "./pages/Resume"; 
import ProgressTracker from './pages/Progress'
// import AboutPage from './pages/AboutPage';
// import MentorshipPage from './pages/MentorshipPage';
// import SeminarsPage from './pages/SeminarsPage';
import Footer from './components/Footer';
import { RoleProvider } from './context/RoleContext'
import { ThemeProvider } from './context/ThemeContext'
import CoursesPage from './pages/CoursesPage';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import UserProfile from './pages/UserProfile/UserProfile';
import RoadmapHome from './pages/Roadmap/RoadmapHome';
import CourseDetailsPage from "./pages/CourseDetailsPage";
import CourseContentPage from "./pages/CourseContentPage";
import CreatorDashboard from "./pages/CreatorDashboard";
import EnrolledCoursesPage from './pages/EnrolledCourses';
import MentorshipPage from './pages/MentorshipPage'
import Animation from './pages/Checking/Animation'
import MockInterview from './pages/MockInterview'
import InterviewHome from './pages/InterviewHome'
import OnboardingQuiz from './pages/OnboardingQuiz'
import AdminDashboard from './pages/AdminDashboard'
import MentorChat from './pages/MentorChat'
import MentorCall from './pages/MentorCall'
import AddMentorsPage from './pages/AddMentorsPage'
import MentorDashboard from "./pages/MentorDashboard"
import MentorRegistration from './pages/MentorRegistration'

// import Animation from './pages/Checking/Animation'
import Course from './pages/Course'
import Mentor from './pages/Mentor'
import CoursePayment from './pages/CoursePayment'

function App() {
  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Initialize cursor effect
    const cursor = document.querySelector('.cursor');
    
    document.addEventListener('mousemove', (e) => {
      cursor.setAttribute('style', `top: ${e.pageY}px; left: ${e.pageX}px;`);
    });
    
    document.addEventListener('click', () => {
      cursor.classList.add('expand');
      setTimeout(() => {
        cursor.classList.remove('expand');
      }, 500);
    });
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-900 text-gray-100 overflow-x-hidden">
          <div className="cursor"></div>
          <Navbar />
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/progress" element={<ProgressTracker />} />
          <Route path="/quizzes" element={<QuizPage />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          <Route path="/hackathons" element={<HackathonPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path='/exercises' element={<Excercises />} />
          <Route path='/ad' element={<AccessDenied />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/test' element={<Test/>}/>
          <Route  path='/editor' element={<Editor/>}/>
          {/* <Route path="/about" element={<AboutPage />} />
          <Route path="/mentorship" element={<MentorshipPage />} />
          <Route path="/seminars" element={<SeminarsPage />} /> */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/Roadmaps" element={<RoadmapHome />} />
          <Route path="/Mentorship" element={<MentorshipPage />} />
          <Route path="/Animation" element={<Animation />} />
          
          <Route path="/resume" element={<ResumeBuilder />} />
          {/* Added dynamic route for RoadmapsDetail */}          
          <Route path="/Roadmaps/:id" element={<RoadmapsDetail />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
          <Route path="/course-content/:courseId" element={<CourseContentPage />} />
          <Route path="/creator-dashboard" element={<CreatorDashboard />} />
          <Route path="/enrolled-courses" element={<EnrolledCoursesPage />} />
          <Route path="/course" element={<Course />} />
          <Route path='/mentor' element={<Mentor />} />
          <Route path="/coursepayment/:courseId" element={<CoursePayment />} />
          <Route path="/mi/:id" element={<MockInterview />} />
          <Route path="/i" element={<InterviewHome />} />
          <Route path="/onboarding-quiz" element={<OnboardingQuiz />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/mentor-chat/:mentorId" element={<MentorChat />} />
          <Route path="/mentor-call/:mentorId" element={<MentorCall />} />
          <Route path="/add-mentors" element={<AddMentorsPage />} />
          <Route path="/mentor-dashboard" element={<MentorDashboard />} />
          <Route path="/mentor-registration" element={<MentorRegistration />} />
        
        </Routes>
        <Footer />
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;