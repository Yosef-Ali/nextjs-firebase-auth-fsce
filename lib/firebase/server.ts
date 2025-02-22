import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { cert, initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

const adminConfig = {
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY || '{}')),
};

const adminApp = !getApps().length ? initializeAdminApp(adminConfig, 'admin') : getApp('admin');
export const adminAuth = getAdminAuth(adminApp);
export const adminDb = getAdminFirestore(adminApp);