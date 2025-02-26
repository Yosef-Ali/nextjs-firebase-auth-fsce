import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Ensure this code only runs on the server
// "server-only" package makes Next.js throw a clear error if this file is imported on the client
import 'server-only';

function formatPrivateKey(key: string | undefined): string {
  if (!key) return '';

  // Handle the case where the key might have actual newlines
  if (key.includes('-----BEGIN PRIVATE KEY-----')) {
    return key.replace(/\\n/g, '\n');
  }

  // Handle the case where the key is a single-line base64 string
  if (!key.startsWith('-----')) {
    return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----\n`;
  }

  // Handle escaped newlines in the private key
  return key.replace(/\\n/g, '\n');
}

// Function to initialize Firebase Admin
function initializeFirebaseAdmin() {
  // Check if Firebase Admin SDK environment variables are properly set
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  // Skip Firebase Admin initialization in development if credentials are missing
  if ((!projectId || !clientEmail || !privateKeyRaw) && process.env.NODE_ENV !== 'production') {
    console.warn('Firebase Admin SDK credentials not found. Using mock admin app.');
    return { projectId: 'demo-project' } as any;
  }

  if (!projectId || !clientEmail || !privateKeyRaw) {
    throw new Error('Firebase Admin SDK credentials are missing. Check your environment variables.');
  }

  const privateKey = formatPrivateKey(privateKeyRaw);

  if (getApps().length === 0) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);

      // In development, provide a fallback to prevent breaking the app
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using mock admin app in development.');
        return { projectId: 'demo-project' } as any;
      }

      throw error;
    }
  }

  return getApps()[0];
}

// Initialize Firebase Admin
const app = initializeFirebaseAdmin();

// Export admin services
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminStorage = getStorage(app);
