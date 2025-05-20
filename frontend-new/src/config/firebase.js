// File: firebase.js
// Purpose: Firebase initialization and configuration

import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Import Firebase Auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWj6oe0Vn_yoDOfaVYfuBTUibHNKwu1-8",
  authDomain: "tradelogix-9f574.firebaseapp.com",
  projectId: "tradelogix-9f574",
  storageBucket: "tradelogix-9f574.firebasestorage.app",
  messagingSenderId: "500665717468",
  appId: "1:500665717468:web:29cad6f1c299bd41905a19",
  measurementId: "G-Z3HQ6R5FJQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (this is what we'll use for the database)
const db = getFirestore(app);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firebase Auth
const auth = getAuth(app);

console.log('Using real Firebase implementation');

// Export the app, db, analytics, and Firestore methods
export { 
  app, 
  db,
  auth, // Export auth
  analytics,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  setDoc
};
