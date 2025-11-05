import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
// These values are safe to expose in client-side code as they identify your Firebase project
// Security is enforced through Firestore and Storage rules
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCAzJf4xhj8YHT6ArbmVdzkOpGKwFTHkCU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "wasilah-new.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "wasilah-new",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "wasilah-new.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "577353648201",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:577353648201:web:322c63144b84db4d2c5798"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Cloud Functions (client)
export const functions = getFunctions(app);

export default app;

// Expose Firebase to window for browser console access (development only)
if (typeof window !== 'undefined') {
  (window as any).db = db;
  (window as any).auth = auth;
  (window as any).storage = storage;
  
  // Also expose Firestore functions for console scripts
  import('firebase/firestore').then((firestoreModule) => {
    (window as any).firestoreExports = firestoreModule;
  });
}