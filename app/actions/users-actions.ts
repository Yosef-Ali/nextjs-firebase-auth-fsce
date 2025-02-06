"use server"

import { revalidatePath } from "next/cache"
import { UserRole } from "@/app/types/user"
import { usersService } from "@/app/services/users"
import { convertToAppUser } from "@/app/utils/user-utils"

export async function getUsers() {
  try {
    const users = await usersService.getAllUsers()
    const convertedUsers = users.map(user => convertToAppUser(user))
    revalidatePath("/admin/users")
    return { success: true, data: convertedUsers }
  } catch (error) {
    console.error("Error fetching users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function inviteUser(adminEmail: string, targetEmail: string, role: UserRole) {
  try {
    const result = await usersService.inviteUser(adminEmail, targetEmail, role)
    revalidatePath("/admin/users")
    return result
  } catch (error) {
    console.error("Error inviting user:", error)
    return { success: false, error: "Failed to invite user" }
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    // Get current user info first
    const currentUser = await usersService.getUser(userId);
    const currentRole = currentUser?.role || 'unknown';
    
    const result = await usersService.updateUserRole(userId, role);
    
    // Always provide complete details regardless of success/failure
    const details = {
      uid: userId,
      targetRole: role,
      currentRole,
      timestamp: new Date().toISOString(),
      ...(result.details || {}), // Merge any additional details from the service
    };

    if (result.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        details
      };
    }

    // Enhanced error logging
    console.error('Server Action - updateUserRole failed:', {
      userId,
      currentRole,
      targetRole: role,
      error: result.error,
      details: result.details
    });

    return {
      success: false,
      error: result.error || 'Failed to update user role',
      details
    };
  } catch (error: any) {
    // Enhanced error logging for unexpected errors
    console.error('Server Action - updateUserRole unexpected error:', {
      userId,
      targetRole: role,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while updating user role',
      details: {
        uid: userId,
        targetRole: role,
        errorType: error.name || 'UnknownError',
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    // Get current user info first
    const currentUser = await usersService.getUser(userId);
    const currentRole = currentUser?.role || 'unknown';
    const userEmail = currentUser?.email || 'unknown';
    
    const result = await usersService.deleteUser(userId);
    
    // Always provide complete details regardless of success/failure
    const details = {
      uid: userId,
      userEmail,
      currentRole,
      timestamp: new Date().toISOString(),
      ...(result.details || {}), // Merge any additional details from the service
    };

    if (result.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        details
      };
    }

    // Enhanced error logging
    console.error('Server Action - deleteUser failed:', {
      userId,
      userEmail,
      currentRole,
      error: result.error,
      details: result.details
    });

    return {
      success: false,
      error: result.error || 'Failed to delete user',
      details
    };
  } catch (error: any) {
    // Enhanced error logging for unexpected errors
    console.error('Server Action - deleteUser unexpected error:', {
      userId,
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message || 'An unexpected error occurred while deleting user',
      details: {
        uid: userId,
        errorType: error.name || 'UnknownError',
        errorMessage: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

export async function resetUserPassword(email: string) {
  try {
    await usersService.resetUserPassword(email);
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}
