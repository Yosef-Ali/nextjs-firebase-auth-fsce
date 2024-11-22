import * as admin from 'firebase-admin';

// Check if we already have a Firebase admin instance
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin with environment variables
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      } as admin.ServiceAccount)
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error?.message || error);
    throw error;
  }
}

export const adminAuth = admin.auth();
export default admin;
