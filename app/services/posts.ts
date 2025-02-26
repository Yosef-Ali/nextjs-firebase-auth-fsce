import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase-admin';
import { Post } from '@/app/types/post';
import type { Category } from '@/app/types/category';
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
import { ensureCategory } from '@/app/utils/category';
import { normalizePost } from '@/app/utils/post';

const COLLECTION_NAME = 'posts';

class PostsService {
  async getCategories(): Promise<Category[]> {
    const snapshot = await adminDb.collection('categories').get();
    return snapshot.docs.map(doc => doc.data() as Category);
  }

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));
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

      return normalizePost(docSnap.data(), docSnap.id);
    } catch (error) {
      console.error('Error getting post:', error);
      return null;
    }
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('slug', '==', slug),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return normalizePost(doc.data(), doc.id);
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null;
    }
  }

  async getRelatedPosts(currentSlug: string, categoryId: string, limit = 3): Promise<Post[]> {
    try {
      // First get current post to exclude it
      const currentPost = await this.getPostBySlug(currentSlug);
      if (!currentPost) {
        return [];
      }

      // Get posts with the same category
      const allPosts = await this.getPublishedPosts(categoryId);

      // Filter out the current post and limit the results
      return allPosts
        .filter(post => post.id !== currentPost.id)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
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

      let posts = querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));

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
      return querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));
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
        category: ensureCategory(post.category),
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);
      const timestamp = Timestamp.now();
      return normalizePost({
        ...post,
        category: ensureCategory(post.category),
        createdAt: timestamp,
        updatedAt: timestamp,
      }, docRef.id);
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

  async deletePost(userId: string, id: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const postDoc = await getDoc(postRef);

      if (postDoc.data()?.authorId !== userId) {
        throw new Error('Unauthorized deletion attempt');
      }

      await deleteDoc(postRef);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }
}

export const postsService = new PostsService();
