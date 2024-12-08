import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Function to handle new user creation
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    const userDoc = {
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

    // Log the action
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
    // Delete user document from Firestore
    await db.collection('users').doc(user.uid).delete();

    // Delete any associated data (e.g., user's posts)
    const userPosts = await db.collection('posts')
      .where('authorId', '==', user.uid)
      .get();

    const batch = db.batch();
    userPosts.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    functions.logger.info(`User ${user.uid} and associated data deleted`);
    
    return null;
  } catch (error) {
    functions.logger.error('Error deleting user data:', error);
    throw error;
  }
});

// Function to sync dashboard user updates to Firestore
export const onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const userId = context.params.userId;

    try {
      // If role or status changed, update user custom claims
      if (newData.role !== previousData.role || newData.status !== previousData.status) {
        await admin.auth().setCustomUserClaims(userId, {
          role: newData.role,
          status: newData.status
        });

        functions.logger.info(`Updated custom claims for user ${userId}`);
      }

      return null;
    } catch (error) {
      functions.logger.error('Error updating user custom claims:', error);
      throw error;
    }
  });
