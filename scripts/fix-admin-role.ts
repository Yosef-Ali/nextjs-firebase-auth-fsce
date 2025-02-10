import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// Initialize Firebase Admin
const app = initializeApp({
    credential: cert(serviceAccount as any)
});

const db = getFirestore(app);
const auth = getAuth(app);

async function fixAdminRole() {
    try {
        // Get user by email
        const userRecord = await auth.getUserByEmail('dev.yosefali@gmail.com');

        // Update custom claims
        await auth.setCustomUserClaims(userRecord.uid, { role: 'admin' });

        // Update Firestore document
        await db.collection('users').doc(userRecord.uid).set({
            email: 'dev.yosefali@gmail.com',
            role: 'admin',
            status: 'active',
            updatedAt: new Date().toISOString()
        }, { merge: true });

        console.log('Successfully updated admin role');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

fixAdminRole();