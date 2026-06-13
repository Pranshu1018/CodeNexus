// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {onSnapshot} from "firebase/firestore";
import {collection, getDocs, query, where} from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider(app)
export const db=getFirestore(app);

let users = [];

// Listen to users collection with error handling
onSnapshot(
  collection(db, "users"), 
  (snapshot) => {
    users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log("Users updated:", users.length, "users"); // Debugging purpose
  },
  (error) => {
    // Silently handle permission errors - this is expected when not authenticated
    if (error.code === 'permission-denied') {
      console.log("Note: User snapshot listener not active (authentication required)");
    } else {
      console.error("Error in users snapshot listener:", error);
    }
  }
);

// Function to get latest users
const getUsers = () => users;

export { getUsers };
