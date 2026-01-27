import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../Firebase/firebase';

// Course statuses
export const COURSE_STATUS = {
  DRAFT: 'draft',
  UNDER_REVIEW: 'under_review', // Automated analysis in progress
  PENDING: 'pending', // Awaiting admin manual review
  AUTO_APPROVED: 'auto_approved', // Passed automated checks
  APPROVED: 'approved', // Manually approved by admin
  REJECTED: 'rejected',
  PUBLISHED: 'published'
};

/**
 * Create a new course
 */
export const createCourse = async (courseData, creatorId) => {
  try {
    const course = {
      ...courseData,
      creatorId,
      status: COURSE_STATUS.DRAFT,
      students: 0,
      rating: 0,
      reviews: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'courses'), course);
    return { id: docRef.id, ...course };
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

/**
 * Note: Since Firebase Storage is not being used (paid service),
 * users should provide direct URLs to images/videos hosted elsewhere
 * (e.g., Imgur, Cloudinary, YouTube, Vimeo, etc.)
 */

/**
 * Get all published courses
 */
export const getPublishedCourses = async () => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'courses'),
      where('status', '==', COURSE_STATUS.PUBLISHED)
    );
    
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in JavaScript instead
    courses.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    console.log('Published courses found:', courses.length);
    return courses;
  } catch (error) {
    console.error('Error getting published courses:', error);
    throw error;
  }
};

/**
 * Get courses by creator
 */
export const getCoursesByCreator = async (creatorId) => {
  try {
    const q = query(
      collection(db, 'courses'),
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    
    return courses;
  } catch (error) {
    console.error('Error getting creator courses:', error);
    throw error;
  }
};

/**
 * Get pending courses for admin review
 */
export const getPendingCourses = async () => {
  try {
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, 'courses'),
      where('status', '==', COURSE_STATUS.PENDING)
    );
    
    const querySnapshot = await getDocs(q);
    const courses = [];
    querySnapshot.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() });
    });
    
    // Sort in JavaScript instead
    courses.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });
    
    console.log('Pending courses found:', courses.length);
    return courses;
  } catch (error) {
    console.error('Error getting pending courses:', error);
    throw error;
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Course not found');
    }
  } catch (error) {
    console.error('Error getting course:', error);
    throw error;
  }
};

/**
 * Update course
 */
export const updateCourse = async (courseId, updates) => {
  try {
    const docRef = doc(db, 'courses', courseId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

/**
 * Submit course for automated review
 */
export const submitCourseForReview = async (courseId) => {
  try {
    // Import analysis services dynamically to avoid circular dependencies
    const { extractMultipleVideoMetadata } = await import('./videoMetadataService');
    const { analyzeCourseContent } = await import('./contentAnalysisService');
    
    // Get course data
    const course = await getCourseById(courseId);
    
    // Set status to under review
    await updateCourse(courseId, { 
      status: COURSE_STATUS.UNDER_REVIEW,
      submittedForReviewAt: serverTimestamp()
    });
    
    // Extract video metadata
    const videosWithMetadata = await extractMultipleVideoMetadata(course.videos || []);
    
    // Analyze course content
    const analysis = await analyzeCourseContent(course, videosWithMetadata);
    
    // Store analysis results
    await updateCourse(courseId, {
      analysisResult: analysis,
      videosWithMetadata
    });
    
    // Auto-approve if score is high enough
    if (analysis.autoApprove) {
      await updateCourse(courseId, {
        status: COURSE_STATUS.AUTO_APPROVED,
        autoApprovedAt: serverTimestamp()
      });
    } else {
      // Send to manual review
      await updateCourse(courseId, {
        status: COURSE_STATUS.PENDING,
        requiresManualReview: true
      });
    }
    
    return analysis;
  } catch (error) {
    console.error('Error submitting course for review:', error);
    // Fallback to pending status if analysis fails
    await updateCourse(courseId, { 
      status: COURSE_STATUS.PENDING,
      analysisError: error.message
    });
    throw error;
  }
};

/**
 * Approve course (Admin only)
 */
export const approveCourse = async (courseId, adminId) => {
  try {
    await updateCourse(courseId, { 
      status: COURSE_STATUS.APPROVED,
      approvedBy: adminId,
      approvedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error approving course:', error);
    throw error;
  }
};

/**
 * Reject course (Admin only)
 */
export const rejectCourse = async (courseId, adminId, reason) => {
  try {
    await updateCourse(courseId, { 
      status: COURSE_STATUS.REJECTED,
      rejectedBy: adminId,
      rejectedAt: serverTimestamp(),
      rejectionReason: reason
    });
  } catch (error) {
    console.error('Error rejecting course:', error);
    throw error;
  }
};

/**
 * Publish course (Creator only, after approval)
 */
export const publishCourse = async (courseId) => {
  try {
    const course = await getCourseById(courseId);
    
    // Allow publishing if approved or auto-approved
    if (course.status !== COURSE_STATUS.APPROVED && course.status !== COURSE_STATUS.AUTO_APPROVED) {
      throw new Error('Course must be approved before publishing');
    }
    
    await updateCourse(courseId, { 
      status: COURSE_STATUS.PUBLISHED,
      publishedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    throw error;
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  try {
    await deleteDoc(doc(db, 'courses', courseId));
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

/**
 * Add video to course
 */
export const addVideoToCourse = async (courseId, videoData) => {
  try {
    const course = await getCourseById(courseId);
    const videos = course.videos || [];
    
    const newVideo = {
      id: Date.now().toString(),
      ...videoData,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    videos.push(newVideo);
    await updateCourse(courseId, { videos });
    
    return newVideo;
  } catch (error) {
    console.error('Error adding video to course:', error);
    throw error;
  }
};

/**
 * Update video in course
 */
export const updateVideoInCourse = async (courseId, videoId, updates) => {
  try {
    const course = await getCourseById(courseId);
    const videos = course.videos || [];
    
    const videoIndex = videos.findIndex(v => v.id === videoId);
    if (videoIndex === -1) {
      throw new Error('Video not found');
    }
    
    videos[videoIndex] = { ...videos[videoIndex], ...updates };
    await updateCourse(courseId, { videos });
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

/**
 * Delete video from course
 */
export const deleteVideoFromCourse = async (courseId, videoId) => {
  try {
    const course = await getCourseById(courseId);
    const videos = course.videos || [];
    
    const filteredVideos = videos.filter(v => v.id !== videoId);
    await updateCourse(courseId, { videos: filteredVideos });
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

/**
 * Enroll user in course
 */
export const enrollInCourse = async (userId, courseId) => {
  try {
    const enrollment = {
      userId,
      courseId,
      enrolledAt: serverTimestamp(),
      progress: 0,
      completedVideos: []
    };
    
    await addDoc(collection(db, 'enrollments'), enrollment);
    
    // Update course student count
    const course = await getCourseById(courseId);
    await updateCourse(courseId, { students: (course.students || 0) + 1 });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

/**
 * Get user enrollments
 */
export const getUserEnrollments = async (userId) => {
  try {
    const q = query(
      collection(db, 'enrollments'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const enrollments = [];
    
    for (const enrollDoc of querySnapshot.docs) {
      const enrollment = enrollDoc.data();
      const course = await getCourseById(enrollment.courseId);
      enrollments.push({
        id: enrollDoc.id,
        ...enrollment,
        course
      });
    }
    
    return enrollments;
  } catch (error) {
    console.error('Error getting user enrollments:', error);
    throw error;
  }
};
