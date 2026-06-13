import express from "express";
import dotenv from "dotenv";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebaseClient.js";

dotenv.config();
const router = express.Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Fetch real-time data from Firebase
async function fetchPlatformData() {
  try {
    const data = {
      courses: [],
      mentors: [],
      stats: {
        totalCourses: 0,
        totalMentors: 0,
        categories: []
      }
    };

    // Fetch published courses
    const coursesQuery = query(
      collection(db, 'courses'),
      where('status', '==', 'published')
    );
    const coursesSnapshot = await getDocs(coursesQuery);
    
    const categorySet = new Set();
    coursesSnapshot.forEach((doc) => {
      const courseData = doc.data();
      data.courses.push({
        id: doc.id,
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        price: courseData.price,
        instructor: courseData.instructorName,
        students: courseData.students || 0,
        rating: courseData.rating || 0
      });
      
      if (courseData.category) {
        categorySet.add(courseData.category);
      }
    });

    // Fetch verified mentors
    const mentorsQuery = query(
      collection(db, 'mentors'),
      where('verified', '==', true)
    );
    const mentorsSnapshot = await getDocs(mentorsQuery);
    
    mentorsSnapshot.forEach((doc) => {
      const mentorData = doc.data();
      data.mentors.push({
        id: doc.id,
        name: mentorData.name,
        expertise: mentorData.expertise || [],
        bio: mentorData.bio,
        experience: mentorData.experience,
        rating: mentorData.rating || 0,
        status: mentorData.status,
        hourlyRate: mentorData.hourlyRate
      });
    });

    data.stats.totalCourses = data.courses.length;
    data.stats.totalMentors = data.mentors.length;
    data.stats.categories = Array.from(categorySet);

    return data;
  } catch (error) {
    console.error("Error fetching platform data:", error);
    return null;
  }
}

// Generate dynamic system context with real data
async function generateSystemContext() {
  const platformData = await fetchPlatformData();
  
  let contextData = "";
  
  if (platformData) {
    // Add courses information
    if (platformData.courses.length > 0) {
      contextData += "\n\n**Available Courses:**\n";
      platformData.courses.forEach((course, index) => {
        contextData += `${index + 1}. **${course.title}** - ${course.category} (${course.level})\n`;
        contextData += `   ${course.description}\n`;
        contextData += `   Instructor: ${course.instructor} | Students: ${course.students} | Rating: ${course.rating}/5\n`;
        if (course.price) {
          contextData += `   Price: $${course.price}\n`;
        }
      });
    }

    // Add mentors information
    if (platformData.mentors.length > 0) {
      contextData += "\n\n**Available Mentors:**\n";
      platformData.mentors.forEach((mentor, index) => {
        contextData += `${index + 1}. **${mentor.name}** - ${mentor.expertise.join(", ")}\n`;
        if (mentor.bio) {
          contextData += `   ${mentor.bio}\n`;
        }
        contextData += `   Experience: ${mentor.experience} | Rating: ${mentor.rating}/5\n`;
        contextData += `   Status: ${mentor.status}\n`;
        if (mentor.hourlyRate) {
          contextData += `   Rate: $${mentor.hourlyRate}/hour\n`;
        }
      });
    }

    // Add stats
    contextData += `\n\n**Platform Statistics:**\n`;
    contextData += `- Total Courses: ${platformData.stats.totalCourses}\n`;
    contextData += `- Total Mentors: ${platformData.stats.totalMentors}\n`;
    if (platformData.stats.categories.length > 0) {
      contextData += `- Course Categories: ${platformData.stats.categories.join(", ")}\n`;
    }
  }

  return `You are an intelligent assistant for CodeNexus, a comprehensive learning platform for aspiring developers and tech professionals.

**About CodeNexus:**
CodeNexus is an all-in-one platform offering:

1. **Full-Stack Courses**: Comprehensive courses covering frontend, backend, databases, and modern frameworks
2. **Interactive Code Editor**: Practice coding directly in the browser with real-time execution
3. **Mock Interviews**: AI-powered technical interview preparation with personalized feedback
4. **Mentorship Program**: Connect with experienced mentors for one-on-one guidance and video calls
5. **Hackathons**: Participate in coding competitions and collaborative events
6. **Progress Tracking**: Monitor learning journey with detailed analytics and achievements
7. **Roadmaps**: Structured learning paths for different tech career tracks
8. **Community**: Connect with fellow learners and share knowledge
9. **Quizzes & Exercises**: Test knowledge with interactive assessments
10. **Resume Builder**: AI-powered resume generation for job applications
${contextData}

**Your Role:**
- Answer questions about CodeNexus features, courses, and services based on REAL data provided above
- Help students navigate the platform
- When asked about courses, provide specific course titles, descriptions, and instructors from the list above
- When asked about mentors, provide specific mentor names, expertise, and availability from the list above
- Provide guidance on learning paths and career development
- Assist with technical questions related to programming and development
- Be friendly, encouraging, and supportive
- Personalize responses based on the student's needs
- ALWAYS use the actual course and mentor data provided above when answering questions

**Important:**
- If asked about courses, LIST the actual courses from the data above
- If asked about mentors, LIST the actual mentors from the data above
- If asked about prices, use the actual prices from the data
- If no data is available, politely inform the user that the information is being updated

**Tone:**
- Friendly and approachable
- Professional yet conversational
- Encouraging and motivating
- Clear and concise

When students ask about courses, mentors, hackathons, or any platform features, provide detailed and helpful responses using REAL data.`;
}

// Generate AI Response using Groq API
async function getGroqResponse(userQuery, conversationHistory = [], systemContext) {
    try {
        const messages = [
            { role: "system", content: systemContext },
            ...conversationHistory,
            { role: "user", content: userQuery }
        ];

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile", // Fast and powerful model
                messages: messages,
                temperature: 0.7,
                max_tokens: 1000,
                top_p: 1,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error("Groq API Error:", error);
            throw new Error(`Groq API returned ${response.status}: ${error}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling Groq API:", error);
        throw error;
    }
}

// Main Chat Route
router.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        if (!GROQ_API_KEY) {
            return res.status(500).json({ 
                error: "Groq API key not configured. Please add GROQ_API_KEY to your .env file" 
            });
        }

        // Generate dynamic system context with real-time data
        const systemContext = await generateSystemContext();

        // Format conversation history for Groq
        const conversationHistory = (history || []).map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
        }));

        const aiResponse = await getGroqResponse(message, conversationHistory, systemContext);
        res.json({ response: aiResponse });

    } catch (error) {
        console.error("Error in /chat route:", error);
        res.status(500).json({ 
            error: "Failed to get response from AI assistant",
            details: error.message 
        });
    }
});

// Endpoint to get platform data (for debugging or frontend display)
router.get("/chat/platform-data", async (req, res) => {
    try {
        const platformData = await fetchPlatformData();
        res.json(platformData);
    } catch (error) {
        console.error("Error fetching platform data:", error);
        res.status(500).json({ 
            error: "Failed to fetch platform data",
            details: error.message 
        });
    }
});

export default router;
