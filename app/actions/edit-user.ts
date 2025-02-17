"use server";

import { revalidatePath } from "next/cache";
import { User, UserRole, UserStatus } from "@/app/types/user";
import { usersService } from "@/app/services/users";

interface ServiceResponse<T = void> {
    success: boolean;
    error?: string;
    details?: Record<string, unknown>;
    data?: T;
}

// Server action to edit user
export async function editUser(
    userId: string,
    updates: {
        displayName?: string;
        role?: UserRole;
        status?: UserStatus;
    }
): Promise<ServiceResponse> {
    try {
        await usersService.updateUser(userId, updates);
        // Only revalidate the users list page since we no longer have individual user pages
        revalidatePath('/dashboard/users');

        return {
            success: true,
            details: {
                userId,
                updates,
                timestamp: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error("Error editing user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to edit user",
            details: {
                userId,
                updates,
                timestamp: new Date().toISOString()
            }
        };
    }
}