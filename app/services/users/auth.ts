import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { User, UserRole } from "../../types/user";
import { userCoreService } from "./core";
import { setDoc } from "firebase/firestore";

class UserAuthService {
  async updateUserRole(uid: string, role: UserRole): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!uid) {
      return {
        success: false,
        error: "No user ID provided for role update",
      };
    }

    try {
      // First check if user exists
      const currentUser = await userCoreService.getUser(uid);
      if (!currentUser) {
        return {
          success: false,
          error: "User not found",
          details: { uid }
        };
      }

      const currentRole = currentUser.role;

      try {
        // Update user role in Firestore
        await userCoreService.createOrUpdateUser(uid, {
          role,
          updatedAt: Date.now()
        });

        return {
          success: true,
          details: {
            uid,
            previousRole: currentRole,
            newRole: role
          }
        };
      } catch (updateError) {
        console.error("Error updating user role in Firestore:", updateError);
        return {
          success: false,
          error: "Failed to update role in database",
          details: {
            uid,
            error: updateError instanceof Error ? updateError.message : "Unknown error",
            currentRole,
            targetRole: role
          }
        };
      }
    } catch (error) {
      console.error("Error in updateUserRole:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: {
          uid,
          error: error instanceof Error ? error.stack : undefined
        }
      };
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    if (!email) {
      throw new Error("No email provided for password reset");
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting user password:", error);
      throw error;
    }
  }
}

export const userAuthService = new UserAuthService();
