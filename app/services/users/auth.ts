import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { UserRole } from "@/app/types/user";
import { updateUserRole } from "@/app/actions/update-user-role";

export class UserAuthService {
  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await updateUserRole(uid, role);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to update user role';
      throw new Error(errorMessage);
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    try {
      const auth = getAuth();
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
