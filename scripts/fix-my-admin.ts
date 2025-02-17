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

const app = initializeApp({
    credential: cert(serviceAccount as any)
});

const db = getFirestore(app);
const auth = getAuth(app);

const EMAIL_TO_FIX = 'dev.yosefali@gmail.com'; // Admin email
const DEFAULT_PASSWORD = 'StrongP@ssw0rd123!'; // Admin password

async function fixAdminAccess() {
    try {
        let userRecord;

        try {
            userRecord = await auth.getUserByEmail(EMAIL_TO_FIX);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                userRecord = await auth.createUser({
                    email: EMAIL_TO_FIX,
                    password: DEFAULT_PASSWORD,
                    emailVerified: true
                });
                console.log('Created new user:', EMAIL_TO_FIX);
            } else {
                throw error;
            }
        }

        // Update custom claims with ADMIN role
        await auth.setCustomUserClaims(userRecord.uid, { 
            role: 'ADMIN'
        });

        // Update Firestore document with ADMIN role
        await db.collection('users').doc(userRecord.uid).set({
            email: EMAIL_TO_FIX,
            role: 'ADMIN',
            status: 'active',
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            displayName: EMAIL_TO_FIX.split('@')[0],
            emailVerified: true
        }, { merge: true });

        console.log('Successfully fixed admin access for:', EMAIL_TO_FIX);
        console.log('If this is a new user, the password is:', DEFAULT_PASSWORD);
        console.log('Please change your password after first login!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

fixAdminAccess();
