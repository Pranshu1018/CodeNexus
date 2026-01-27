import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Loader,
  CheckCheck,
  Check
} from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import { getMentorById } from '../services/mentorService';
import { getChatRoom, sendMessage, subscribeToMessages, markMessagesAsRead } from '../services/chatService';

const MentorChat = () => {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const { userId, isAuth } = getUserInfo();
  
  const [mentor, setMentor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
      return;
    }
    
    initializeChat();
  }, [isAuth, mentorId, userId]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Get mentor info
      const mentorData = await getMentorById(mentorId);
      setMentor(mentorData);
      
      // Get or create chat room
      const roomId = await getChatRoom(userId, mentorId);
      setChatId(roomId);
      
      // Subscribe to messages
      const unsubscribe = subscribeToMessages(roomId, (msgs) => {
        setMessages(msgs);
        scrollToBottom();
      });
      
      // Mark messages as read
      await markMessagesAsRead(roomId, userId);
      
      return () => unsubscribe();
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !chatId) return;
    
    try {
      setSending(true);
      await sendMessage(chatId, userId, mentorId, newMessage.trim());
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mentor not found</h2>
          <button
            onClick={() => navigate('/mentor-connect')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mentor-connect')}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
            {mentor.name.charAt(0)}
          </div>
          
          <div>
            <h2 className="font-semibold">{mentor.name}</h2>
            <p className="text-sm text-gray-400">
              {mentor.status === 'available' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/mentor-call/${mentorId}?type=voice`)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Voice Call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate(`/mentor-call/${mentorId}?type=video`)}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Video Call"
          >
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <p>No messages yet</p>
            <p className="text-sm mt-2">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.senderId === userId;
            const showDate = index === 0 || 
              formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-gray-500 text-xs my-4">
                    {formatDate(message.timestamp)}
                  </div>
                )}
                
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}
                  >
                    <p className="break-words">{message.text}</p>
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      isOwn ? 'text-purple-200' : 'text-gray-400'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {isOwn && (
                        message.read ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {sending ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MentorChat;
