import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

// Check if we already have a Firebase admin instance
if (!admin.apps.length) {
  try {
    // Read and parse the service account JSON file
    const serviceAccountPath = join(process.cwd(), 'config', 'service-account.json');
    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8')
    );

    // Initialize Firebase Admin with the service account
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin initialized successfully');
  } catch (error: any) {
    console.error('Error initializing Firebase Admin:', error?.message || error);
    if (error?.code === 'ENOENT') {
      console.error('Service account file not found. Please check if config/service-account.json exists.');
    }
    throw error;
  }
}

export const adminAuth = admin.auth();
export default admin;
