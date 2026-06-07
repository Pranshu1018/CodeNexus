import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUsers } from "./firebaseClient.js"; 

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

app.use(cors({ 
  origin: [
    "https://code-nexus-jade.vercel.app",
    "http://localhost:5173"
  ], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// ... (your other routes like login, check-role remain the same) ...

app.post("/generate-resume", async (req, res) => {
  try {
    const userData = req.body;
    
    const requiredDetails = ['name', 'email', 'phone', 'linkedin', 'github', 'summary'];
    for (const field of requiredDetails) {
        if (!userData[field] || userData[field].trim() === '') {
            return res.status(400).json({ error: `Missing required field: '${field}'.` });
        }
    }

    // --- NEW: A cleaner, more direct prompt ---
    // Instead of a messy string, we create a clean object of the data we want the AI to format.
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
      // --- NEW: AGGRESSIVE CLEANING & PARSING ---
      // This is our defense against a misbehaving AI.
      // 1. Find the start of the JSON object '{'
      const jsonStart = textResponse.indexOf('{');
      // 2. Find the end of the JSON object '}'
      const jsonEnd = textResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        // 3. Extract just the JSON part.
        const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);
        // 4. Parse the clean string.
        resumeJson = JSON.parse(jsonString);
      } else {
        // If we can't even find a JSON object, throw an error.
        throw new Error("No valid JSON object found in AI response.");
      }
    } catch (parseError) {
      // If parsing fails even after cleaning, log the bad response and send an error.
      console.error("Failed to parse cleaned JSON. Raw AI response:", textResponse);
      throw new Error("AI returned malformed data.");
    }

    res.json(resumeJson);

  } catch (error) {
    console.error("DETAILED ERROR in /generate-resume:", error.message);
    res.status(500).json({ error: "Failed to generate or parse resume JSON." });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});