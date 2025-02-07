import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User, UserRole } from "../../types/user";
import { userCoreService } from "./core";

class UserAuthService {
  private async setCustomClaims(
    uid: string,
    claims: { role: UserRole }
  ): Promise<void> {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : typeof window !== 'undefined'
            ? window.location.origin
            : ''
      );
      
      if (!baseUrl) {
        throw new Error('Application URL is not configured');
      }

      const apiUrl = `${baseUrl}/api/auth/set-custom-claims`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, claims }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to set custom claims: ${errorData?.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error setting custom claims:", error);
      throw error;
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      const user = await userCoreService.getUser(uid);
      if (!user) {
        const error = `User with ID ${uid} not found in Firestore`;
        console.error(error);
        return {
          success: false,
          error: "User not found in the database",
          details: { 
            uid,
            error,
            currentRole: null
          }
        };
      }

      const currentRole = user.role;

      // Update Firestore document
      try {
        await updateDoc(doc(db, 'users', uid), {
          role,
          updatedAt: Date.now(),
        });
      } catch (firestoreError: any) {
        const error = `Failed to update user role in Firestore: ${firestoreError.message}`;
        console.error(error);
        return {
          success: false,
          error: "Failed to update user role in database",
          details: {
            uid,
            currentRole,
            targetRole: role,
            errorMessage: firestoreError.message,
            errorCode: firestoreError.code,
            error
          }
        };
      }

      // Update Firebase Auth custom claims
      try {
        await this.setCustomClaims(uid, { role });
      } catch (claimsError: any) {
        const error = `Failed to update user role claims: ${claimsError.message}`;
        console.error(error);
        return {
          success: false,
          error: "Failed to update authentication claims",
          details: {
            uid,
            currentRole,
            targetRole: role,
            errorMessage: claimsError.message,
            error
          }
        };
      }

      console.log("Custom claims updated successfully for user:", uid, "with role:", role);
      return { success: true };
    } catch (error: any) {
      console.error("Unexpected error in updateUserRole:", {
        uid,
        role,
        error: error.message,
        stack: error.stack,
        success: false
      });
      return {
        success: false,
        error: "An unexpected error occurred while updating user role",
        details: {
          message: error.message,
          stack: error.stack
        }
      };
    }
  }

  async resetUserPassword(email: string): Promise<void> {
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
