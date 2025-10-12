// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck",
  authDomain: "rydadmin-hub.firebaseapp.com",
  projectId: "rydadmin-hub",
  storageBucket: "rydadmin-hub.firebasestorage.app",
  messagingSenderId: "20289389765",
  appId: "1:20289389765:web:89e94da7bf396fc946dcac",
  measurementId: "G-B69WZL3B7Y"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;