import { User as FirebaseUser } from "firebase/auth";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { userCoreService } from "./users/core";
import { userAuthService } from "./users/auth";
import { userInvitationService } from "./users/invitation";

// User service methods as pure functions
const createUserIfNotExists = async (firebaseUser: FirebaseUser) =>
  userCoreService.createUserIfNotExists(firebaseUser);

const inviteUser = async (adminEmail: string, targetEmail: string, role: UserRole) => {
  try {
    const result = await userInvitationService.inviteUser(adminEmail, targetEmail, role);
    if (result.success) {
      return { success: true };
    }
    if (result.existingUser) {
      return {
        success: false,
        existingUser: {
          email: result.existingUser.email,
          role: result.existingUser.role,
        }
      };
    }
    return { success: false };
  } catch (error) {
    console.error("Error inviting user:", error);
    throw error;
  }
};

const deleteUser = (uid: string) => userCoreService.deleteUser(uid);

const updateUser = async (uid: string, updates: {
  displayName?: string;
  role?: UserRole;
  status?: UserStatus;
  photoURL?: string | null;
}) => {
  try {
    // Get current user data
    const currentUser = await userCoreService.getUser(uid);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Prepare update data with timestamps
    const updateData = {
      ...updates,
      updatedAt: Date.now(),
      metadata: {
        ...(currentUser.metadata || {}),
        ...updates,
        lastUpdated: Date.now()
      }
    };

    // Update user in Firestore
    await userCoreService.createOrUpdateUser(uid, updateData);

    // If role is being updated, also update it through auth service
    if (updates.role) {
      await userAuthService.updateUserRole(uid, updates.role);
    }

    // If status is being updated, update through core service
    if (updates.status) {
      await userCoreService.updateUserStatus(uid, updates.status);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const getUser = (uid: string) => userCoreService.getUser(uid);

const getCurrentUser = (firebaseUser: FirebaseUser | null) =>
  userCoreService.getCurrentUser(firebaseUser);

const getAllUsers = () => userCoreService.getAllUsers();

const updateUserRole = (uid: string, role: UserRole) =>
  userAuthService.updateUserRole(uid, role);

const updateUserStatus = (uid: string, status: UserStatus) =>
  userCoreService.updateUserStatus(uid, status);

const resetUserPassword = (email: string) =>
  userAuthService.resetUserPassword(email);

// Export service as an object with pure functions
export const usersService = {
  createUserIfNotExists,
  inviteUser,
  deleteUser,
  updateUser,
  getUser,
  getCurrentUser,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  resetUserPassword,
  async setupInitialAdmin(email: string): Promise<boolean> {
    try {
      // Implementation here
      return true;
    } catch (error) {
      console.error('Error setting up initial admin:', error);
      return false;
    }
  },
  async acceptAuthorInvitation(email: string, token: string): Promise<boolean> {
    try {
      // Implementation here
      return true;
    } catch (error) {
      console.error('Error accepting author invitation:', error);
      return false;
    }
  }
} as const;
