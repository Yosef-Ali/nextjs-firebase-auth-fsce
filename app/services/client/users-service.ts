'use client';

import { UserRole, UserStatus, type User } from "@/app/types/user";
import { getUsers, inviteUser, updateUserRole, deleteUser } from "@/app/actions/users-actions";
import { usersService as mainUsersService } from "@/app/services/users";
import { User as FirebaseUser } from "firebase/auth";

class ClientUsersService {
  // Delegate auth-related operations to the main service
  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    return mainUsersService.createUserIfNotExists(firebaseUser);
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await getUsers();
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async inviteUser(
    adminEmail: string,
    targetEmail: string,
    role: UserRole,
  ): Promise<{ success: boolean; existingUser?: { email: string; role: string }; error?: string }> {
    try {
      const result = await inviteUser(adminEmail, targetEmail, role);
      return {
        success: result.success,
        existingUser: result.existingUser,
        error: 'error' in result ? result.error : undefined
      };
    } catch (error) {
      console.error("Error inviting user:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to invite user"
      };
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      const result = await updateUserRole(uid, role);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      const result = await deleteUser(uid);
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error("Error in deleteUser:", error);
      throw error;
    }
  }

  async resetUserPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await mainUsersService.resetUserPassword(email);
      return { success: true };
    } catch (error) {
      console.error("Error resetting password:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to reset password"
      };
    }
  }
}

export const usersService = new ClientUsersService();