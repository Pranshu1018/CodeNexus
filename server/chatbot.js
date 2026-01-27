import express from "express";
import { db } from "./firebaseAdmin.js";  // Firestore connection
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI("AIzaSyBCFwfsQ90lJHiQmHdXL6rFfyTGN8zCICw");

// 🔹 Get predefined FAQs from Firestore
async function getFAQResponse(userQuery) {
    const snapshot = await db.collection("faqs").get();
    let bestMatch = null;

    snapshot.forEach((doc) => {
        const faq = doc.data();
        if (userQuery.toLowerCase().includes(faq.question.toLowerCase())) {
            bestMatch = faq.answer;
        }
    });

    return bestMatch;
}

// 🔹 Generate AI Response using Google Gemini
async function getAIResponse(userQuery) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(userQuery);
    console.log(result)
    return result.response.text();
}

// 🔹 Main Chat Route
router.post("/chat", async (req, res) => {
    const { message } = req.body;
    
    // Check Firestore FAQs first
    const faqResponse = await getFAQResponse(message);
    if (faqResponse) {
        return res.json({ response: faqResponse });
    }

    // If no match, use AI
    const aiResponse = await getAIResponse(message);
    res.json({ response: aiResponse });
});

export default router;
