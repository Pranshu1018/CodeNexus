// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { getDatabase, ref, get, child, update } from 'firebase/database';

// UNIFIED Firebase configuration - Using codenexus-73e44 for EVERYTHING
const firebaseConfig = {
  apiKey: "AIzaSyDFh9bPD6qBpi7O2DuyanCbnIukgrDdz8I",
  authDomain: "codenexus-73e44.firebaseapp.com",
  projectId: "codenexus-73e44",
  storageBucket: "codenexus-73e44.firebasestorage.app",
  messagingSenderId: "967705627157",
  appId: "1:967705627157:web:fa9e9fb9be8a8da0841c1c",
  measurementId: "G-VPDC2NWJDR"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// All services from the same project
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const database = getDatabase(app);

// Analytics

// Default export
export default app;

// Export database utilities
export { ref, get, child, update,  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs };