import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

const COLLECTION_NAME = 'users';

export const deleteUserService = {
  async deleteUserCompletely(email: string): Promise<boolean> {
    try {
      console.log('Starting complete user deletion for:', email);

      // 1. Delete from Firebase Auth
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === email) {
        await deleteUser(currentUser);
        console.log('Deleted user from Firebase Auth:', email);
      }

      // 2. Delete from Firestore via API
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete user');
      }

      return true;
    } catch (error) {
      console.error('Error in complete user deletion:', error);
      return false;
    }
  }
};
