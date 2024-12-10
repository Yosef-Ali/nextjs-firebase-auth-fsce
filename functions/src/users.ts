import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface UserData {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string;
  role: 'user' | 'admin';
  status: 'pending' | 'active' | 'suspended';
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
}

// Function to handle new user creation
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role: 'user', // Default role
      status: 'pending', // Default status
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Add user to Firestore
    await db.collection('users').doc(user.uid).set(userDoc);
    functions.logger.info(`New user ${user.uid} added to Firestore`);
    
    return null;
  } catch (error) {
    functions.logger.error('Error creating user document:', error);
    throw error;
  }
});

// Function to handle user deletion
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    // Remove user data from Firestore
    await db.collection('users').doc(user.uid).delete();
    functions.logger.info(`User ${user.uid} deleted from Firestore`);
    
    return null;
  } catch (error) {
    functions.logger.error('Error deleting user document:', error);
    throw error;
  }
});

// Function to update user role
export const updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if the caller is authenticated and has admin role
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to update roles.'
    );
  }

  const callerUid = context.auth.uid;
  const callerDoc = await db.collection('users').doc(callerUid).get();
  const callerData = callerDoc.data();

  if (!callerData || callerData.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can update user roles.'
    );
  }

  const { uid, role } = data;
  if (!uid || !role) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'User ID and role are required.'
    );
  }

  try {
    // Update custom claims
    await admin.auth().setCustomUserClaims(uid, { role });
    
    // Update user document
    await db.collection('users').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    functions.logger.info(`User ${uid} role updated to ${role}`);
    return { success: true };
  } catch (error) {
    functions.logger.error('Error updating user role:', error);
    throw new functions.https.HttpsError('internal', 'Error updating user role');
  }
});
