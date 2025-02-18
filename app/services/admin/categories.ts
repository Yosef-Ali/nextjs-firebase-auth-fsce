import { adminDb } from '@/lib/firebase-admin';
import { Category } from '@/app/types/category';
import { Timestamp } from 'firebase/firestore';
import { CreateCategoryInput, UpdateCategoryInput } from '@/app/types/category';

const COLLECTION_NAME = 'categories';

export const adminCategoriesService = {
    async createCategory(data: CreateCategoryInput): Promise<Category> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc();
        const now = Timestamp.now();

        const category: Category = {
            ...data,
            id: docRef.id,
            createdAt: now,
            updatedAt: now,
            itemCount: 0
        };

        await docRef.set(category);
        return category;
    },

    async updateCategory(id: string, data: UpdateCategoryInput): Promise<void> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        await docRef.update(updateData);
    },

    async deleteCategory(id: string): Promise<void> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
    }
};