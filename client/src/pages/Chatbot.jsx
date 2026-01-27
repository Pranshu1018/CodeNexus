"use client"

import { useState, useEffect, useRef } from "react"
import { Send, X, MessageSquare } from "lucide-react"

function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const chatBodyRef = useRef(null)
  const inputRef = useRef(null)

  const faqData = [
    { question: "What are the best full-stack courses?", answer: "Check our roadmap here: [link]" },
    { question: "How do I participate in hackathons?", answer: "Visit our hackathon section here: [link]" },
    {
      question: "What is full stack development?",
      answer: "Full stack development includes frontend, backend, and databases.",
    },
  ]

  function getFAQResponse(userQuery) {
    for (const faq of faqData) {
      if (userQuery.toLowerCase().includes(faq.question.toLowerCase())) {
        return faq.answer
      }
    }
    return null
  }

  async function getAIResponse(userQuery) {
    setInput("")
    try {
      setIsTyping(true)
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery }),
      })

      const data = await response.json()

      // Extract meaningful response
      if (typeof data === "string") return data

      if (typeof data === "object" && data !== null) {
        const firstKey = Object.keys(data)[0] // Get first key in the response
        const value = data[firstKey]

        if (Array.isArray(value)) {
          return value
            .map((item) => {
              if (typeof item === "string") return item // Simple strings
              if (typeof item === "object") return Object.values(item).join(" - ") // Objects
              return item
            })
            .join("\n\n") // Proper spacing
        }
        return value
      }

      return "I'm not sure, please try rephrasing!"
    } catch (error) {
      console.error("Error:", error)
      return "Sorry, I couldn't process that request."
    } finally {
      setIsTyping(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    // Append the user message
    const userMessage = { text: input, sender: "user" }
    setMessages((prev) => [...prev, userMessage])

    // Fetch bot response (either from FAQ or AI)
    let botResponse = getFAQResponse(input)
    if (!botResponse) {
      botResponse = await getAIResponse(input)
    }

    // Append the bot response
    const botMessage = { text: botResponse, sender: "bot" }
    setMessages((prev) => [...prev, botMessage])

    setInput("") // Clear input field
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    // Focus the input field when opening the chat
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  // Auto-scroll to the bottom whenever messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="chatbot-container">
      {isOpen ? (
        <div className="chatbot-card">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <MessageSquare className="chatbot-icon" size={20} />
              <span>Chat Assistant</span>
            </div>
            <button onClick={toggleChat} className="chatbot-close-button" aria-label="Close chat">
              <X size={20} />
            </button>
          </div>
          <div ref={chatBodyRef} className="chatbot-body">
            {messages.length === 0 ? (
              <div className="chatbot-welcome">
                <h3>Welcome to our Chat Assistant</h3>
                <p>How can I help you today? You can ask me about:</p>
                <ul>
                  <li>Full-stack courses</li>
                  <li>Hackathons</li>
                  <li>Development resources</li>
                </ul>
              </div>
            ) : (
              <div className="chatbot-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.sender === "user" ? "user-message" : "bot-message"}`}>
                    <div className="message-content">{msg.text}</div>
                  </div>
                ))}
                {isTyping && (
                  <div className="message bot-message">
                    <div className="message-content typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="chatbot-footer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="chatbot-input"
              rows={2}
            />
            <button
              onClick={sendMessage}
              className="chatbot-send-button"
              disabled={!input.trim() || isTyping}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button onClick={toggleChat} className="chatbot-toggle-button" aria-label="Open chat">
          <MessageSquare size={20} />
          <span>Chat with us</span>
        </button>
      )}
      <style jsx>{`
        .chatbot-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 50;
        }
        
        .chatbot-card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 800px;
          height: 80vh;
          max-height: 800px;
          background-color: #0d1117;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          pointer-events: auto;
          border: 1px solid #1f2937;
          animation: scaleIn 0.3s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            transform: translate(-50%, -50%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }
        
        .chatbot-header {
          padding: 20px 24px;
          background-color: #0f172a;
          color: #fff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #1f2937;
        }
        
        .chatbot-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.1rem;
          font-weight: 600;
        }
        
        .chatbot-icon {
          color: #10b981;
        }
        
        .chatbot-close-button {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
        }
        
        .chatbot-close-button:hover {
          color: #f9fafb;
          background-color: #1f2937;
        }
        
        .chatbot-body {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background-color: #0d1117;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }
        
        .chatbot-welcome {
          color: #d1d5db;
          background-color: #1f2937;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 16px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .chatbot-welcome h3 {
          color: #10b981;
          margin: 0 0 16px;
          font-size: 1.25rem;
        }
        
        .chatbot-welcome p {
          margin-bottom: 8px;
        }
        
        .chatbot-welcome ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .chatbot-welcome li {
          margin-bottom: 4px;
        }
        
        .chatbot-messages {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          display: flex;
          max-width: 70%;
        }
        
        .user-message {
          align-self: flex-end;
        }
        
        .bot-message {
          align-self: flex-start;
        }
        
        .message-content {
          padding: 12px 18px;
          border-radius: 20px;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }
        
        .user-message .message-content {
          background-color: #10b981;
          color: #f9fafb;
          border-bottom-right-radius: 4px;
        }
        
        .bot-message .message-content {
          background-color: #1f2937;
          color: #f9fafb;
          border-bottom-left-radius: 4px;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 14px;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: #9ca3af;
          border-radius: 50%;
          display: inline-block;
          animation: bounce 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
        
        .chatbot-footer {
          padding: 20px 24px;
          background-color: #0f172a;
          display: flex;
          gap: 12px;
          align-items: flex-end;
          border-top: 1px solid #1f2937;
        }
        
        .chatbot-input {
          flex: 1;
          border-radius: 12px;
          border: 1px solid #1f2937;
          padding: 14px 16px;
          resize: none;
          background-color: #1f2937;
          color: #f9fafb;
          font-size: 15px;
          line-height: 1.5;
          max-height: 120px;
          min-height: 50px;
        }
        
        .chatbot-send-button {
          padding: 14px;
          background-color: #10b981;
          border: none;
          border-radius: 12px;
          color: #f9fafb;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .chatbot-send-button:hover {
          background-color: #059669;
        }
        
        .chatbot-send-button:disabled {
          background-color: #1f2937;
          color: #6b7280;
          cursor: not-allowed;
        }
        
        .chatbot-toggle-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          padding: 14px 24px;
          background-color: #10b981;
          border: none;
          border-radius: 30px;
          color: #f9fafb;
          cursor: pointer;
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 500;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.2s;
        }
        
        .chatbot-toggle-button:hover {
          background-color: #059669;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .chatbot-card {
            width: 100vw;
            height: 100vh;
            max-width: none;
            max-height: none;
            border-radius: 0;
          }
          
          .message {
            max-width: 85%;
          }
          
          .chatbot-welcome {
            padding: 20px;
          }
        }
        
        /* Keep other existing styles but update colors to match site theme */
        /* ... rest of the styles ... */
      `}</style>
    </div>
  )
}

export default Chatbot

