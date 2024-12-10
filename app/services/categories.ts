import { db } from '@/lib/firebase';
import { Category, CreateCategoryInput } from '@/app/types/category';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  where,
} from 'firebase/firestore';

const COLLECTION_NAME = 'categories';

export const categoriesService = {
  async getCategories(type?: 'post' | 'resource'): Promise<Category[]> {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = type ? query(categoriesRef, where('type', '==', type)) : query(categoriesRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        parentId: data.parentId || null,
        type: data.type || 'post',
        count: data.count || 0,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      } as Category;
    });
  },

  async createCategory(category: CreateCategoryInput): Promise<Category> {
    const now = serverTimestamp();
    const categoryData = {
      ...category,
      createdAt: now,
      updatedAt: now,
      count: 0,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
    const currentDate = new Date();
    
    return {
      id: docRef.id,
      ...category,
      count: 0,
      createdAt: currentDate,
      updatedAt: currentDate,
    };
  },

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    const categoryRef = doc(db, COLLECTION_NAME, id);
    const updateData = {
      ...category,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(categoryRef, updateData);
    return {
      id,
      ...category,
      updatedAt: new Date(),
    } as Category;
  },

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  },

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },
};
