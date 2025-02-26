import { adminDb } from '@/lib/firebase-admin';
import { Category } from '@/app/types/category';
import { Timestamp } from 'firebase/firestore';
import { CreateCategoryInput, UpdateCategoryInput } from '@/app/types/category';

const COLLECTION_NAME = 'categories';

export const adminCategoriesService = {
    async getCategories(): Promise<Category[]> {
        const snapshot = await adminDb.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => doc.data() as Category);
    },

    async createCategory(data: CreateCategoryInput): Promise<Category> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc();
        const now = Timestamp.now();

        const category: Category = {
            ...data,
            id: docRef.id,
            description: data.description ?? '',
            createdAt: now,
            updatedAt: now,
            itemCount: 0,
            featured: data.featured ?? false
        };

        await docRef.set(category);
        return category;
    },

    async updateCategory(id: string, data: UpdateCategoryInput): Promise<void> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now().toDate()
        };
        await docRef.update(updateData);
    },

    async listCategories(): Promise<Category[]> {
        const snapshot = await adminDb.collection(COLLECTION_NAME).get();
        return snapshot.docs.map(doc => doc.data() as Category);
    },

    async deleteCategory(id: string): Promise<void> {
        const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
        await docRef.delete();
    }
};
