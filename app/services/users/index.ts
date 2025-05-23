import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { userCoreService } from "./core";
import { userAuthService } from "./auth";
import { userInvitationService } from "./invitation";

// Create functional service methods
const createUserIfNotExists = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  if (!firebaseUser?.uid) {
    console.warn("No user ID provided to createUserIfNotExists");
    return null;
  }

  try {
    const existingUser = await userCoreService.getUser(firebaseUser.uid);
    if (existingUser) {
      return existingUser;
    }

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
      isAnonymous: false,
      id: firebaseUser.uid,
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
        providerData: firebaseUser.providerData,
        refreshToken: firebaseUser.refreshToken || "",
        phoneNumber: firebaseUser.phoneNumber,
        tenantId: firebaseUser.tenantId
      }
    };

    await userCoreService.createOrUpdateUser(firebaseUser.uid, userData);
    const newUser = await userCoreService.getUser(firebaseUser.uid);

    if (!newUser) {
      throw new Error("Failed to create user document");
    }

    return newUser;
  } catch (error) {
    console.error("Error in createUserIfNotExists:", error);
    throw error;
  }
};

// Create a service object using functional composition
export const usersService = {
  createUserIfNotExists,
  getUser: userCoreService.getUser,
  getCurrentUser: userCoreService.getCurrentUser,
  createOrUpdateUser: userCoreService.createOrUpdateUser,
  updateUserStatus: userCoreService.updateUserStatus,
  getAllUsers: userCoreService.getAllUsers,
  deleteUser: userCoreService.deleteUser,
  updateUserRole: userAuthService.updateUserRole,
  resetUserPassword: userAuthService.resetUserPassword,
  inviteUser: async (adminEmail: string, targetEmail: string, role: UserRole) => {
    try {
      const result = await userInvitationService.inviteUser(adminEmail, targetEmail, role);
      return result.success
        ? { success: true }
        : result.existingUser
          ? {
            success: false,
            existingUser: {
              email: result.existingUser.email,
              role: result.existingUser.role,
            }
          }
          : { success: false };
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
    }
  },
  setupInitialAdmin: userInvitationService.setupInitialAdmin,
  acceptAuthorInvitation: userInvitationService.acceptAuthorInvitation,
  updateUserRoleBasedOnAdminEmails: userInvitationService.updateUserRoleBasedOnAdminEmails
} as const;