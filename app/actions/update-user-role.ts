'use server';

import { adminAuth, adminDb } from "@/app/lib/services/admin";
import { UserRole } from "@/app/types/user";
import { revalidatePath } from 'next/cache';

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
    if (!uid?.trim()) {
        throw new Error("No user ID provided for role update");
    }

    try {
        // First update Firestore
        await adminDb.collection('users').doc(uid).update({
            role,
            updatedAt: new Date()
        });

        // Then update Auth custom claims
        await adminAuth.setCustomUserClaims(uid, { 
            role,
            updatedAt: Date.now()
        });

        // Revalidate relevant paths
        revalidatePath('/admin/users');
        revalidatePath('/dashboard/users');
        revalidatePath('/');
        
        return;
    } catch (error) {
        const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to update user role';
        throw new Error(errorMessage);
    }
}
