// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxxYwSQtkCTfc0-VhMChQU9oqIGD1-gsw",
  authDomain: "odell-cabin-webapp-aec44.firebaseapp.com",
  projectId: "odell-cabin-webapp-aec44",
  storageBucket: "odell-cabin-webapp-aec44.firebasestorage.app",
  messagingSenderId: "1097533097805",
  appId: "1:1097533097805:web:4a2549c53cb8cffaf95904"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);