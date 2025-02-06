'use client';

import { UserRole, UserStatus, type User } from "@/app/types/user";
import { getUsers, inviteUser, updateUserRole, deleteUser } from "@/app/actions/users-actions";

class UsersService {
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
  ): Promise<{ success: boolean; existingUser?: { email: string; role: string } }> {
    try {
      return await inviteUser(adminEmail, targetEmail, role);
    } catch (error) {
      console.error("Error inviting user:", error);
      throw error;
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
      const response = await fetch('/api/users/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: 'Failed to reset password. Please try again.'
      };
    }
  }
}

export const usersService = new UsersService();