import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video as VideoIcon, 
  VideoOff,
  Maximize,
  Minimize,
  Loader,
  MessageCircle,
  Send,
  X
} from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import { getMentorById } from '../services/mentorService';
import webrtcService from '../services/webrtcService';

const MentorCall = () => {
  const { mentorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userId, isAuth } = getUserInfo();
  
  const callType = searchParams.get('type') || 'voice';
  const isVideo = callType === 'video';
  const callId = searchParams.get('callId');
  const isAnswering = searchParams.get('answer') === 'true';
  
  const [mentor, setMentor] = useState(null);
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, connected, ended
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const chatEndRef = useRef(null);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const callIdRef = useRef(callId || `call_${Date.now()}`);
  const durationIntervalRef = useRef(null);

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
      return;
    }
    
    initializeCall();
    
    return () => {
      endCall();
    };
  }, [isAuth, mentorId, userId]);

  const initializeCall = async () => {
    try {
      // Get mentor/user info based on who we're calling
      let otherUser;
      let localStream;
      
      if (isAnswering) {
        // We're the mentor answering - get caller info
        otherUser = { name: 'Student', id: mentorId }; // mentorId is actually callerId here
        
        // Answer the call
        localStream = await webrtcService.answerCall(callIdRef.current, isVideo);
        
        // Listen for remote stream
        setTimeout(() => {
          const remoteStream = webrtcService.getRemoteStream();
          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }, 1000);
        
      } else {
        // We're the student initiating call
        const mentorData = await getMentorById(mentorId);
        otherUser = mentorData;
        setMentor(mentorData);
        
        // Get user info for caller name
        const authInfo = JSON.parse(localStorage.getItem('authInfo') || '{}');
        const userName = authInfo.displayName || authInfo.email || 'Student';
        
        // Start call with names
        localStream = await webrtcService.startCall(
          callIdRef.current,
          userId,
          mentorId,
          isVideo,
          userName,
          mentorData.name
        );
        
        // Listen for remote stream
        setTimeout(() => {
          const remoteStream = webrtcService.getRemoteStream();
          if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }, 2000);
      }
      
      setMentor(otherUser);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }
      
      // Subscribe to call status
      webrtcService.subscribeToCallStatus(callIdRef.current, (status) => {
        console.log('Call status:', status.status);
        if (status.status === 'connected' || status.status === 'accepted') {
          setCallStatus('connected');
          startDurationTimer();
        } else if (status.status === 'ended') {
          setCallStatus('ended');
          endCall();
        }
      });
      
    } catch (error) {
      console.error('Error initializing call:', error);
      alert('Could not start call. Please check camera/microphone permissions.');
      navigate('/mentor-connect');
    }
  };

  const startDurationTimer = () => {
    durationIntervalRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const endCall = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
    
    await webrtcService.endCall();
    setCallStatus('ended');
    
    setTimeout(() => {
      navigate('/mentor-connect');
    }, 2000);
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    webrtcService.toggleAudio(newState);
  };

  const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    webrtcService.toggleVideo(newState);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;
    
    const message = {
      id: Date.now(),
      text: newChatMessage,
      sender: 'me',
      timestamp: new Date()
    };
    
    setChatMessages([...chatMessages, message]);
    setNewChatMessage('');
    
    // Auto-scroll to bottom
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-lg font-bold">
            {mentor.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold">{mentor.name}</h2>
            <p className="text-sm text-gray-400">
              {callStatus === 'connecting' && 'Connecting...'}
              {callStatus === 'connected' && formatDuration(callDuration)}
              {callStatus === 'ended' && 'Call Ended'}
            </p>
          </div>
        </div>
        
        {callStatus === 'connected' && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Connected</span>
          </div>
        )}
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-black flex">
        {/* Main Video Section */}
        <div className={`${showChat ? 'flex-1' : 'w-full'} relative`}>
        {isVideo ? (
          <>
            {/* Remote Video (Large) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            
            {/* Local Video (Small, Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
          </>
        ) : (
          // Voice Call - Show Avatar
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-5xl font-bold mx-auto mb-4">
                {mentor.name.charAt(0)}
              </div>
              <h3 className="text-2xl font-bold mb-2">{mentor.name}</h3>
              <p className="text-gray-400">
                {callStatus === 'connecting' && 'Connecting...'}
                {callStatus === 'connected' && 'Voice Call Active'}
                {callStatus === 'ended' && 'Call Ended'}
              </p>
            </div>
          </div>
        )
        }

        {/* Call Status Overlay */}
        {callStatus === 'connecting' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <Loader className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-xl">Connecting to {mentor.name}...</p>
            </div>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <PhoneOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-xl mb-2">Call Ended</p>
              <p className="text-gray-400">Duration: {formatDuration(callDuration)}</p>
            </div>
          </div>
        )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.sender === 'me'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChatMessage}
                  onChange={(e) => setNewChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={!newChatMessage.trim()}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-6">
        <div className="flex items-center justify-center gap-4">
          {/* Mute/Unmute */}
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              audioEnabled
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-red-600 hover:bg-red-700'
            }`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? (
              <Mic className="w-6 h-6" />
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </button>

          {/* Video Toggle (only for video calls) */}
          {isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-4 rounded-full transition-all ${
                videoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
              title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {videoEnabled ? (
                <VideoIcon className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Chat Toggle */}
          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-all ${
              showChat
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title="Toggle chat"
          >
            <MessageCircle className="w-6 h-6" />
          </button>

          {/* Fullscreen (only for video calls) */}
          {isVideo && (
            <button
              onClick={toggleFullscreen}
              className="p-4 bg-gray-700 hover:bg-gray-600 rounded-full transition-all"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </button>
          )}
        </div>

        {/* Call Info */}
        <div className="text-center mt-4 text-sm text-gray-400">
          {isVideo ? 'Video Call' : 'Voice Call'} • {formatDuration(callDuration)}
        </div>
      </div>
    </div>
  );
};

export default MentorCall;
