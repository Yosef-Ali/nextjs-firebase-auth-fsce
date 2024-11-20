import { db } from '@/app/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp, addDoc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { Post } from '@/app/types/post';

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

class NewsService {
  private collectionName = 'posts';

  async getAllNews(includeUnpublished = false): Promise<Post[]> {
    try {
      let constraints = [
        where('category', '==', 'news')
      ];

      if (!includeUnpublished) {
        constraints.push(where('published', '==', true));
      }

      const q = query(
        collection(db, this.collectionName),
        ...constraints,
        orderBy('createdAt', 'desc') // Most recent first
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as Post[];
    } catch (error) {
      console.error('Error getting news:', error);
      throw error;
    }
  }

  async getLatestNews(count: number = 3, includeUnpublished = false): Promise<Post[]> {
    try {
      let constraints = [
        where('category', '==', 'news')
      ];

      if (!includeUnpublished) {
        constraints.push(where('published', '==', true));
      }

      const q = query(
        collection(db, this.collectionName),
        ...constraints,
        orderBy('createdAt', 'desc'),
        limit(count)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as Post[];
    } catch (error) {
      console.error('Error getting latest news:', error);
      throw error;
    }
  }

  async getNewsBySlug(slug: string): Promise<Post | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', 'news'),
        where('slug', '==', slug),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error getting news by slug:', error);
      throw error;
    }
  }

  async createNews(data: Partial<Post>): Promise<string> {
    try {
      const slug = generateSlug(data.title || '');
      const timestamp = Timestamp.now();

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        category: 'news',
        slug,
        createdAt: timestamp,
        updatedAt: timestamp,
        tags: [...(data.tags || []), 'news']
      });

      return docRef.id;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async updateNews(id: string, data: Partial<Post>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const timestamp = Timestamp.now();

      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp
      });
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  async deleteNews(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }
}

export const newsService = new NewsService();
