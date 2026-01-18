// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <-- add this

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBtuJyF2wH65yQVgTgkmQF6Fzb3RhSlme0",
  authDomain: "happyhour-b95cf.firebaseapp.com",
  projectId: "happyhour-b95cf",
  storageBucket: "happyhour-b95cf.firebasestorage.app",
  messagingSenderId: "131821768776",
  appId: "1:131821768776:web:bf7a2761f1ee4f8dc1887d",
  measurementId: "G-4ZX4NSJBQR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
