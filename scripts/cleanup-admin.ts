import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

const app = initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore(app);
const auth = getAuth(app);

const EMAIL_TO_CLEANUP = 'dev.yosefali@gmail.com';

async function cleanupAdmin() {
    try {
        // Try to get the user
        try {
            const userRecord = await auth.getUserByEmail(EMAIL_TO_CLEANUP);
            
            // Delete from Firestore first
            await db.collection('users').doc(userRecord.uid).delete();
            console.log('Deleted Firestore document');

            // Delete from Auth
            await auth.deleteUser(userRecord.uid);
            console.log('Deleted Auth user');

        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log('User not found - nothing to clean up');
            } else {
                throw error;
            }
        }

        console.log('Cleanup completed successfully');
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        process.exit(0);
    }
}

cleanupAdmin();
