import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { UserRole } from '@/lib/firebase/types';
import { Authorization } from '@/app/lib/authorization';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export class UserAuthService {
  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      const authInstance = Authorization.getInstance();
      const userRef = doc(db, 'users', uid);

      await updateDoc(userRef, {
        role,
        updatedAt: new Date().toISOString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to update user role';
      throw new Error(errorMessage);
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to reset password';
      throw new Error(errorMessage);
    }
  }
}

export const userAuthService = new UserAuthService();
