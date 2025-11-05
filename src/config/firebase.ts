import { initializeApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCAzJf4xhj8YHT6ArbmVdzkOpGKwFTHkCU",
  authDomain: "wasilah-new.firebaseapp.com",
  projectId: "wasilah-new",
  storageBucket: "wasilah-new.firebasestorage.app",
  messagingSenderId: "577353648201",
  appId: "1:577353648201:web:322c63144b84db4d2c5798"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Configure Google Auth Provider with popup settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Configure Facebook Auth Provider
export const facebookProvider = new FacebookAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

// Cloud Functions (client)
export const functions = getFunctions(app);

export default app;

// Expose Firebase to window for browser console access (development only)
// Only enable in development mode to prevent exposure in production
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  interface WindowWithFirebase extends Window {
    db?: typeof db;
    auth?: typeof auth;
    storage?: typeof storage;
    firestoreExports?: typeof import('firebase/firestore');
  }
  
  const windowWithFirebase = window as WindowWithFirebase;
  windowWithFirebase.db = db;
  windowWithFirebase.auth = auth;
  windowWithFirebase.storage = storage;
  
  // Also expose Firestore functions for console scripts
  import('firebase/firestore').then((firestoreModule) => {
    windowWithFirebase.firestoreExports = firestoreModule;
  });
}