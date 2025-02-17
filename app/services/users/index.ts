import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { userCoreService } from "./core";
import { userAuthService } from "./auth";
import { userInvitationService } from "./invitation";

export class UsersService {
  // Core user operations
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    if (!firebaseUser?.uid) {
      console.warn("No user ID provided to createUserIfNotExists");
      return null;
    }

    try {
      // First check if user already exists
      const existingUser = await userCoreService.getUser(firebaseUser.uid);
      if (existingUser) {
        return existingUser;
      }

      // Prepare user data with all required fields
      const userData: Partial<User> = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || firebaseUser.email || "Unnamed User",
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metadata: {
          lastLogin: Date.now(),
          createdAt: Date.now(),
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          displayName: firebaseUser.displayName || "",
          email: firebaseUser.email || "",
          photoURL: firebaseUser.photoURL || null,
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData || [],
          refreshToken: firebaseUser.refreshToken || "",
          phoneNumber: firebaseUser.phoneNumber || null,
          tenantId: firebaseUser.tenantId || null
        }
      };

      // Create user document first
      await userCoreService.createOrUpdateUser(firebaseUser.uid, userData);

      // Get the newly created user
      const newUser = await userCoreService.getUser(firebaseUser.uid);
      if (!newUser) {
        console.error("Failed to retrieve newly created user document");
        throw new Error("Failed to create user document");
      }

      // Try to set role in background, but don't fail if it doesn't work
      try {
        await userAuthService.updateUserRole(firebaseUser.uid, UserRole.USER);
      } catch (error) {
        console.warn("Non-critical error setting initial user role:", error);
      }

      return newUser;
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error);
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  // Delegate methods to appropriate services
  getUser = userCoreService.getUser.bind(userCoreService);
  getCurrentUser = userCoreService.getCurrentUser.bind(userCoreService);
  createOrUpdateUser = userCoreService.createOrUpdateUser.bind(userCoreService);
  updateUserStatus = userCoreService.updateUserStatus.bind(userCoreService);
  getAllUsers = userCoreService.getAllUsers.bind(userCoreService);
  deleteUser = userCoreService.deleteUser.bind(userCoreService);

  updateUserRole = userAuthService.updateUserRole.bind(userAuthService);
  resetUserPassword = userAuthService.resetUserPassword.bind(userAuthService);

  setupInitialAdmin = userInvitationService.setupInitialAdmin.bind(userInvitationService);
  acceptAuthorInvitation = userInvitationService.acceptAuthorInvitation.bind(userInvitationService);
  updateUserRoleBasedOnAdminEmails = userInvitationService.updateUserRoleBasedOnAdminEmails.bind(userInvitationService);
  inviteUser = userInvitationService.inviteUser.bind(userInvitationService);
}

export const usersService = new UsersService();