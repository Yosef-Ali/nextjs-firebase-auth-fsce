import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as dotenv from 'dotenv';

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

const EMAIL_TO_CHECK = 'dev.yosefali@gmail.com';

async function checkUserRole() {
    try {
        // Get user from Auth
        const userRecord = await auth.getUserByEmail(EMAIL_TO_CHECK);
        console.log('\nAuth User Record:');
        console.log('UID:', userRecord.uid);
        console.log('Email:', userRecord.email);
        console.log('Custom Claims:', userRecord.customClaims);

        // Get user from Firestore
        const userDoc = await db.collection('users').doc(userRecord.uid).get();
        if (userDoc.exists) {
            console.log('\nFirestore User Data:');
            console.log(userDoc.data());
        } else {
            console.log('\nNo Firestore document found for this user');
        }

    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            console.log(`\nUser ${EMAIL_TO_CHECK} not found in Firebase Auth.`);
            console.log('Try running fix-my-admin.ts first to create the user.');
        } else {
            console.error('Error:', error);
        }
    } finally {
        process.exit(0);
    }
}

checkUserRole();
