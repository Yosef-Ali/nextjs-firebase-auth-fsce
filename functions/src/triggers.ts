import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

// Trigger when a user is deleted from Authentication
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete the user's document from Firestore
    await db.collection('users').doc(user.uid).delete();
    console.log(`Successfully deleted user document for ${user.uid}`);
  } catch (error) {
    console.error(`Error deleting user document for ${user.uid}:`, error);
    throw error;
  }
});

// Trigger when a user document is updated in Firestore
export const onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const previousData = change.before.data();
    const userId = context.params.userId;

    // If role has changed, update custom claims
    if (newData.role !== previousData.role) {
      try {
        await admin.auth().setCustomUserClaims(userId, { role: newData.role });
        console.log(`Successfully updated custom claims for user ${userId}`);
      } catch (error) {
        console.error(`Error updating custom claims for user ${userId}:`, error);
        throw error;
      }
    }
  });