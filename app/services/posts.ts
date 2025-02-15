import { db } from '@/lib/firebase';
import { Post, Category, PostStatus } from '@/app/types/post';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  orderBy,
  FieldValue,
  limit as firestoreLimit
} from 'firebase/firestore';
import { serializeData } from '@/app/utils/serialization';

const COLLECTION_NAME = 'posts';

class PostsService {
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => serializeData({
        id: doc.id,
        ...doc.data()
      })) as Post[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return serializeData({
        id: docSnap.id,
        ...docSnap.data()
      }) as Post;
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  async getPublishedPosts(categoryId?: string, limitCount?: number): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      // Simple query with only one condition to avoid index requirement
      const constraints: QueryConstraint[] = [
        where('published', '==', true)
      ];

      const q = query(postsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let posts = querySnapshot.docs.map(doc => serializeData({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      // Client-side filtering and sorting
      posts = posts.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return dateB - dateA; // Sort by descending order
      });

      // Filter by category if specified
      if (categoryId) {
        posts = posts.filter(post => {
          const category = post.category;
          if (!category) return false;

          const categoryIdLower = categoryId.toLowerCase();
          
          if (typeof category === 'string') {
            return category.toLowerCase() === categoryIdLower;
          }
          
          if (typeof category === 'object' && 'id' in category) {
            return category.id.toLowerCase() === categoryIdLower;
          }
          
          return false;
        });
      }

      // Apply limit if specified
      if (limitCount && limitCount > 0) {
        posts = posts.slice(0, limitCount);
      }

      return posts;
    } catch (error) {
      console.error('Error getting published posts:', error);
      return [];
    }
  }

  async getAllNews(): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category.id', '==', 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => serializeData({
        id: doc.id,
        ...doc.data()
      })) as Post[];
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    try {
      const now = serverTimestamp();
      const postData = {
        ...post,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);
      return {
        id: docRef.id,
        ...post,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, post: Partial<Post>): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(postRef, {
        ...post,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating post:', error);
      return false;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }
}

export const postsService = new PostsService();
