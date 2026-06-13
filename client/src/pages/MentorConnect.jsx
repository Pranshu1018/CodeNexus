import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  Phone, 
  Video, 
  Star, 
  Clock,
  Award,
  Search,
  Filter,
  Loader
} from 'lucide-react';
import { getVerifiedMentors, subscribeMentorStatus } from '../services/mentorService';
import { getUserInfo } from '../hooks/getUserInfo';

const MentorConnect = () => {
  const [mentors, setMentors] = useState([]);
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('all');
  const [activeTab, setActiveTab] = useState('mentors'); // mentors, chats, sessions
  
  const { userId, isAuth } = getUserInfo();
  const navigate = useNavigate();
  const [currentUserName, setCurrentUserName] = useState('');

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
      return;
    }
    
    // Get current user's display name
    const authInfo = JSON.parse(localStorage.getItem('authInfo') || '{}');
    setCurrentUserName(authInfo.displayName || authInfo.name || authInfo.email?.split('@')[0] || 'Student');
    
    fetchMentors();
  }, [isAuth, navigate]);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const mentorsList = await getVerifiedMentors();
      setMentors(mentorsList);
      setFilteredMentors(mentorsList);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter mentors based on search and expertise
  useEffect(() => {
    let filtered = mentors;

    if (searchTerm) {
      filtered = filtered.filter(mentor =>
        mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedExpertise !== 'all') {
      filtered = filtered.filter(mentor =>
        mentor.expertise.includes(selectedExpertise)
      );
    }

    setFilteredMentors(filtered);
  }, [searchTerm, selectedExpertise, mentors]);

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

  const handleChat = (mentorId, mentorName) => {
    // Pass both user and mentor names for bidirectional chat
    navigate(`/mentor-chat/${mentorId}`, { 
      state: { 
        userName: currentUserName,
        mentorName: mentorName 
      }
    });
  };

  const handleVoiceCall = (mentorId, mentorName) => {
    // Pass both user and mentor names for bidirectional calls
    navigate(`/mentor-call/${mentorId}?type=voice`, { 
      state: { 
        userName: currentUserName,
        mentorName: mentorName 
      }
    });
  };

  const handleVideoCall = (mentorId, mentorName) => {
    // Pass both user and mentor names for bidirectional calls
    navigate(`/mentor-call/${mentorId}?type=video`, { 
      state: { 
        userName: currentUserName,
        mentorName: mentorName 
      }
    });
  };

  // Get unique expertise areas
  const expertiseAreas = [...new Set(mentors.flatMap(m => m.expertise))];

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mentor Connect
          </h1>
          <p className="text-gray-400">Connect with verified mentors for guidance and support</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('mentors')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'mentors'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="inline w-5 h-5 mr-2" />
            All Mentors
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'chats'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageCircle className="inline w-5 h-5 mr-2" />
            My Chats
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'sessions'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="inline w-5 h-5 mr-2" />
            Upcoming Sessions
          </button>
        </div>

        {/* All Mentors Tab */}
        {activeTab === 'mentors' && (
          <>
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
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-purple-500 transition-all duration-300"
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

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {mentor.expertise.slice(0, 3).map((exp, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium"
                        >
                          {exp}
                        </span>
                      ))}
                      {mentor.expertise.length > 3 && (
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
                          <Award className="w-4 h-4" />
                          <span className="font-bold">{mentor.experience || 0}+ yrs</span>
                        </div>
                        <p className="text-xs text-gray-400">Experience</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleChat(mentor.id, mentor.name)}
                        disabled={mentor.status === 'offline'}
                        className="flex flex-col items-center gap-1 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs">Chat</span>
                      </button>
                      <button
                        onClick={() => handleVoiceCall(mentor.id, mentor.name)}
                        disabled={mentor.status !== 'available'}
                        className="flex flex-col items-center gap-1 p-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <Phone className="w-5 h-5" />
                        <span className="text-xs">Call</span>
                      </button>
                      <button
                        onClick={() => handleVideoCall(mentor.id, mentor.name)}
                        disabled={mentor.status !== 'available'}
                        className="flex flex-col items-center gap-1 p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <Video className="w-5 h-5" />
                        <span className="text-xs">Video</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Chats Tab */}
        {activeTab === 'chats' && (
          <div className="text-center py-20 text-gray-400">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Your chat history will appear here</p>
            <p className="text-sm mt-2">Start a conversation with a mentor to begin</p>
          </div>
        )}

        {/* Upcoming Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="text-center py-20 text-gray-400">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No upcoming sessions scheduled</p>
            <p className="text-sm mt-2">Book a session with a mentor to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorConnect;
