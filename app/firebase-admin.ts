import * as admin from 'firebase-admin';

// Check if we already have a Firebase admin instance
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with environment variables
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is not set in environment variables');
    }

    // Try to initialize with the raw private key
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        } as admin.ServiceAccount)
      });
    } catch (e) {
      // If raw private key fails, try with newline replacement
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: formattedKey,
        } as admin.ServiceAccount)
      });
    }
    
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export const auth = admin.auth();
export const db = admin.firestore();
