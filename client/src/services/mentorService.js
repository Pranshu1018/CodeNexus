import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

// Mentor statuses
export const MENTOR_STATUS = {
  AVAILABLE: 'available',
  BUSY: 'busy',
  OFFLINE: 'offline'
};

/**
 * Create a new mentor profile
 */
export const createMentor = async (mentorData) => {
  try {
    // Use setDoc with userId as document ID for easy lookup
    const mentorRef = doc(db, 'mentors', mentorData.userId);
    await setDoc(mentorRef, {
      ...mentorData,
      status: MENTOR_STATUS.OFFLINE,
      rating: 0,
      totalRatings: 0,
      totalSessions: 0,
      verified: mentorData.verified !== undefined ? mentorData.verified : false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: mentorData.userId, ...mentorData };
  } catch (error) {
    console.error('Error creating mentor:', error);
    throw error;
  }
};

/**
 * Get all verified mentors
 */
export const getVerifiedMentors = async () => {
  try {
    const q = query(
      collection(db, 'mentors'),
      where('verified', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const mentors = [];
    querySnapshot.forEach((doc) => {
      mentors.push({ id: doc.id, ...doc.data() });
    });
    
    return mentors;
  } catch (error) {
    console.error('Error getting verified mentors:', error);
    throw error;
  }
};

/**
 * Get mentor by ID
 */
export const getMentorById = async (mentorId) => {
  try {
    const mentorDoc = await getDoc(doc(db, 'mentors', mentorId));
    if (mentorDoc.exists()) {
      return { id: mentorDoc.id, ...mentorDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting mentor:', error);
    throw error;
  }
};

/**
 * Update mentor profile
 */
export const updateMentor = async (mentorId, updates) => {
  try {
    await updateDoc(doc(db, 'mentors', mentorId), {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    throw error;
  }
};

/**
 * Update mentor status (available, busy, offline)
 */
export const updateMentorStatus = async (mentorId, status) => {
  try {
    await updateDoc(doc(db, 'mentors', mentorId), {
      status,
      lastActive: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating mentor status:', error);
    throw error;
  }
};

/**
 * Verify mentor (admin only)
 */
export const verifyMentor = async (mentorId) => {
  try {
    await updateDoc(doc(db, 'mentors', mentorId), {
      verified: true,
      verifiedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error verifying mentor:', error);
    throw error;
  }
};

/**
 * Get pending mentors (for admin approval)
 */
export const getPendingMentors = async () => {
  try {
    const q = query(
      collection(db, 'mentors'),
      where('verified', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    const mentors = [];
    querySnapshot.forEach((doc) => {
      mentors.push({ id: doc.id, ...doc.data() });
    });
    
    return mentors;
  } catch (error) {
    console.error('Error getting pending mentors:', error);
    throw error;
  }
};

/**
 * Rate a mentor
 */
export const rateMentor = async (mentorId, rating, userId) => {
  try {
    const mentor = await getMentorById(mentorId);
    
    const newTotalRatings = (mentor.totalRatings || 0) + 1;
    const currentRating = mentor.rating || 0;
    const newRating = ((currentRating * (mentor.totalRatings || 0)) + rating) / newTotalRatings;
    
    await updateDoc(doc(db, 'mentors', mentorId), {
      rating: newRating,
      totalRatings: newTotalRatings
    });
    
    // Store individual rating
    await addDoc(collection(db, 'mentorRatings'), {
      mentorId,
      userId,
      rating,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error rating mentor:', error);
    throw error;
  }
};

/**
 * Subscribe to mentor status changes (real-time)
 */
export const subscribeMentorStatus = (mentorId, callback) => {
  const mentorRef = doc(db, 'mentors', mentorId);
  return onSnapshot(mentorRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
};

/**
 * Get mentors by expertise
 */
export const getMentorsByExpertise = async (expertise) => {
  try {
    const q = query(
      collection(db, 'mentors'),
      where('verified', '==', true),
      where('expertise', 'array-contains', expertise)
    );
    
    const querySnapshot = await getDocs(q);
    const mentors = [];
    querySnapshot.forEach((doc) => {
      mentors.push({ id: doc.id, ...doc.data() });
    });
    
    return mentors;
  } catch (error) {
    console.error('Error getting mentors by expertise:', error);
    throw error;
  }
};
