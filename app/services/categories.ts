import { adminDb } from '@/lib/firebase-admin';
import { db } from '@/lib/firebase';
import { Category, CategoryType, CreateCategoryInput, UpdateCategoryInput } from '@/app/types/category';
import { Timestamp } from 'firebase/firestore';
import { toTimestamp } from '@/app/utils/date';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';

const COLLECTION_NAME = 'categories';

// Helper to create a basic category
export function createBasicCategory(name: string, type: CategoryType = 'post'): Category {
  return {
    id: name.toLowerCase(),
    name,
    slug: name.toLowerCase(),
    type,
    featured: false,
    createdAt: toTimestamp(Date.now()),
    updatedAt: toTimestamp(Date.now())
  };
}

// Helper function to normalize category data
export function normalizeCategory(data: any): Category {
  const now = Timestamp.now();
  return {
    id: data?.id || '',
    name: data?.name || '',
    slug: data?.slug || '',
    type: (data?.type || 'post') as CategoryType,
    featured: Boolean(data?.featured),
    description: data?.description || '',
    icon: data?.icon || '',
    createdAt: toTimestamp(data?.createdAt || now),
    updatedAt: toTimestamp(data?.updatedAt || now)
  };
}

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const snapshot = await adminDb.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  },

  getCategoryBySlug: async (slug: string): Promise<Category | null> => {
    const snapshot = await adminDb.collection(COLLECTION_NAME).where('slug', '==', slug).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Category;
  },

  createCategory: async (data: CreateCategoryInput): Promise<Category> => {
    const docRef = adminDb.collection(COLLECTION_NAME).doc();
    const now = toTimestamp(Timestamp.now());
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

  updateCategory: async (id: string, updates: UpdateCategoryInput): Promise<Category> => {
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };

    await docRef.update(updateData);

    return {
      id,
      ...updates,
      updatedAt: Timestamp.now()
    } as Category;
  }
};

class CategoriesService {
  async getCategory(id: string): Promise<Category | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) return null;

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Category;
    } catch (error) {
      console.error('Error getting category:', error);
      return null;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(categoriesRef);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
    } catch (error) {
      console.error('Error getting all categories:', error);
      return [];
    }
  }

  async getCategoriesByType(type: CategoryType): Promise<Category[]> {
    try {
      const categoriesRef = collection(db, COLLECTION_NAME);
      const q = query(categoriesRef, where('type', '==', type));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Category));
    } catch (error) {
      console.error('Error getting categories by type:', error);
      return [];
    }
  }
}

export const categoriesService = new CategoriesService();
