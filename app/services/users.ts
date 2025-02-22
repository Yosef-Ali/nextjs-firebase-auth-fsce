import { User as FirebaseUser } from "firebase/auth";
import { UserRole, UserStatus, UserData } from "@/app/types/user";
import { userCoreService } from "./users/core";
import { userAuthService } from "./users/auth";
import { userInvitationService } from "./users/invitation";

export const usersService = {
  // Core user operations
  createUserIfNotExists: (firebaseUser: FirebaseUser) =>
    userCoreService.createUserIfNotExists(firebaseUser),

  getUser: (uid: string) =>
    userCoreService.getUser(uid),

  getCurrentUser: (firebaseUser: FirebaseUser | null) =>
    userCoreService.getCurrentUser(firebaseUser),

  getAllUsers: () =>
    userCoreService.getAllUsers(),

  // User management
  updateUser: async (uid: string, updates: {
    displayName?: string;
    role?: UserRole;
    status?: UserStatus;
    photoURL?: string | null;
  }) => {
    const currentUser = await userCoreService.getUser(uid);
    if (!currentUser) throw new Error('User not found');

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...(currentUser.metadata || {}),
        lastUpdated: new Date().toISOString()
      }
    };

    await userCoreService.createOrUpdateUser(uid, updateData);
    if (updates.role) await userAuthService.updateUserRole(uid, updates.role);
    if (updates.status) await userCoreService.updateUserStatus(uid, updates.status);

    return { success: true };
  },

  // Role & status management  
  updateUserRole: (uid: string, role: UserRole) =>
    userAuthService.updateUserRole(uid, role),

  updateUserStatus: (uid: string, status: UserStatus) =>
    userCoreService.updateUserStatus(uid, status),

  // User invitation & deletion
  inviteUser: async (adminEmail: string, targetEmail: string, role: UserRole) => {
    const result = await userInvitationService.inviteUser(adminEmail, targetEmail, role);
    return result.existingUser
      ? { success: false, existingUser: { email: result.existingUser.email, role: result.existingUser.role } }
      : { success: true };
  },

  deleteUser: (uid: string) =>
    userCoreService.deleteUser(uid),

  // Auth operations
  resetUserPassword: (email: string) =>
    userAuthService.resetUserPassword(email)
} as const;
