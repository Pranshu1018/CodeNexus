import React, { useEffect, useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowRight, 
  Calendar, 
  Check, 
  Star, 
  Users, 
  MessageCircle, 
  Phone, 
  Video, 
  Search, 
  Filter,
  Loader 
} from "lucide-react";
import Button from "../components/Button";
import MatrixBackground from "../components/MatrixBackground";
import { useRole } from "../context/RoleContext";
import RoleContext from '../context/RoleContext';
import { getUserInfo } from '../hooks/getUserInfo';
import { getVerifiedMentors } from '../services/mentorService';
// Mentor data
const mentors = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Senior Frontend Developer",
    company: "Google",
    bio: "10+ years of experience in frontend development with expertise in React and modern JavaScript.",
    specialties: ["React", "JavaScript", "CSS", "Performance Optimization"],
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1562159278-1253a58da141?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Mon, Wed, Fri",
  },
  {
    id: 2,
    name: "Sarah Chen",
    role: "Full Stack Engineer",
    company: "Microsoft",
    bio: "Full stack developer with a passion for teaching and helping others grow in their development journey.",
    specialties: ["Node.js", "React", "TypeScript", "System Design"],
    rating: 4.8,
    reviews: 93,
    image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Tue, Thu, Sat",
  },
  {
    id: 3,
    name: "Michael Rodriguez",
    role: "DevOps Specialist",
    company: "Amazon",
    bio: "DevOps engineer focused on CI/CD, containerization, and cloud infrastructure.",
    specialties: ["Docker", "Kubernetes", "AWS", "CI/CD Pipelines"],
    rating: 4.7,
    reviews: 85,
    image: "https://plus.unsplash.com/premium_photo-1689977807477-a579eda91fa2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Mon, Thu, Sat",
  },
  {
    id: 4,
    name: "Priya Patel",
    role: "Backend Developer",
    company: "Netflix",
    bio: "Specialized in scalable backend systems and database optimization.",
    specialties: ["Java", "Spring Boot", "Microservices", "Database Design"],
    rating: 4.9,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1517677129300-07b130802f46?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Wed, Fri, Sun",
  },
  {
    id: 5,
    name: "David Kim",
    role: "Mobile Developer",
    company: "Airbnb",
    bio: "Mobile app developer with expertise in React Native and native iOS/Android development.",
    specialties: ["React Native", "iOS", "Android", "Mobile UX"],
    rating: 4.8,
    reviews: 76,
    image: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Tue, Thu, Sun",
  },
  {
    id: 6,
    name: "Emma Wilson",
    role: "UI/UX Designer & Developer",
    company: "Figma",
    bio: "Designer and developer focused on creating beautiful, accessible, and user-friendly interfaces.",
    specialties: ["UI Design", "UX Research", "CSS", "Accessibility"],
    rating: 4.9,
    reviews: 104,
    image: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?q=80&w=2946&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    availability: "Mon, Wed, Fri",
  },
];




// Mentorship plans
const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 99,
    features: [
      "1 session per month",
      "Email support",
      "Code reviews",
      "Career guidance",
    ],
    recommended: false,
  },
  {
    id: "pro",
    name: "Professional",
    price: 199,
    features: [
      "2 sessions per month",
      "Priority email support",
      "Unlimited code reviews",
      "Career guidance",
      "Resume & portfolio review",
      "Mock interviews",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 299,
    features: [
      "4 sessions per month",
      "24/7 chat support",
      "Unlimited code reviews",
      "Career guidance",
      "Resume & portfolio review",
      "Mock interviews",
      "Personalized learning plan",
      "Project collaboration",
    ],
    recommended: false,
  },
];

// Detailed Mentor Modal component (only declared once)
function MentorProfile({ mentor, onClose }) {

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg relative max-w-xl w-full">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 text-3xl">
          &times;
        </button>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img
              src={mentor.image || "/placeholder.svg"}
              alt={mentor.name}
              className="object-cover w-full h-full"
            />
          </div>
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
            {mentor.name}
          </h2>
          <p className="text-gray-300 mt-2">
            {mentor.role} at {mentor.company}
          </p>
          <p className="text-gray-300 mt-4 text-center">{mentor.bio}</p>
          <div className="mt-4 w-full">
            <h3 className="text-xl font-semibold text-gray-300">Specialties</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {mentor.specialties.map((s, index) => (
                <span key={index} className="bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-300">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center mt-4">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-gray-300">
              {mentor.rating} / 5 ({mentor.reviews} reviews)
            </span>
          </div>
          <div className="mt-4">
            <Calendar className="inline-block h-5 w-5 text-gray-400 mr-2" />
            <span className="text-gray-300">Availability: {mentor.availability}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentorshipPage() {
  const [selectedMentor, setSelectedMentor] = useState(null);
  const { role, setRole } = useContext(RoleContext);
  const { userId, isAuth } = getUserInfo();
  const navigate = useNavigate();
  
  // Real mentor data from Firebase
  const [realMentors, setRealMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  
  useEffect(() => {
    if (role === 'user') {
      fetchMentors();
    }
  }, [role]);
  
  const fetchMentors = async () => {
    try {
      setLoading(true);
      const mentorsList = await getVerifiedMentors();
      setRealMentors(mentorsList);
      setFilteredMentors(mentorsList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter mentors based on search and expertise
  useEffect(() => {
    let filtered = realMentors;

    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedExpertise !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.expertise?.includes(selectedExpertise)
      );
    }

    setFilteredMentors(filtered);
  }, [searchTerm, selectedExpertise, realMentors]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleChat = (mentorId) => {
    navigate(`/mentor-chat/${mentorId}`);
  };

  const handleVoiceCall = (mentorId) => {
    navigate(`/mentor-call/${mentorId}?type=voice`);
  };

  const handleVideoCall = (mentorId) => {
    navigate(`/mentor-call/${mentorId}?type=video`);
  };
  
  // Get unique expertise areas
  const expertiseAreas = [...new Set(realMentors.flatMap(m => m.expertise || []))];  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Animate mentor cards
    const mentorCards = document.querySelectorAll(".mentor-card");
    gsap.fromTo(
      mentorCards,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    );

    // Animate plan cards
    const planCards = document.querySelectorAll(".plan-card");
    gsap.fromTo(
      planCards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".plans-section",
          start: "top 80%",
        },
      }
    );
  }, []);

  const navigateToMentor = () => {
    navigate('/mentor');
  };

  return (
    role  === 'user' ? (
    <>
      <MatrixBackground opacity={0.03} />

      {/* Header Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Personalized Mentorship
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Connect with experienced developers who will guide you through your learning journey and help you achieve your career goals.
            </p>
            <Button size="lg" className="animate-glow">
              Find Your Mentor
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
            How Mentorship Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-neon-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon-green">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Match with a Mentor</h3>
              <p className="text-gray-300">
                Browse our network of experienced developers and find someone who aligns with your learning goals.
              </p>
            </div>
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-neon-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon-blue">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Schedule Sessions</h3>
              <p className="text-gray-300">
                Book one-on-one video sessions at times that work for you and your mentor.
              </p>
            </div>
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 text-center shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-neon-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-neon-purple">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Grow Your Skills</h3>
              <p className="text-gray-300">
                Receive personalized guidance, code reviews, and continuous support to accelerate your growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Time Mentor Connection Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Connect with Mentors
            </h2>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <Users className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400">{filteredMentors.length} mentors available</span>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={selectedExpertise}
              onChange={(e) => setSelectedExpertise(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Expertise</option>
              {expertiseAreas.map((exp) => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          </div>
          
          {/* Mentors Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader className="w-12 h-12 text-purple-500 animate-spin" />
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No mentors found matching your criteria</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="mentor-card bg-gray-900/80 rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition-all duration-300 shadow-lg"
                >
                  {/* Mentor Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold">
                        {mentor.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{mentor.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(mentor.status)}`} />
                          <span className="text-sm text-gray-400">{getStatusText(mentor.status)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{mentor.bio}</p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise?.slice(0, 3).map((exp, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium"
                      >
                        {exp}
                      </span>
                    ))}
                    {mentor.expertise?.length > 3 && (
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                        +{mentor.expertise.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-700">
                    <div>
                      <div className="flex items-center gap-1 text-yellow-400 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{mentor.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <p className="text-xs text-gray-400">{mentor.totalRatings || 0} ratings</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-blue-400 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-bold">{mentor.experience || 0}+ yrs</span>
                      </div>
                      <p className="text-xs text-gray-400">Experience</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleChat(mentor.id)}
                      disabled={mentor.status === 'offline'}
                      className="flex flex-col items-center gap-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Chat"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">Chat</span>
                    </button>
                    <button
                      onClick={() => handleVoiceCall(mentor.id)}
                      disabled={mentor.status !== 'available'}
                      className="flex flex-col items-center gap-1 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Voice Call"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="text-xs">Call</span>
                    </button>
                    <button
                      onClick={() => handleVideoCall(mentor.id)}
                      disabled={mentor.status !== 'available'}
                      className="flex flex-col items-center gap-1 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      title="Video Call"
                    >
                      <Video className="w-5 h-5" />
                      <span className="text-xs">Video</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Mentorship Plans Section */}
      <section className="py-16 bg-gray-900/30 plans-section relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Mentorship Plans
            </h2>
            <p className="text-gray-300">
              Choose a plan that fits your learning needs and budget. All plans include access to our mentor network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card bg-gray-900/80 rounded-xl overflow-hidden border ${
                  plan.recommended ? "border-neon-green glow-border" : "border-gray-800"
                } transition-all duration-300 relative shadow-lg`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-0 right-0 bg-neon-green text-black text-center py-1 text-sm font-semibold">
                    Recommended
                  </div>
                )}
                <div className="p-6 pt-8">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-neon-green mr-2 shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={plan.recommended ? "default" : "outline"} className="w-full">
                    Choose Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 text-gray-300 text-sm">
            All plans include a 7-day free trial. Cancel anytime.
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
            Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-300 mb-4">
                "Working with my mentor transformed my career. I went from struggling with basic concepts to landing a job at a top tech company in just 6 months."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Jason Taylor</div>
                  <div className="text-gray-400 text-sm">Frontend Developer at Spotify</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-300 mb-4">
                "The personalized guidance I received was invaluable. My mentor helped me identify gaps in my knowledge and create a learning plan that worked for me."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Maria Garcia</div>
                  <div className="text-gray-400 text-sm">Full Stack Developer at Shopify</div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="flex items-center mb-4">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-gray-300 mb-4">
                "The code reviews and feedback I received helped me level up my skills faster than any course or tutorial could. Worth every penny!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                <div>
                  <div className="font-semibold">Raj Patel</div>
                  <div className="text-gray-400 text-sm">Backend Engineer at Stripe</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto bg-gray-900/80 p-8 md:p-12 rounded-xl border border-gray-800 glow-border text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">
              Ready to Accelerate Your Learning?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join our mentorship program today and get personalized guidance from industry experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="animate-glow">
                Find a Mentor
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {selectedMentor && (
        <MentorProfile mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />
      )}
    </>
    ) : role === 'instructor' ? (
      <div>
        {/* Instructor Dashboard Content */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
                Instructor Dashboard
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed mb-8">
                Welcome back, Instructor! Manage your profile, view your mentee progress, and track your sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Instructor Profile Section */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Your Profile
            </h2>
            <div className="flex justify-center">
              <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 text-center shadow-lg">
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1689708721750-8a0e6dc14cee?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dg" // Replace with instructor's profile image
                    alt="Instructor"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">Instructor Name</h3>
                <p className="text-gray-300">Full Stack Developer</p>
                <p className="text-gray-300 mt-4">I specialize in guiding learners through modern web development, offering tailored advice, code reviews, and career guidance.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mentee Overview Section */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Your Mentees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Mentee Cards */}
              <div className="bg-gray-900/80 rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-bold">Mentee Name</h3>
                <p className="text-gray-300">Frontend Developer</p>
                <p className="text-gray-300 mt-2">Currently working on React and JavaScript. Looking for guidance on performance optimization and best practices.</p>
                <Button variant="neon" size="sm" className="mt-4">View Progress</Button>
              </div>
              {/* Add more mentee cards here */}
            </div>
          </div>
        </section>

        {/* Session Management Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Upcoming Sessions
            </h2>
            <div className="bg-gray-900/80 p-6 rounded-xl border border-gray-800 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Session with Mentee Name</h3>
                  <p className="text-gray-300">Topic: React Performance Optimization</p>
                  <p className="text-gray-400 text-sm">Scheduled for: March 10th, 2025</p>
                </div>
                <Button variant="neon" size="sm" onClick={navigateToMentor}>Join Session</Button>
              </div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold">Session with Mentee Name</h3>
                  <p className="text-gray-300">Topic: Backend Architecture</p>
                  <p className="text-gray-400 text-sm">Scheduled for: March 12th, 2025</p>
                </div>
                <Button variant="neon" size="sm">Join Session</Button>
              </div>
              {/* Add more sessions here */}
            </div>
          </div>
        </section>

        {/* Instructor Feedback Section */}
        <section className="py-16 bg-gray-900/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500 neon-glow">
              Feedback from Mentees
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feedback Cards */}
              <div className="bg-gray-900/60 p-6 rounded-xl border border-gray-800 shadow-lg">
                <div className="mb-4">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
                <p className="text-gray-300 mb-4">"Working with this instructor has been amazing. I've learned so much about modern JavaScript and feel confident applying these skills to my work."</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-700 rounded-full mr-3"></div>
                  <div>
                    <div className="font-semibold">Mentee Name</div>
                    <div className="text-gray-400 text-sm">Frontend Developer</div>
                  </div>
                </div>
              </div>
              {/* Add more feedback cards here */}
            </div>
          </div>
        </section>
      </div>
    ) : null

  );
}
