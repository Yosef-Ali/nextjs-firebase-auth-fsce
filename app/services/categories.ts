import { db } from '@/lib/firebase';
import { Category } from '@/app/types/category';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const categoryService = {
  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) {
    const categoriesRef = collection(db, 'categories');
    const newCategoryRef = doc(categoriesRef);
    
    const categoryData = {
      ...data,
      id: newCategoryRef.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      count: 0
    };

    await setDoc(newCategoryRef, categoryData);
    return categoryData;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const categoryRef = doc(db, 'categories', id);
    const updateData = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(categoryRef, updateData);
    return updateData;
  },

  async deleteCategory(id: string) {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  }
};
