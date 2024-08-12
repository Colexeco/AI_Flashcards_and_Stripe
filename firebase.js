// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.local.FIREBASE_API_KEY,
  authDomain: "flashcardsaas-bcc7d.firebaseapp.com",
  projectId: "flashcardsaas-bcc7d",
  storageBucket: "flashcardsaas-bcc7d.appspot.com",
  messagingSenderId: "225163481418",
  appId: "1:225163481418:web:f41586a6b91e795d5271b3",
  measurementId: "G-8KCLEQXFV1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);