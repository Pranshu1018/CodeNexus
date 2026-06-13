import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

/**
 * Check if a user is a verified mentor
 */
export const checkMentorStatus = async (userId) => {
  try {
    if (!userId) return false;
    
    // First check if document ID matches userId (new method)
    const mentorDocRef = doc(db, 'mentors', userId);
    const mentorDoc = await getDoc(mentorDocRef);
    
    if (mentorDoc.exists()) {
      const mentorData = mentorDoc.data();
      return mentorData.verified === true;
    }
    
    // Fallback: check by userId field (old method, for backward compatibility)
    const mentorQuery = query(
      collection(db, 'mentors'),
      where('userId', '==', userId),
      where('verified', '==', true)
    );
    
    const snapshot = await getDocs(mentorQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking mentor status:', error);
    return false;
  }
};

/**
 * Check if a user is an admin
 */
export const checkAdminStatus = async (userId) => {
  try {
    if (!userId) return false;
    
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', userId),
      where('role', '==', 'admin')
    );
    
    const snapshot = await getDocs(userQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get user roles (student, mentor, admin, instructor)
 */
export const getUserRoles = async (userId) => {
  try {
    if (!userId) {
      return { isStudent: false, isMentor: false, isAdmin: false, isInstructor: false };
    }
    
    const roles = {
      isStudent: true, // Default
      isMentor: false,
      isAdmin: false,
      isInstructor: false
    };
    
    // Check mentor status
    roles.isMentor = await checkMentorStatus(userId);
    
    // Check admin/instructor status
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', userId)
    );
    
    const userSnapshot = await getDocs(userQuery);
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      roles.isAdmin = userData.role === 'admin';
      roles.isInstructor = userData.role === 'instructor';
    }
    
    return roles;
  } catch (error) {
    console.error('Error getting user roles:', error);
    return { isStudent: true, isMentor: false, isAdmin: false, isInstructor: false };
  }
};

/**
 * Save user roles to localStorage
 */
export const saveUserRoles = (roles) => {
  localStorage.setItem('userRoles', JSON.stringify(roles));
};

/**
 * Get user roles from localStorage
 */
export const getSavedUserRoles = () => {
  try {
    const saved = localStorage.getItem('userRoles');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error reading saved roles:', error);
    return null;
  }
};

/**
 * Check if current user is mentor (from localStorage)
 */
export const isCurrentUserMentor = () => {
  const roles = getSavedUserRoles();
  return roles?.isMentor || false;
};
