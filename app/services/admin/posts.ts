import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Category, CategoryType } from '@/app/types/category';

export const postsService = {
  // ... existing methods
  
  // Add missing methods
  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  },
  
  async getCategories(type?: CategoryType): Promise<Category[]> {
    const categoriesRef = collection(db, 'categories');
    let q = query(categoriesRef);
    
    if (type) {
      q = query(categoriesRef, where('type', '==', type));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }) as Category);
  }
};