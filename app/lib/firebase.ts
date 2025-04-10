import { initializeApp, getApp, getApps } from 'firebase/app';
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  Timestamp,
  disableNetwork,
  enableNetwork,
  setLogLevel,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore
} from 'firebase/firestore';
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

// Set Firestore log level to reduce noise
if (process.env.NODE_ENV !== 'production') {
  setLogLevel('error'); // Only show errors, not warnings
}

// Initialize Firestore with settings to prevent duplicate listener issues
export const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Use long polling instead of WebSockets
  ignoreUndefinedProperties: true // Ignore undefined fields
});

export const auth = getAuth(app);
export const storage = getStorage(app);

// Helper functions for Timestamp conversion
export const fromTimestamp = (timestamp: Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined;
};

export const toTimestamp = (date: Date | undefined): Timestamp | undefined => {
  return date ? Timestamp.fromDate(date) : undefined;
};

// Global variable to track if we've already set up listeners
let networkListenersInitialized = false;

// Enable offline persistence with better error handling
if (typeof window !== 'undefined') {
  // Check network status first
  const isOnline = navigator.onLine;

  // Configure persistence - only once
  enableIndexedDbPersistence(db, {
    forceOwnership: true // Force ownership to prevent multiple tab issues
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser doesn\'t support persistence.');
    } else {
      console.error('Persistence error:', err);
    }
  });

  // Set up network status listeners - only once
  if (!networkListenersInitialized) {
    networkListenersInitialized = true;

    // Handle online status
    window.addEventListener('online', () => {
      console.log('App is online. Enabling Firestore network');
      enableNetwork(db).catch(err => console.error('Error enabling network:', err));

      // Reload the page to reset all listeners
      window.location.reload();
    });

    // Handle offline status
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

  // Set up global error handler for Firestore errors
  window.addEventListener('error', (event) => {
    const errorMessage = event.message || '';

    // Check if this is a Firestore 'already-exists' error
    if (errorMessage.includes('already-exists') || errorMessage.includes('Target ID already exists')) {
      console.warn('Detected Firestore listener conflict. Reloading page to reset listeners.');

      // Prevent the error from showing in the console
      event.preventDefault();

      // Reload the page to reset all listeners
      window.location.reload();

      return false;
    }
  });
}

// Use emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}

export { app };
