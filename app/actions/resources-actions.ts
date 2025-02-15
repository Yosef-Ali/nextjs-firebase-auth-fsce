"use server"

import { revalidatePath } from "next/cache"
import { Resource } from "@/app/types/resource"
import { resourcesService } from "@/app/services/resources"
import { getUserData } from "@/app/lib/firebase/user-service"
import { authorization } from "@/lib/authorization"
import type { ServiceResponse } from "@/app/types/service"

export async function getResources(category?: string): Promise<ServiceResponse<Resource[]>> {
    try {
        const resources = await resourcesService.getAllResources(category);
        return {
            success: true,
            data: resources
        };
    } catch (error) {
        console.error("Error fetching resources:", error);
        return {
            success: false,
            error: "Failed to fetch resources"
        };
    }
}

export async function getResourceById(id: string): Promise<ServiceResponse<Resource | null>> {
    try {
        const resource = await resourcesService.getResourceById(id);
        if (!resource) {
            return {
                success: false,
                error: "Resource not found"
            };
        }
        return {
            success: true,
            data: resource
        };
    } catch (error) {
        console.error("Error fetching resource:", error);
        return {
            success: false,
            error: "Failed to fetch resource"
        };
    }
}

export async function updateResource(
    id: string,
    data: Partial<Resource>,
    userId: string
): Promise<ServiceResponse> {
    try {
        const userData = await getUserData({ uid: userId } as any);
        if (!userData || !authorization.isAdmin({ ...userData } as any)) {
            return {
                success: false,
                error: "Unauthorized: Only admins can update resources"
            };
        }

        await resourcesService.updateResource(id, data);
        revalidatePath("/dashboard/resources");
        return { success: true };
    } catch (error) {
        console.error("Error updating resource:", error);
        return {
            success: false,
            error: "Failed to update resource"
        };
    }
}

export async function deleteResource(
    id: string,
    userId: string
): Promise<ServiceResponse> {
    try {
        const userData = await getUserData({ uid: userId } as any);
        if (!userData || !authorization.isAdmin({ ...userData } as any)) {
            return {
                success: false,
                error: "Unauthorized: Only admins can delete resources"
            };
        }

        await resourcesService.deleteResource(id);
        revalidatePath("/dashboard/resources");
        return { success: true };
    } catch (error) {
        console.error("Error deleting resource:", error);
        return {
            success: false,
            error: "Failed to delete resource"
        };
    }
}

export async function createResource(
    data: Omit<Resource, "id">,
    userId: string
): Promise<ServiceResponse<Resource>> {
    try {
        const userData = await getUserData({ uid: userId } as any);
        if (!userData || !authorization.isAdmin({ ...userData } as any)) {
            return {
                success: false,
                error: "Unauthorized: Only admins can create resources"
            };
        }

        const resource = await resourcesService.createResource(data);
        revalidatePath("/dashboard/resources");
        return {
            success: true,
            data: resource
        };
    } catch (error) {
        console.error("Error creating resource:", error);
        return {
            success: false,
            error: "Failed to create resource"
        };
    }
}
