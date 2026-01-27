// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {onSnapshot} from "firebase/firestore";
import {collection, getDocs, query, where} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBwsAunM3nRNUHUzFb9yUmKzCeoqigTHOY",
  authDomain: "megahack-a6ee9.firebaseapp.com",
  projectId: "megahack-a6ee9",
  storageBucket: "megahack-a6ee9.firebasestorage.app",
  messagingSenderId: "613646385300",
  appId: "1:613646385300:web:f0ef5ac76d0330b22c3481",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider(app)
export const db=getFirestore(app);

let users = [];


onSnapshot(collection(db, "users"), (snapshot) => {
  users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  console.log("Users updated:", users); // Debugging purpose
});

// Function to get latest users
const getUsers = () => users;

export { getUsers };
