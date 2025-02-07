import admin from 'firebase-admin';
import { UserRole } from '../app/types/user';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

async function updateUserRoles() {
  try {
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    const db = admin.firestore();

    // Get all users from Firestore
    const usersSnapshot = await db.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;

      // Get role from Firestore document
      const role = userData.role || UserRole.USER;

      try {
        // Check if user exists in Firebase Auth
        await admin.auth().getUser(uid);
        
        // Update custom claims in Firebase Auth
        await admin.auth().setCustomUserClaims(uid, { role });
        console.log(`Updated role for user ${userData.email} (${uid}) to ${role}`);
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`Skipping user ${userData.email} (${uid}): User not found in Firebase Auth`);
        } else {
          throw authError;
        }
      }
    }

    console.log('Successfully updated user roles in Firebase Authentication.');
  } catch (error) {
    console.error('Error updating user roles:', error);
    process.exit(1);
  } finally {
    // Clean up
    await admin.app().delete();
    process.exit(0);
  }
}

updateUserRoles();
