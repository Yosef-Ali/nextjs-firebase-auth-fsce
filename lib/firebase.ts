// Import the functions you need from the SDKs you need
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Enable emulators for local development
if (process.env.NODE_ENV === 'development') {
  try {
    if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Firebase emulators connected');
    }
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
  }
}

export { app, auth, db, storage };
