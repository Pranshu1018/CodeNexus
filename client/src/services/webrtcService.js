import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

// ICE servers configuration (using free STUN servers)
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
};

class WebRTCService {
  constructor() {
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.callId = null;
  }

  /**
   * Initialize local media stream (audio/video)
   */
  async initializeLocalStream(videoEnabled = false) {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      });
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Could not access camera/microphone. Please check permissions.');
    }
  }

  /**
   * Create a new peer connection
   */
  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(iceServers);
    
    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }
    
    // Handle remote stream
    this.remoteStream = new MediaStream();
    this.peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream.addTrack(track);
      });
    };
    
    return this.peerConnection;
  }

  /**
   * Start a call (caller)
   */
  async startCall(callId, callerId, receiverId, isVideo = false, callerName = '', receiverName = '') {
    try {
      this.callId = callId;
      
      // Initialize local stream
      await this.initializeLocalStream(isVideo);
      
      // Create peer connection
      this.createPeerConnection();
      
      // Create call document in Firestore
      const callDoc = doc(db, 'calls', callId);
      await setDoc(callDoc, {
        callerId,
        receiverId,
        callerName: callerName || 'Student',
        receiverName: receiverName || 'Mentor',
        isVideo,
        status: 'calling',
        createdAt: serverTimestamp()
      });
      
      // Create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Save offer to Firestore
      await updateDoc(callDoc, {
        offer: {
          type: offer.type,
          sdp: offer.sdp
        }
      });
      
      // Listen for ICE candidates
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await setDoc(doc(db, 'calls', callId, 'callerCandidates', Date.now().toString()), {
            candidate: event.candidate.toJSON()
          });
        }
      };
      
      // Listen for answer
      this.listenForAnswer(callId);
      
      return this.localStream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  /**
   * Answer a call (receiver)
   */
  async answerCall(callId, isVideo = false) {
    try {
      this.callId = callId;
      
      // Initialize local stream
      await this.initializeLocalStream(isVideo);
      
      // Create peer connection
      this.createPeerConnection();
      
      // Get call document
      const callDoc = await getDoc(doc(db, 'calls', callId));
      const callData = callDoc.data();
      
      // Set remote description from offer
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(callData.offer)
      );
      
      // Create answer
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      // Save answer to Firestore
      await updateDoc(doc(db, 'calls', callId), {
        answer: {
          type: answer.type,
          sdp: answer.sdp
        },
        status: 'connected'
      });
      
      // Listen for ICE candidates
      this.peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          await setDoc(doc(db, 'calls', callId, 'receiverCandidates', Date.now().toString()), {
            candidate: event.candidate.toJSON()
          });
        }
      };
      
      // Listen for caller's ICE candidates
      this.listenForCallerCandidates(callId);
      
      return this.localStream;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  /**
   * Listen for answer from receiver
   */
  listenForAnswer(callId) {
    const callDoc = doc(db, 'calls', callId);
    
    return onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && !this.peerConnection.currentRemoteDescription) {
        await this.peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        
        // Start listening for receiver's ICE candidates
        this.listenForReceiverCandidates(callId);
      }
    });
  }

  /**
   * Listen for caller's ICE candidates
   */
  listenForCallerCandidates(callId) {
    const candidatesCollection = collection(db, 'calls', callId, 'callerCandidates');
    
    return onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data().candidate);
          await this.peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  /**
   * Listen for receiver's ICE candidates
   */
  listenForReceiverCandidates(callId) {
    const candidatesCollection = collection(db, 'calls', callId, 'receiverCandidates');
    
    return onSnapshot(candidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data().candidate);
          await this.peerConnection.addIceCandidate(candidate);
        }
      });
    });
  }

  /**
   * End call
   */
  async endCall() {
    try {
      // Stop all tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
      }
      
      // Close peer connection
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      
      // Update call status in Firestore
      if (this.callId) {
        await updateDoc(doc(db, 'calls', this.callId), {
          status: 'ended',
          endedAt: serverTimestamp()
        });
      }
      
      // Reset
      this.peerConnection = null;
      this.localStream = null;
      this.remoteStream = null;
      this.callId = null;
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }

  /**
   * Toggle audio mute
   */
  toggleAudio(enabled) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(enabled) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get remote stream
   */
  getRemoteStream() {
    return this.remoteStream;
  }

  /**
   * Subscribe to call status
   */
  subscribeToCallStatus(callId, callback) {
    return onSnapshot(doc(db, 'calls', callId), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data());
      }
    });
  }
}

// Export singleton instance
export default new WebRTCService();
