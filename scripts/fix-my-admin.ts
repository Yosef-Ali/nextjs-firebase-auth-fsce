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

const EMAIL_TO_FIX = 'dev.yosefali@gmail.com';
const DEFAULT_PASSWORD = 'StrongP@ssw0rd123!';

async function fixAdminAccess() {
    try {
        let userRecord;

        try {
            // Try to get existing user
            userRecord = await auth.getUserByEmail(EMAIL_TO_FIX);
            console.log('Found existing user:', EMAIL_TO_FIX);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                // Create new user if not found
                userRecord = await auth.createUser({
                    email: EMAIL_TO_FIX,
                    password: DEFAULT_PASSWORD,
                    emailVerified: true
                });
                console.log('Created new user:', EMAIL_TO_FIX);
                console.log('Password:', DEFAULT_PASSWORD);
                console.log('Please change your password after first login!');
            } else {
                throw error;
            }
        }

        // Update custom claims with admin role
        await auth.setCustomUserClaims(userRecord.uid, { 
            role: 'ADMIN'
        });

        // Update or create Firestore document
        await db.collection('users').doc(userRecord.uid).set({
            email: EMAIL_TO_FIX,
            role: 'ADMIN',
            status: 'ACTIVE',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            displayName: EMAIL_TO_FIX.split('@')[0],
            emailVerified: true,
            uid: userRecord.uid
        }, { merge: true });

        console.log('\nSuccessfully fixed admin access for:', EMAIL_TO_FIX);
        console.log('User ID:', userRecord.uid);

        // Verify the setup
        const updatedUser = await auth.getUser(userRecord.uid);
        console.log('\nVerified User Claims:', updatedUser.customClaims);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

fixAdminAccess();
