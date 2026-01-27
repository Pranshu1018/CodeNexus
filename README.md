
# 🚀 Code Nexus

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
</div>

## 📖 Overview

**Code Nexus** is a comprehensive online education platform designed to help students master web development, Data Structures & Algorithms (DSA), and various computer science topics. This full-stack application provides an immersive learning experience with interactive tools, real-time assistance, and a vibrant community.

## 🌐 Live Demo

**Website URL:** [https://code-nexus-six.vercel.app/](https://code-nexus-six.vercel.app/)
(but the updated part is on github and not on vercel)

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/36b2abed-d39d-4ff2-9c50-d69d76688463" alt="Dashboard View" width="45%">
  <img src="https://github.com/user-attachments/assets/f903f663-c678-4825-a779-26933a298de7" alt="Code Editor" width="45%">
</div>
<div align="center">
  <img src="https://github.com/user-attachments/assets/f9374dd9-14d5-47cb-9824-71b922ece987" alt="Learning Paths" width="45%">
</div>

## ✨ Features

### 🎯 **Learning Paths**
- Curated courses and roadmaps for web development, DSA, and various CS topics
- Structured learning modules with progress tracking
- Personalized recommendations based on skill level

### 💻 **Code Editor**
- Integrated multi-language code editor (JavaScript, Python, Java, C++)
- Syntax highlighting with multiple themes
- Real-time code execution and testing
- Support for collaborative coding sessions

### 📝 **Daily Exercises**
- Fresh coding challenges updated daily
- Difficulty-based problem categorization
- Solution explanations and alternative approaches
- Performance analytics and progress tracking

### 🏆 **Codeforces Integration**
- Direct integration with Codeforces problem database
- Automatic problem fetching and submission
- Real-time contest updates and notifications
- Personalized problem recommendations

### 🤖 **AI Chatbot Assistance**
- Powered by Google Gemini AI for intelligent coding assistance
- Context-aware help for debugging and optimization
- Code review and suggestions
- 24/7 learning support

### 🎪 **Hackathon Discovery**
- Discover upcoming hackathons and coding competitions
- Team formation and collaboration tools
- Project showcase and networking opportunities
- Skill-based event recommendations

### 📜 **Certified Courses**
- Industry-recognized certifications
- Comprehensive curriculum with hands-on projects
- Skill assessment and validation
- Shareable certificates and badges

### 👨‍🏫 **Mentor Assistance**
- Connect with experienced industry professionals
- One-on-one guidance and code reviews
- Career advice and interview preparation
- Personalized learning roadmaps

### 💬 **Community Support**
- Discussion forums and Q&A sections
- Peer-to-peer learning and knowledge sharing
- Code collaboration and review system
- Study groups and team formation

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **CodeMirror** - Advanced code editor component
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **GSAP** - Animation library
- **Recharts** - Data visualization

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Firebase** - Real-time database and authentication
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Razorpay** - Payment integration
- **Google Generative AI** - AI chatbot functionality
- **Nodemon** - Development auto-restart

### **Database & Services**
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Authentication** - User management
- **Firebase Admin SDK** - Backend Firebase integration

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account and project setup

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Pranshu1018/CodeNexus.git
   cd Code-Nexus
   ```

2. **Install dependencies for both client and server**
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   **Client Environment (client/.env):**
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=http://localhost:5000
   ```
   
   **Server Environment (server/.env):**
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   GEMINI_API_KEY=your_gemini_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   JWT_SECRET=your_jwt_secret
   ```

4. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and Realtime Database
   - Download service account key and place it in `server/serviceAccountKey.json`
   - Configure Firebase SDK in the client

5. **Run the application**
   ```bash
   # Start the server (in server directory)
   npm start
   
   # Start the client (in client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
Code-Nexus/
├── client/                 # React frontend application
│   ├── public/            # Static assets
│   ├── src/               # Source code
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # CSS and styling files
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
├── server/                # Node.js backend application
│   ├── firebaseAdmin.js   # Firebase admin configuration
│   ├── server.js          # Main server file
│   ├── chatbot.js         # AI chatbot service
│   ├── editorServer.js    # Code execution service
│   ├── scraper.js         # Web scraping utilities
│   └── package.json       # Backend dependencies
└── README.md             # Project documentation
```

## 🔧 Available Scripts

### **Client Scripts**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### **Server Scripts**
```bash
npm start        # Start main server
npm run pay      # Start payment service
npm run call     # Start calling service
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the package.json file for details.

## 👨‍💻 Author

**Pranshu Singh**
- GitHub: [@Pranshu1018](https://github.com/Pranshu1018/CodeNexus.git)

## 🙏 Acknowledgments

- [React](https://reactjs.org/) for the amazing UI framework
- [Firebase](https://firebase.google.com/) for the backend services
- [Vite](https://vitejs.dev/) for the lightning-fast build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [CodeMirror](https://codemirror.net/) for the powerful code editor
- All contributors and users who make this project better!

## 📞 Support

If you have any questions, suggestions, or need support, feel free to:
- Open an issue on GitHub
- Contact me at [pranshusingh07d@gmail.com]
- Join our community Discord server

---

<div align="center">
  <strong>⭐ Star this repository if it helped you! ⭐</strong>
</div>

