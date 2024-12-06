import { auth } from '@/app/firebase';
import { db } from '@/app/firebase';
import { collection, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { deleteUser as deleteAuthUser, signInWithEmailAndPassword } from 'firebase/auth';
import { getAuth, deleteUser } from 'firebase/auth';

const COLLECTION_NAME = 'users';

export const deleteUserService = {
  async deleteUserCompletely(email: string): Promise<boolean> {
    try {
      console.log('Starting complete user deletion for:', email);

      // 1. Delete from Firestore
      const usersRef = collection(db, COLLECTION_NAME);
      const userDoc = doc(usersRef, email);
      
      // Check if user exists in Firestore
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        await deleteDoc(userDoc);
        console.log('Deleted user from Firestore');
      }

      // 2. Delete from Firebase Auth
      try {
        // Get the admin user's auth token
        const adminAuth = getAuth();
        const currentUser = adminAuth.currentUser;

        if (currentUser && currentUser.email === email) {
          await deleteUser(currentUser);
          console.log('Deleted current user from Firebase Auth');
        } else {
          // For other users, we'll need to use Admin SDK
          // This should be handled by a server-side function
          console.log('User deletion from Auth requires Admin SDK');
        }
      } catch (authError) {
        console.error('Error deleting from Firebase Auth:', authError);
        // Continue with Firestore deletion even if Auth deletion fails
      }

      return true;
    } catch (error) {
      console.error('Error in complete user deletion:', error);
      return false;
    }
  }
};
