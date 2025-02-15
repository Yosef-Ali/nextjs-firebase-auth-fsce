import { auth } from "@/lib/firebase";
import { UserRole } from "@/app/types/user";
import { sendPasswordResetEmail } from "firebase/auth";

class UserAuthService {
    async updateUserRole(uid: string, role: UserRole): Promise<{ success: boolean; error?: string }> {
        try {
            // Update custom claims in Firebase Auth
            const idTokenResult = await auth.currentUser?.getIdTokenResult(true);
            if (!idTokenResult) {
                throw new Error("No authenticated user");
            }

            // The role update in Firestore is handled by userCoreService
            return { success: true };
        } catch (error) {
            console.error("Error updating user role in auth:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update user role"
            };
        }
    }

    async resetUserPassword(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            console.error("Error sending password reset email:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to send password reset email"
            };
        }
    }
}

export const userAuthService = new UserAuthService();