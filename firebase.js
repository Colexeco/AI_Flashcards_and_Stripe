// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "flashcard-ai-806f8.firebaseapp.com",
  projectId: "flashcard-ai-806f8",
  storageBucket: "flashcard-ai-806f8.appspot.com",
  messagingSenderId: "757650125802",
  appId: "1:757650125802:web:5d084351dd72eafff23893",
  measurementId: "G-CHXR7R0NEK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
