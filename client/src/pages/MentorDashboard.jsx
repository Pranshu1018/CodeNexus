import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Video, 
  MessageCircle, 
  Clock, 
  Check, 
  X,
  Users,
  TrendingUp,
  Star,
  Bell,
  Settings,
  LogOut,
  Loader
} from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import { getMentorById, updateMentorStatus } from '../services/mentorService';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

const MentorDashboard = () => {
  const { userId, isAuth } = getUserInfo();
  const navigate = useNavigate();
  
  const [mentorData, setMentorData] = useState(null);
  const [incomingCalls, setIncomingCalls] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('offline');

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
      return;
    }

    initializeMentorDashboard();
  }, [isAuth, userId]);

  const initializeMentorDashboard = async () => {
    try {
      setLoading(true);
      
      console.log('Checking mentor profile for userId:', userId);
      
      // Get mentor profile
      const mentor = await getMentorById(userId);
      console.log('Mentor profile found:', mentor);
      
      if (!mentor) {
        console.error('No mentor profile found for userId:', userId);
        alert('You are not registered as a mentor. Please sign up as a mentor or contact support.');
        navigate('/');
        return;
      }
      
      if (!mentor.verified) {
        alert('Your mentor profile is pending verification. Please wait for admin approval.');
        navigate('/');
        return;
      }
      
      setMentorData(mentor);
      setStatus(mentor.status || 'offline');
      
      // Subscribe to incoming calls
      subscribeToIncomingCalls();
      
      // Subscribe to active chats
      subscribeToActiveChats();
      
      // Load call history
      loadCallHistory();
      
    } catch (error) {
      console.error('Error initializing mentor dashboard:', error);
      alert('Error loading mentor dashboard. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToIncomingCalls = () => {
    const callsQuery = query(
      collection(db, 'calls'),
      where('receiverId', '==', userId),
      where('status', '==', 'calling')
    );
    
    return onSnapshot(callsQuery, (snapshot) => {
      const calls = [];
      snapshot.forEach((doc) => {
        calls.push({ id: doc.id, ...doc.data() });
      });
      setIncomingCalls(calls);
      
      // Play notification sound if new call
      if (calls.length > 0) {
        playNotificationSound();
      }
    });
  };

  const subscribeToActiveChats = () => {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(chatsQuery, (snapshot) => {
      const chats = [];
      snapshot.forEach((doc) => {
        const chatData = doc.data();
        const unreadCount = chatData.unreadCount?.[userId] || 0;
        if (unreadCount > 0 || chatData.lastMessageTime) {
          chats.push({ id: doc.id, ...chatData });
        }
      });
      
      // Sort by last message time
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
        const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      
      setActiveChats(chats);
    });
  };

  const loadCallHistory = async () => {
    const historyQuery = query(
      collection(db, 'calls'),
      where('receiverId', '==', userId),
      where('status', 'in', ['ended', 'missed', 'rejected'])
    );
    
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const history = [];
      snapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by time
      history.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.() || new Date(0);
        const timeB = b.createdAt?.toDate?.() || new Date(0);
        return timeB - timeA;
      });
      
      setCallHistory(history.slice(0, 10)); // Last 10 calls
    });
    
    return unsubscribe;
  };

  const playNotificationSound = () => {
    // Create audio element for notification
    const audio = new Audio('/notification.mp3'); // Add notification sound to public folder
    audio.play().catch(e => console.log('Could not play notification sound'));
  };

  const handleAcceptCall = async (callId) => {
    try {
      // Update call status
      await updateDoc(doc(db, 'calls', callId), {
        status: 'accepted'
      });
      
      // Navigate to call page as receiver (answering the call)
      const call = incomingCalls.find(c => c.id === callId);
      navigate(`/mentor-call/${call.callerId}?callId=${callId}&type=${call.isVideo ? 'video' : 'voice'}&answer=true`);
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleRejectCall = async (callId) => {
    try {
      await updateDoc(doc(db, 'calls', callId), {
        status: 'rejected',
        rejectedAt: new Date()
      });
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateMentorStatus(userId, newStatus);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Mentor Dashboard
            </h1>
            <p className="text-gray-400">Manage your mentoring sessions and students</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="offline">⚫ Offline</option>
            </select>
            
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-3xl font-bold mt-1">{mentorData?.totalSessions || 0}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rating</p>
                <p className="text-3xl font-bold mt-1">{mentorData?.rating?.toFixed(1) || '0.0'}</p>
              </div>
              <Star className="w-10 h-10 text-yellow-500 fill-current" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Chats</p>
                <p className="text-3xl font-bold mt-1">{activeChats.length}</p>
              </div>
              <MessageCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Ratings</p>
                <p className="text-3xl font-bold mt-1">{mentorData?.totalRatings || 0}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Incoming Calls */}
        {incomingCalls.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-green-500 animate-pulse" />
              Incoming Calls ({incomingCalls.length})
            </h2>
            <div className="space-y-4">
              {incomingCalls.map((call) => (
                <div key={call.id} className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/50 rounded-lg p-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold">
                        {call.callerName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{call.callerName || 'Student'}</h3>
                        <p className="text-gray-400">
                          {call.isVideo ? (
                            <><Video className="inline w-4 h-4 mr-1" />Video Call</>
                          ) : (
                            <><Phone className="inline w-4 h-4 mr-1" />Voice Call</>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptCall(call.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
                      >
                        <Check className="w-5 h-5" />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectCall(call.id)}
                        className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
                      >
                        <X className="w-5 h-5" />
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active Chats */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Chats</h2>
            <div className="space-y-3">
              {activeChats.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No active chats</p>
                </div>
              ) : (
                activeChats.map((chat) => {
                  // Get the other participant's ID (not the mentor's own ID)
                  const otherUserId = chat.participants?.find(id => id !== userId);
                  
                  return (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/mentor-chat/${otherUserId}`)}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                            S
                          </div>
                          <div>
                            <h3 className="font-semibold">Student</h3>
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {chat.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                        </div>
                        {(chat[`unreadCount_${userId}`] || 0) > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {chat[`unreadCount_${userId}`]}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Call History */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Calls</h2>
            <div className="space-y-3">
              {callHistory.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-400">
                  <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No call history</p>
                </div>
              ) : (
                callHistory.map((call) => (
                  <div
                    key={call.id}
                    className="bg-gray-800 rounded-lg p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {call.isVideo ? (
                          <Video className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Phone className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <h3 className="font-semibold">{call.callerName || 'Student'}</h3>
                          <p className="text-sm text-gray-400">
                            {call.createdAt?.toDate?.().toLocaleString() || 'Recent'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        call.status === 'ended' ? 'bg-green-900/30 text-green-400' :
                        call.status === 'missed' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
