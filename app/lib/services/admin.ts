import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Get service account from environment variable
const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountRaw) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
}

let serviceAccount;
try {
  // Handle both JSON string and base64 encoded JSON
  if (serviceAccountRaw.startsWith('{')) {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } else {
    serviceAccount = JSON.parse(Buffer.from(serviceAccountRaw, 'base64').toString());
  }
} catch (error) {
  console.error('Error parsing service account:', error);
  throw new Error('Invalid service account configuration');
}

// Initialize the admin app if it hasn't been initialized
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as ServiceAccount)
  });
}

// Export admin instances
export const adminAuth = getAuth();
export const adminDb = getFirestore();

// User management functions
export async function createAdminUser(email: string, password: string, customClaims: object) {
  try {
    // Create the user
    const userRecord = await adminAuth.createUser({
      email,
      password,
      emailVerified: true
    });

    // Set custom claims (like admin role)
    await adminAuth.setCustomUserClaims(userRecord.uid, customClaims);

    // Create user document in Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      ...customClaims,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return userRecord;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

export async function verifyToken(token: string) {
  try {
    return await adminAuth.verifyIdToken(token);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    return await adminAuth.getUserByEmail(email);
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}

export async function updateUserRole(uid: string, role: string) {
  try {
    await adminAuth.setCustomUserClaims(uid, { role });
    await adminDb.collection('users').doc(uid).update({
      role,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function deleteUser(uid: string) {
  try {
    await adminAuth.deleteUser(uid);
    await adminDb.collection('users').doc(uid).delete();
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
