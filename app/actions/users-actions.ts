"use server"

import { revalidatePath } from "next/cache"
import { User, UserRole, UserStatus } from "@/app/types/user"
import { usersService } from "@/app/services/users"

// Define return types for better type safety
interface ServiceResponse<T = void> {
  success: boolean;
  error?: string;
  details?: Record<string, unknown>;
  data?: T;
}

interface UserInviteResponse {
  success: boolean;
  existingUser?: {
    email: string;
    role: string;
  };
  error?: string;
}

// Server action to get all users
export async function getUsers(): Promise<ServiceResponse<User[]>> {
  try {
    const result = await usersService.getAllUsers();
    revalidatePath("/admin/users");
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      };
    }
    return {
      success: false,
      error: result.error || "Failed to fetch users"
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

// Server action to invite a user
export async function inviteUser(
  adminEmail: string,
  targetEmail: string,
  role: UserRole
): Promise<UserInviteResponse> {
  try {
    const result = await usersService.inviteUser(adminEmail, targetEmail, role)
    revalidatePath("/admin/users")
    return result
  } catch (error) {
    console.error("Error inviting user:", error)
    return { success: false, error: "Failed to invite user" }
  }
}

// Server action to update user role
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<ServiceResponse> {
  try {
    const currentUser = await usersService.getUser(userId);
    const currentRole = currentUser?.role || 'unknown';

    const result = await usersService.updateUserRole(userId, role);

    const details = {
      uid: userId,
      targetRole: role,
      currentRole,
      timestamp: new Date().toISOString(),
      ...(result.details || {})
    };

    if (result.success) {
      revalidatePath("/admin/users");
      return {
        success: true,
        details
      };
    }

    console.error('Server Action - updateUserRole failed:', {
      userId,
      currentRole,
      targetRole: role,
      error: result.error,
      details: result.details || {}
    });

    return {
      success: false,
      error: result.error || 'Failed to update user role',
      details
    };
  } catch (error) {
    const typedError = error as Error;
    console.error('Server Action - updateUserRole unexpected error:', {
      userId,
      targetRole: role,
      error: typedError.message,
      stack: typedError.stack
    });

    return {
      success: false,
      error: typedError.message || 'An unexpected error occurred while updating user role',
      details: {
        uid: userId,
        targetRole: role,
        errorType: typedError.name || 'UnknownError',
        errorMessage: typedError.message,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Server action to reset user password
export async function resetUserPassword(email: string): Promise<ServiceResponse> {
  try {
    await usersService.resetUserPassword(email);
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password" };
  }
}


export async function deleteUser(
  userId: string
): Promise<ServiceResponse> {
  try {
    if (!userId?.trim()) {
      return {
        success: false,
        error: "Invalid user ID provided",
        details: { userId }
      };
    }

    const result = await usersService.deleteUser(userId);

    if (result.success) {
      // Ensure all relevant paths are revalidated
      revalidatePath("/admin/users");
      revalidatePath("/dashboard/users");
      revalidatePath("/");

      return {
        success: true,
        details: {
          userId,
          timestamp: new Date().toISOString(),
          status: 'completed'
        }
      };
    }

    return {
      success: false,
      error: result.error || "Failed to delete user",
      details: {
        ...result.details,
        status: 'failed'
      }
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting user:", {
      userId,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      success: false,
      error: "Failed to delete user",
      details: {
        userId,
        errorMessage,
        status: 'error',
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Server action to update user status
export async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<ServiceResponse> {
  try {
    const result = await usersService.updateUserStatus(userId, status);
    if (result.success) {
      revalidatePath("/admin/users");
      revalidatePath("/dashboard/users");
      return {
        success: true,
        details: {
          uid: userId,
          targetStatus: status,
          timestamp: new Date().toISOString()
        }
      };
    }
    return {
      success: false,
      error: result.error || 'Failed to update user status',
      details: result.details
    };
  } catch (error) {
    const typedError = error as Error;
    console.error('Server Action - updateUserStatus error:', {
      userId,
      targetStatus: status,
      error: typedError.message,
      stack: typedError.stack
    });
    return {
      success: false,
      error: typedError.message || 'An unexpected error occurred while updating user status',
      details: {
        uid: userId,
        targetStatus: status,
        errorType: typedError.name || 'UnknownError',
        timestamp: new Date().toISOString()
      }
    };
  }
}
