import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCa37b-LuakNl2TwsZQES2-p_DgGgIJEuA",
  authDomain: "login-db9bb.firebaseapp.com",
  projectId: "login-db9bb",
  storageBucket: "login-db9bb.firebasestorage.app",
  messagingSenderId: "132451184061",
  appId: "1:132451184061:web:972c781b670cdff773f6d4"
};

// Initialize Firebase using the singleton pattern for Next.js
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
