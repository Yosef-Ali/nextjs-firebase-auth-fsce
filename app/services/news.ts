import { db } from '@/app/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Post } from '@/app/types/post';

class NewsService {
  private collectionName = 'posts';

  async getLatestNews(count: number = 5, includeUnpublished: boolean = false): Promise<Post[]> {
    try {
      // Simple query with just the collection
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Filter and sort in memory
      return posts
        .filter(post => post.category === 'news' && (includeUnpublished || post.published))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, count);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }

  async getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Sort in memory
      return posts
        .filter(post => post.category === 'news' && (includeUnpublished || post.published))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
