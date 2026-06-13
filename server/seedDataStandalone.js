import admin from "firebase-admin";
import { readFile } from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase Admin
let db;
try {
  const serviceAccount = JSON.parse(
    await readFile(new URL("./serviceAccountKey.json", import.meta.url))
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  });

  db = admin.firestore();
  console.log("✅ Firebase Admin initialized");
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error.message);
  console.log("\n⚠️  Please download your service account key from Firebase Console");
  console.log("   and save it as 'serviceAccountKey.json' in the server directory.\n");
  process.exit(1);
}

// Sample courses data
const sampleCourses = [
  {
    title: "Full Stack Web Development with MERN",
    description: "Master MongoDB, Express.js, React, and Node.js to build modern web applications from scratch.",
    category: "Full Stack Development",
    level: "Intermediate",
    price: 49.99,
    instructorName: "Sarah Johnson",
    students: 245,
    rating: 4.8,
    status: "published",
    duration: "12 weeks",
    topics: ["MongoDB", "Express.js", "React", "Node.js", "REST APIs", "Authentication"]
  },
  {
    title: "Python for Data Science & Machine Learning",
    description: "Learn Python programming, data analysis with Pandas, visualization with Matplotlib, and ML with scikit-learn.",
    category: "Data Science",
    level: "Beginner",
    price: 39.99,
    instructorName: "Dr. Michael Chen",
    students: 532,
    rating: 4.9,
    status: "published",
    duration: "10 weeks",
    topics: ["Python", "Pandas", "NumPy", "Matplotlib", "Machine Learning", "scikit-learn"]
  },
  {
    title: "Advanced JavaScript & TypeScript",
    description: "Deep dive into modern JavaScript ES6+, asynchronous programming, and TypeScript for scalable applications.",
    category: "Frontend Development",
    level: "Advanced",
    price: 59.99,
    instructorName: "Alex Rodriguez",
    students: 189,
    rating: 4.7,
    status: "published",
    duration: "8 weeks",
    topics: ["JavaScript", "TypeScript", "Async/Await", "Promises", "Design Patterns", "Testing"]
  },
  {
    title: "DevOps with Docker & Kubernetes",
    description: "Learn containerization with Docker, orchestration with Kubernetes, and CI/CD pipeline automation.",
    category: "DevOps",
    level: "Intermediate",
    price: 69.99,
    instructorName: "David Kumar",
    students: 167,
    rating: 4.6,
    status: "published",
    duration: "10 weeks",
    topics: ["Docker", "Kubernetes", "CI/CD", "Jenkins", "GitHub Actions", "AWS"]
  },
  {
    title: "React Native Mobile App Development",
    description: "Build cross-platform mobile apps for iOS and Android using React Native and Expo.",
    category: "Mobile Development",
    level: "Intermediate",
    price: 54.99,
    instructorName: "Emily Watson",
    students: 298,
    rating: 4.8,
    status: "published",
    duration: "9 weeks",
    topics: ["React Native", "Expo", "Mobile UI", "Navigation", "APIs", "Deployment"]
  }
];

// Sample mentors data
const sampleMentors = [
  {
    name: "Sarah Johnson",
    expertise: ["Full Stack Development", "MERN Stack", "JavaScript", "React"],
    bio: "Senior Full Stack Developer with 8+ years of experience at Google and startups. Passionate about teaching clean code practices.",
    experience: "8 years",
    rating: 4.9,
    totalRatings: 87,
    totalSessions: 156,
    status: "available",
    verified: true,
    hourlyRate: 75,
    languages: ["English", "Spanish"],
    availability: ["Monday", "Wednesday", "Friday"]
  },
  {
    name: "Dr. Michael Chen",
    expertise: ["Data Science", "Machine Learning", "Python", "AI"],
    bio: "PhD in Machine Learning from Stanford. Former Data Scientist at Facebook. Love helping students break into AI/ML.",
    experience: "10 years",
    rating: 5.0,
    totalRatings: 124,
    totalSessions: 203,
    status: "available",
    verified: true,
    hourlyRate: 100,
    languages: ["English", "Mandarin"],
    availability: ["Tuesday", "Thursday", "Saturday"]
  },
  {
    name: "Alex Rodriguez",
    expertise: ["Frontend Development", "TypeScript", "Angular", "Vue.js"],
    bio: "Lead Frontend Engineer at Microsoft. Specialized in building scalable enterprise applications with modern frameworks.",
    experience: "7 years",
    rating: 4.8,
    totalRatings: 92,
    totalSessions: 134,
    status: "busy",
    verified: true,
    hourlyRate: 80,
    languages: ["English"],
    availability: ["Monday", "Tuesday", "Wednesday"]
  },
  {
    name: "David Kumar",
    expertise: ["DevOps", "Cloud Architecture", "AWS", "Docker", "Kubernetes"],
    bio: "DevOps Architect with expertise in cloud infrastructure. Certified AWS Solutions Architect helping teams scale efficiently.",
    experience: "9 years",
    rating: 4.7,
    totalRatings: 78,
    totalSessions: 145,
    status: "available",
    verified: true,
    hourlyRate: 90,
    languages: ["English", "Hindi"],
    availability: ["Thursday", "Friday", "Saturday"]
  },
  {
    name: "Emily Watson",
    expertise: ["Mobile Development", "React Native", "iOS", "Android"],
    bio: "Mobile App Developer with 50+ apps published. Specialized in creating beautiful, performant cross-platform applications.",
    experience: "6 years",
    rating: 4.9,
    totalRatings: 103,
    totalSessions: 178,
    status: "available",
    verified: true,
    hourlyRate: 70,
    languages: ["English", "French"],
    availability: ["Monday", "Wednesday", "Friday", "Sunday"]
  },
  {
    name: "James Park",
    expertise: ["Backend Development", "System Design", "Microservices", "Node.js"],
    bio: "Backend architect specializing in distributed systems. Former engineer at Amazon, now helping others build scalable backends.",
    experience: "11 years",
    rating: 4.8,
    totalRatings: 95,
    totalSessions: 167,
    status: "offline",
    verified: true,
    hourlyRate: 85,
    languages: ["English", "Korean"],
    availability: ["Tuesday", "Thursday"]
  }
];

// Check if data already exists
async function dataExists(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  return !snapshot.empty;
}

// Seed courses
async function seedCourses() {
  try {
    const exists = await dataExists('courses');
    if (exists) {
      console.log("📚 Courses already exist. Skipping...");
      return;
    }

    console.log("📚 Seeding courses...");
    const batch = db.batch();
    const coursesRef = db.collection('courses');
    
    for (const course of sampleCourses) {
      const docRef = coursesRef.doc();
      batch.set(docRef, {
        ...course,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
      });
    }
    
    await batch.commit();
    console.log(`✅ Successfully seeded ${sampleCourses.length} courses`);
  } catch (error) {
    console.error("❌ Error seeding courses:", error);
    throw error;
  }
}

// Seed mentors
async function seedMentors() {
  try {
    const exists = await dataExists('mentors');
    if (exists) {
      console.log("👨‍🏫 Mentors already exist. Skipping...");
      return;
    }

    console.log("👨‍🏫 Seeding mentors...");
    const batch = db.batch();
    const mentorsRef = db.collection('mentors');
    
    for (const mentor of sampleMentors) {
      const docRef = mentorsRef.doc();
      batch.set(docRef, {
        ...mentor,
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        lastActive: admin.firestore.Timestamp.now()
      });
    }
    
    await batch.commit();
    console.log(`✅ Successfully seeded ${sampleMentors.length} mentors`);
  } catch (error) {
    console.error("❌ Error seeding mentors:", error);
    throw error;
  }
}

// Main seed function
async function seedDatabase() {
  console.log("🌱 Starting database seeding...\n");
  try {
    await seedCourses();
    await seedMentors();
    console.log("\n🎉 Database seeding completed!");
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    throw error;
  }
}

// Run seeding
seedDatabase()
  .then(() => {
    console.log("✅ Seed script finished successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  });
