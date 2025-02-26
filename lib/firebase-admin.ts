import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

// Ensure this code only runs on the server
// "server-only" package makes Next.js throw a clear error if this file is imported on the client
import 'server-only';

function formatPrivateKey(key: string | undefined): string {
  console.log('Original private key:', key);
  if (!key) return '';

  // If the key already has the correct format with newlines, return it
  if (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('\n')) {
    console.log('Key already has correct format');
    return key;
  }

  // If the key has the BEGIN/END markers but no proper newlines
  if (key.includes('-----BEGIN PRIVATE KEY-----') && !key.includes('\n')) {
    console.log('Key has BEGIN/END markers but no newlines');
    const formattedKey = key.replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
      .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----\n');
    console.log('Formatted key:', formattedKey);
    return formattedKey;
  }

  // If the key is a raw base64 string (no BEGIN/END markers)
  if (!key.includes('-----BEGIN')) {
    console.log('Key is a raw base64 string');
    const formattedKey = `-----BEGIN PRIVATE KEY-----\n${key.replace(/\\n/g, '\n')}\n-----END PRIVATE KEY-----\n`;
    console.log('Formatted key:', formattedKey);
    return formattedKey;
  }

  // Handle escaped newlines in the private key
  const formattedKey = key.replace(/\\n/g, '\n');
  console.log('Key has escaped newlines, formatted key:', formattedKey);
  return formattedKey;
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
      // Additional debugging in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        console.log('Initializing Firebase Admin with project:', projectId);
        // Log first few chars of private key format to debug without exposing it
        const keyPreview = privateKey.substring(0, 60) + '...';
        console.log('Private key format:', keyPreview);
      }

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
