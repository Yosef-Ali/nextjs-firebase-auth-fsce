import { db } from '@/app/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Post } from '@/app/types/post';

class ProgramsService {
  private collectionName = 'posts';

  async getLatestPrograms(count: number = 5): Promise<Post[]> {
    try {
      // Simple query without ordering
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', 'programs'),
        limit(count)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Sort in memory instead
      return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error getting programs:', error);
      return [];
    }
  }
}

export const programsService = new ProgramsService();
