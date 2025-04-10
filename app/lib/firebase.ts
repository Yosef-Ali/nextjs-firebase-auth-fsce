import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator, Timestamp, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Helper functions for Timestamp conversion
export const fromTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined;
};

export const toTimestamp = (date: Date | undefined): Timestamp | undefined => {
  return date ? Timestamp.fromDate(date) : undefined;
};

// Enable offline persistence with better error handling
if (typeof window !== 'undefined') {
  // Check network status first
  const isOnline = navigator.onLine;

  // Configure persistence
  enableIndexedDbPersistence(db, {
    forceOwnership: false
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.');
    } else {
      console.error('Persistence error:', err);
    }
  });

  // Set up network status listeners
  window.addEventListener('online', () => {
    console.log('App is online. Enabling Firestore network');
    enableNetwork(db).catch(err => console.error('Error enabling network:', err));
  });

  window.addEventListener('offline', () => {
    console.log('App is offline. Disabling Firestore network');
    disableNetwork(db).catch(err => console.error('Error disabling network:', err));
  });

  // If offline at startup, disable network to prevent connection attempts
  if (!isOnline) {
    console.log('App started offline. Disabling Firestore network');
    disableNetwork(db).catch(err => console.error('Error disabling network at startup:', err));
  }
}

// Use emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app };
