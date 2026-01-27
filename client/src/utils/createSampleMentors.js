import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase/firebase';

/**
 * Script to create sample mentors for testing
 * Run this once to populate your database with test mentors
 */

const sampleMentors = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    userId: "mentor_sarah_123",
    expertise: ["Python", "Machine Learning", "Data Science", "AI"],
    experience: 8,
    rating: 4.8,
    totalRatings: 156,
    totalSessions: 245,
    status: "available",
    verified: true,
    bio: "PhD in Computer Science with 8+ years of industry experience in ML and AI. Worked at Google and Microsoft.",
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '15:00' }
    }
  },
  {
    name: "John Smith",
    email: "john.smith@example.com",
    userId: "mentor_john_456",
    expertise: ["React", "Node.js", "Full Stack", "JavaScript", "TypeScript"],
    experience: 5,
    rating: 4.6,
    totalRatings: 89,
    totalSessions: 134,
    status: "available",
    verified: true,
    bio: "Senior Full Stack Developer at Tech Corp. Passionate about teaching modern web development.",
    availability: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '16:00' }
    }
  },
  {
    name: "Emily Chen",
    email: "emily.chen@example.com",
    userId: "mentor_emily_789",
    expertise: ["DSA", "Algorithms", "Competitive Programming", "C++", "Java"],
    experience: 6,
    rating: 4.9,
    totalRatings: 203,
    totalSessions: 312,
    status: "busy",
    verified: true,
    bio: "ICPC World Finalist. Expert in algorithms and data structures. Helped 200+ students crack FAANG interviews.",
    availability: {
      monday: { start: '14:00', end: '20:00' },
      tuesday: { start: '14:00', end: '20:00' },
      wednesday: { start: '14:00', end: '20:00' },
      thursday: { start: '14:00', end: '20:00' },
      friday: { start: '14:00', end: '18:00' }
    }
  },
  {
    name: "Michael Brown",
    email: "michael.brown@example.com",
    userId: "mentor_michael_101",
    expertise: ["DevOps", "AWS", "Docker", "Kubernetes", "CI/CD"],
    experience: 7,
    rating: 4.7,
    totalRatings: 112,
    totalSessions: 178,
    status: "available",
    verified: true,
    bio: "DevOps Engineer with expertise in cloud infrastructure and automation. AWS Certified Solutions Architect.",
    availability: {
      monday: { start: '08:00', end: '16:00' },
      tuesday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' },
      friday: { start: '08:00', end: '14:00' }
    }
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    userId: "mentor_priya_202",
    expertise: ["Mobile Development", "Flutter", "React Native", "iOS", "Android"],
    experience: 4,
    rating: 4.5,
    totalRatings: 67,
    totalSessions: 98,
    status: "available",
    verified: true,
    bio: "Mobile app developer with 4+ years experience. Built apps with 1M+ downloads. Expert in cross-platform development.",
    availability: {
      monday: { start: '11:00', end: '19:00' },
      tuesday: { start: '11:00', end: '19:00' },
      wednesday: { start: '11:00', end: '19:00' },
      thursday: { start: '11:00', end: '19:00' },
      friday: { start: '11:00', end: '17:00' }
    }
  }
];

export const createSampleMentors = async () => {
  try {
    console.log('Creating sample mentors...');
    
    const mentorsCollection = collection(db, 'mentors');
    
    for (const mentor of sampleMentors) {
      const mentorData = {
        ...mentor,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActive: serverTimestamp()
      };
      
      const docRef = await addDoc(mentorsCollection, mentorData);
      console.log(`Created mentor: ${mentor.name} with ID: ${docRef.id}`);
    }
    
    console.log('✅ All sample mentors created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating sample mentors:', error);
    throw error;
  }
};

// Uncomment to run this function
// createSampleMentors();
