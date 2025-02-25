// Basic Firebase admin initialization for server-side operations
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it's not already initialized
let adminApp: admin.app.App;

try {
    adminApp = admin.app();
} catch {
    const serviceAccount = require('../../../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

    adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

// Export admin services
export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);
export const adminStorage = admin.storage(adminApp);

// Admin user creation service
export const createAdminUser = async (email: string, password: string, displayName: string) => {
    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName,
            emailVerified: true,
        });

        // Set custom claims to mark as admin
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            role: 'admin',
            approved: true
        });

        // Create user document in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            uid: userRecord.uid,
            email,
            displayName,
            role: 'admin',
            status: 'active',
            emailVerified: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return {
            success: true,
            uid: userRecord.uid
        };
    } catch (error) {
        console.error('Error creating admin user:', error);
        return {
            success: false,
            error: (error as Error).message
        };
    }
};