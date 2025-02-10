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
  or,
  getDoc,
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
        itemCount: data.itemCount || 0,
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
      itemCount: 0,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), categoryData);
    const currentDate = new Date();

    return {
      id: docRef.id,
      ...category,
      count: 0,
      itemCount: 0,
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

  async getCategoriesWithItemCount(): Promise<Category[]> {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const categoriesSnapshot = await getDocs(categoriesRef);

    const categories = await Promise.all(categoriesSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const category = {
        id: doc.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        parentId: data.parentId || null,
        type: data.type || 'post',
        count: data.count || 0,
        itemCount: data.itemCount || 0,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      } as Category;

      console.log(`\nProcessing category: ${category.name} (${category.id})`);

      // Get count of items with this category
      const itemsRef = collection(db, 'posts');
      const uniquePostIds = new Set<string>();

      try {
        // Case 1: category.id direct match
        const q1 = query(itemsRef, where('category.id', '==', doc.id));
        const snapshot1 = await getDocs(q1);
        snapshot1.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 1 (category.id): ${snapshot1.size} posts`);
        snapshot1.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 2: category as string ID
        const q2 = query(itemsRef, where('category', '==', doc.id));
        const snapshot2 = await getDocs(q2);
        snapshot2.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 2 (category string): ${snapshot2.size} posts`);
        snapshot2.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 3: category as object with matching ID and name
        const q3 = query(itemsRef, where('category', '==', { id: doc.id, name: data.name }));
        const snapshot3 = await getDocs(q3);
        snapshot3.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 3 (category object): ${snapshot3.size} posts`);
        snapshot3.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 4: categories array containing ID
        const q4 = query(itemsRef, where('categories', 'array-contains', doc.id));
        const snapshot4 = await getDocs(q4);
        snapshot4.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 4 (categories array): ${snapshot4.size} posts`);
        snapshot4.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 5: categories array containing object
        const q5 = query(itemsRef, where('categories', 'array-contains', { id: doc.id, name: data.name }));
        const snapshot5 = await getDocs(q5);
        snapshot5.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 5 (categories array objects): ${snapshot5.size} posts`);
        snapshot5.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 6: Check for slug match
        const q6 = query(itemsRef, where('category.slug', '==', data.slug));
        const snapshot6 = await getDocs(q6);
        snapshot6.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 6 (category.slug): ${snapshot6.size} posts`);
        snapshot6.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        // Case 7: Check for name match
        const q7 = query(itemsRef, where('category.name', '==', data.name));
        const snapshot7 = await getDocs(q7);
        snapshot7.docs.forEach(d => uniquePostIds.add(d.id));
        console.log(`Format 7 (category.name): ${snapshot7.size} posts`);
        snapshot7.docs.forEach(d => console.log(`- Post: ${d.data().title} (${d.id})`));

        category.itemCount = uniquePostIds.size;

        console.log(`Total unique posts for ${category.name}: ${category.itemCount}`);
        console.log('Post IDs:', Array.from(uniquePostIds));

      } catch (error) {
        console.error(`Error processing category ${category.name}:`, error);
      }

      return category;
    }));

    return categories;
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const categoryDoc = await getDoc(doc(db, COLLECTION_NAME, id));
      if (!categoryDoc.exists()) {
        return null;
      }

      const data = categoryDoc.data();
      return {
        id: categoryDoc.id,
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        parentId: data.parentId || null,
        type: data.type || 'post',
        count: data.count || 0,
        itemCount: data.itemCount || 0,
        createdAt: data.createdAt instanceof Date ? data.createdAt : data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt instanceof Date ? data.updatedAt : data.updatedAt?.toDate?.() || new Date(),
      } as Category;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  async updateCategoryItemCount(id: string): Promise<void> {
    try {
      const itemsRef = collection(db, 'posts');
      const q = query(itemsRef, where('category.id', '==', id));
      const snapshot = await getDocs(q);
      
      await updateDoc(doc(db, COLLECTION_NAME, id), {
        itemCount: snapshot.size,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating category count:', error);
    }
  },
};
