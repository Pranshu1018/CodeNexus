import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Razorpay from "razorpay";
import crypto from "crypto";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUsers } from "./firebaseClient.js";
import chatbotRouter from "./chatbot.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

const genAI = new GoogleGenerativeAI(process.env.GEN_AI_SECRET);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: "You are a JSON formatting API. Your sole purpose is to convert the user's provided data into a valid JSON object. The JSON schema must be: {\"name\": \"string\", \"email\": \"string\", \"phone\": \"string\", \"linkedin\": \"string\", \"github\": \"string\", \"summary\": \"string\", \"experience\": [{\"title\": \"string\", \"company\": \"string\", \"dates\": \"string\"}], \"education\": [{\"degree\": \"string\", \"university\": \"string\", \"year\": \"string\"}], \"projects\": [{\"name\": \"string\", \"description\": \"string\"}], \"skills\": [\"string\"], \"languages\": [\"string\"]}. Omit any top-level keys for which the user has not provided data.",
});

const generationConfig = {
  temperature: 0.2, // Lower temperature for more predictable, structured output
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", 
};

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("⚠️  WARNING: Razorpay keys not configured. Payment functionality will not work.");
  console.warn("    Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
}

// CORS configuration - allow production and development origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://code-nexus-jade.vercel.app"
    ];

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Mount chatbot routes
app.use(chatbotRouter);

// Check user role endpoint
app.get("/check-role", async (req, res) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await getUsers();
    const user = users.find(u => u.email === decoded.email);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ role: user.role || "user" });
  } catch (error) {
    console.error("Error checking role:", error);
    res.status(500).json({ error: "Failed to check user role" });
  }
});

app.post("/generate-resume", async (req, res) => {
  try {
    const userData = req.body;
    
    const requiredDetails = ['name', 'email', 'phone', 'linkedin', 'github', 'summary'];
    for (const field of requiredDetails) {
        if (!userData[field] || userData[field].trim() === '') {
            return res.status(400).json({ error: `Missing required field: '${field}'.` });
        }
    }

    // Create a clean object of the data we want the AI to format
    const promptData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        linkedin: userData.linkedin,
        github: userData.github,
        summary: userData.summary,
        experience: userData.experience,
        education: userData.education,
        projects: userData.projects,
        skills: userData.skills,
        languages: userData.languages,
    };

    const result = await model.generateContent(JSON.stringify(promptData));
    const textResponse = await result.response.text();
    
    let resumeJson;
    try {
      // Remove emojis and special characters that break JSON parsing
      let cleanedResponse = textResponse.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
                                        .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
                                        .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
                                        .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
                                        .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
                                        .replace(/[\u{2700}-\u{27BF}]/gu, '');  // Dingbats
      
      // Find the JSON object
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        resumeJson = JSON.parse(jsonString);
      } else {
        throw new Error("No valid JSON object found in AI response.");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON. Raw AI response:", textResponse);
      console.error("Parse error:", parseError.message);
      return res.status(500).json({ 
        error: "Failed to parse resume data. Please try again.",
        details: parseError.message 
      });
    }

    res.json(resumeJson);

  } catch (error) {
    console.error("Error in /generate-resume:", error.message);
    res.status(500).json({ 
      error: "Failed to generate resume. Please try again.",
      details: error.message 
    });
  }
});

// ============================================
// PAYMENT ROUTES (Razorpay Integration)
// ============================================

// Create Razorpay order
app.post("/order", async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        message: "Payment gateway not configured. Please contact administrator." 
      });
    }

    const { amount, currency = "INR", receipt } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ msg: "Invalid amount" });
    }

    const options = {
      amount: parseInt(amount) * 100, // Convert to paisa (Razorpay uses smallest currency unit)
      currency,
      receipt: receipt || "receipt_" + Date.now(),
    };

    console.log("Creating order with options:", options);

    const order = await razorpay.orders.create(options);

    console.log("Order created successfully:", order.id);

    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err.response ? err.response.data : err.message);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// Validate Razorpay payment signature
app.post("/order/validate", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ msg: "Missing required payment fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ 
        msg: "Payment validation not configured",
        valid: false 
      });
    }

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);

    const digest = sha.digest("hex");

    if (digest !== razorpay_signature) {
      console.error("Payment signature mismatch");
      return res.status(400).json({ 
        msg: "Transaction not legitimate!",
        valid: false 
      });
    }

    console.log("Payment validated successfully:", razorpay_payment_id);

    res.json({
      msg: "Payment Successful",
      valid: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Validation error:", error);
    res.status(500).json({ 
      msg: "Error validating payment",
      error: error.message 
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    services: {
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      gemini: !!process.env.GEN_AI_SECRET,
      groq: !!process.env.GROQ_API_KEY
    }
  });
});

// ============================================
// MOCK INTERVIEW EVALUATION (Groq AI)
// ============================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/evaluate-interview", async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "AI evaluation service not configured" });
    }

    const prompt = `You are an expert technical interviewer. Evaluate the following interview answer and provide structured feedback in JSON format WITHOUT using any emojis.

Question: ${question}
Category: ${category || 'General'}
Answer: ${answer}

Provide your evaluation in this exact JSON format (NO EMOJIS):
{
  "score": <number 0-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "detailedFeedback": "A brief paragraph of detailed feedback",
  "keyPoints": ["key point 1", "key point 2"]
}

IMPORTANT: Do not use any emojis or special unicode characters in your response.

Focus on:
- Clarity and structure of the answer
- Technical accuracy (if applicable)
- Completeness of the response
- Communication skills
- Specific examples provided

Return ONLY the JSON object, no additional text or emojis.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
    
    // Remove any emojis that might have slipped through
    const cleanedResponse = aiResponse.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
    
    // Parse the JSON response
    let evaluation;
    try {
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = cleanedResponse.substring(jsonStart, jsonEnd + 1);
        evaluation = JSON.parse(jsonString);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedResponse);
      // Return a basic evaluation if parsing fails
      evaluation = {
        score: 5,
        strengths: ["Answer provided"],
        improvements: ["Could provide more detail"],
        detailedFeedback: "Unable to evaluate fully. Please try again.",
        keyPoints: ["Answer recorded"]
      };
    }

    res.json({
      success: true,
      evaluation
    });

  } catch (error) {
    console.error("Error in interview evaluation:", error);
    res.status(500).json({ 
      error: "Failed to evaluate answer",
      details: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`\n🚀 Server is running on http://localhost:${port}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('\n📋 Available endpoints:');
  console.log(`   - GET  /health          - Health check`);
  console.log(`   - GET  /check-role      - Check user role`);
  console.log(`   - POST /generate-resume - Generate resume`);
  console.log(`   - POST /chat            - Chatbot`);
  console.log(`   - POST /order           - Create payment order`);
  console.log(`   - POST /order/validate  - Validate payment`);
  console.log('\n💡 To seed the database with sample data, run: npm run seed\n');
});