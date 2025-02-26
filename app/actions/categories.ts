'use server';

import { revalidatePath } from 'next/cache';
import { Category } from '@/app/types';
import { adminCategoriesService } from '@/app/services/admin/categories';

export async function createCategory(data: Omit<Category, 'id'>) {
    try {
        const category = await adminCategoriesService.createCategory({
            ...data,
            description: data.description || '' // Ensure string fallback
        });
        revalidatePath('/dashboard/categories');
        return { success: true, data: category };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: 'Failed to create category' };
    }
}

export async function updateCategory(id: string, data: Partial<Omit<Category, 'id'>>) {
    try {
        await adminCategoriesService.updateCategory(id, data);
        revalidatePath('/dashboard/categories');
        return { success: true };
    } catch (error) {
        console.error('Error updating category:', error);
        return { success: false, error: 'Failed to update category' };
    }
}

export async function deleteCategory(id: string) {
    try {
        await adminCategoriesService.deleteCategory(id);
        revalidatePath('/dashboard/categories');
        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: 'Failed to delete category' };
    }
}
