import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAf3sxtgaLYjuhUOepK5Hljm2kI4BtEKxg",
  authDomain: "shankhcall.firebaseapp.com",
  projectId: "shankhcall",
  storageBucket: "shankhcall.firebasestorage.app",
  messagingSenderId: "797642858514",
  appId: "1:797642858514:web:13970ef7e1243848f278cb"
};


// Initialize Firebase using the singleton pattern for Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
