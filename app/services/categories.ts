import { db } from '@/lib/firebase';
import { Category } from '@/app/types/category';
import {
  collection,
  query,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  where,
  getDoc,
  setDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'categories';

class CategoriesService {
  private categoriesCollection = collection(db, "categories");

  async getCategories(type?: 'post' | 'resource'): Promise<Category[]> {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = type ? query(categoriesRef, where('type', '==', type)) : query(categoriesRef);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => this.mapCategory(doc));
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const now = Date.now();
    const docRef = doc(this.categoriesCollection);

    const category: Category = {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, category);
    return category;
  }

  async updateCategory(id: string, data: Partial<Omit<Category, 'id' | 'createdAt'>>): Promise<Category> {
    const now = Date.now();
    const updates = {
      ...data,
      updatedAt: now,
    };

    const docRef = doc(this.categoriesCollection, id);
    await updateDoc(docRef, updates);

    const categoryDoc = await getDoc(docRef);
    if (!categoryDoc.exists()) {
      throw new Error('Category not found');
    }

    return this.mapCategory(categoryDoc);
  }

  async deleteCategory(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }

  createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async getCategoriesWithItemCount(): Promise<Category[]> {
    const categories = await this.getCategories();
    const itemsRef = collection(db, 'posts');

    return Promise.all(categories.map(async (category) => {
      try {
        const uniquePostIds = new Set<string>();

        // Query for all possible category formats
        const queries = [
          query(itemsRef, where('category', '==', category.id)),
          query(itemsRef, where('category.id', '==', category.id)),
          query(itemsRef, where('categories', 'array-contains', category.id)),
          query(itemsRef, where('category.name', '==', category.name))
        ];

        for (const q of queries) {
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(d => uniquePostIds.add(d.id));
        }

        return {
          ...category,
          itemCount: uniquePostIds.size
        };
      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
        return category;
      }
    }));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryDoc = await getDoc(doc(this.categoriesCollection, id));
      if (!categoryDoc.exists()) {
        return null;
      }

      return this.mapCategory(categoryDoc);
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  async updateCategoryItemCount(id: string): Promise<void> {
    try {
      const itemsRef = collection(db, 'posts');
      const q = query(itemsRef, where('category.id', '==', id));
      const snapshot = await getDocs(q);

      await updateDoc(doc(this.categoriesCollection, id), {
        itemCount: snapshot.size,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating category count:', error);
    }
  }

  private mapCategory(doc: any): Category {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      description: data.description,
      type: data.type || 'post',
      slug: data.slug || this.createSlug(data.name),
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
      itemCount: data.itemCount || 0,
      featured: data.featured || false,
      icon: data.icon || null,
      menuPath: data.menuPath || null,
      parentId: data.parentId || null
    };
  }
}

export const categoriesService = new CategoriesService();
