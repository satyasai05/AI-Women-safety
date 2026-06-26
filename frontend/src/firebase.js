// src/firebase.js
// Firebase configuration and initialization for GuardHer web app
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtcYSjjaB1aydCLdTSSSx17zd5TZxcxfA",
  authDomain: "ai-women-safety-1d315.firebaseapp.com",
  projectId: "ai-women-safety-1d315",
  storageBucket: "ai-women-safety-1d315.firebasestorage.app",
  messagingSenderId: "742523312547",
  appId: "1:742523312547:web:f68597a61b463fe392e216",
  measurementId: "G-LB435PXHHY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export Firestore and Auth instances for use throughout the app
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
