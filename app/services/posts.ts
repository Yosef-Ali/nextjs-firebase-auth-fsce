import { db } from '@/lib/firebase';
// Remove the adminDb import
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
  limit as firestoreLimit
} from 'firebase/firestore';
import { ensureCategory } from '@/app/utils/category';
import { normalizePost } from '@/app/utils/post';

const COLLECTION_NAME = 'posts';

class PostsService {
  async getCategories(): Promise<Category[]> {
    // Instead of using adminDb directly, fetch from our API route
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
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

      try {
        // First try to get posts with filters
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));
      } catch (innerError: any) {
        // Check if it's a connectivity issue
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline, attempting to use cached data');

          // Attempt to get cached data without filters
          // Firebase will return cached data in offline mode if available
          const fallbackSnapshot = await getDocs(collection(db, COLLECTION_NAME));
          const posts = fallbackSnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));

          // Sort manually since we can't use orderBy when offline
          return posts.sort((a, b) => {
            const getTime = (timestamp: any) => {
              if (!timestamp) return 0;
              if (typeof timestamp.toMillis === 'function') return timestamp.toMillis();
              if (timestamp instanceof Date) return timestamp.getTime();
              return 0;
            };
            return getTime(b.createdAt) - getTime(a.createdAt);
          });
        }

        // Re-throw if it's not a connectivity issue
        throw innerError;
      }
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      try {
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          return null;
        }

        return normalizePost(docSnap.data(), docSnap.id);
      } catch (innerError: any) {
        // Handle offline mode
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline while getting post, attempting to use cached data');

          // Try again - Firebase will use cached data in offline mode if available
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.metadata.fromCache) {
            console.log('Retrieved post from cache');
            return normalizePost(docSnap.data(), docSnap.id);
          }
        }

        // Re-throw if not a connectivity issue or no cached data
        throw innerError;
      }
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

  // Ultra-simplified method for achievements page to avoid any errors
  async getAchievements(): Promise<Post[]> {
    try {
      // Get all posts
      const postsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(postsRef);

      // Create an array to hold our results
      const results: Post[] = [];

      // Process each document individually with try/catch for each one
      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();

          // Skip unpublished posts
          if (data.published !== true) return;

          // Skip non-achievements
          let isAchievement = false;
          const category = data.category;

          if (typeof category === 'string') {
            isAchievement = category.toLowerCase() === 'achievements';
          } else if (category && typeof category === 'object') {
            if ('id' in category) {
              isAchievement = category.id.toLowerCase() === 'achievements';
            }
          }

          if (!isAchievement) return;

          // Create a minimal post object with all required fields
          const post: Post = {
            id: doc.id,
            title: data.title || 'Untitled',
            slug: data.slug || doc.id,
            excerpt: data.excerpt || '',
            content: data.content || '',
            coverImage: data.coverImage || '',
            published: true,
            sticky: Boolean(data.sticky),
            images: data.images || [],
            authorId: data.authorId || 'system',
            authorEmail: data.authorEmail || 'system@fsce.org',
            date: data.date || Timestamp.now(),
            category: data.category || 'achievements',
            featured: data.featured || false,
            tags: data.tags || [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
          };

          // Add to results
          results.push(post);
        } catch (docError) {
          console.error(`Error processing achievement ${doc.id}:`, docError);
          // Continue with next document
        }
      });

      return results;
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  async getPublishedPosts(categoryId?: string, limitCount?: number): Promise<Post[]> {
    try {
      // Special case for achievements to avoid the error
      if (categoryId === 'achievements') {
        return this.getAchievements();
      }

      const postsRef = collection(db, COLLECTION_NAME);
      // Simple query with only one condition to avoid index requirement
      const constraints: QueryConstraint[] = [
        where('published', '==', true)
      ];

      let querySnapshot;
      let isOfflineMode = false;

      try {
        const q = query(postsRef, ...constraints);
        querySnapshot = await getDocs(q);
      } catch (innerError: any) {
        // Handle offline mode
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline, attempting to use cached data for published posts');

          // In offline mode, get all documents and filter locally
          querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
          console.log('Retrieved posts from cache, will filter locally');
          isOfflineMode = true;
        } else {
          // Re-throw if it's not a connectivity issue
          throw innerError;
        }
      }

      // Convert to array of documents with proper normalization
      let posts = querySnapshot.docs.map(doc => {
        try {
          return normalizePost(doc.data(), doc.id);
        } catch (error) {
          console.error(`Error normalizing post ${doc.id}:`, error);
          // Check if this is a connectivity-related error
          const isConnectivityError = error instanceof Error &&
            (error.message?.includes('offline') ||
              error.message?.includes('network') ||
              error.message?.includes('connection') ||
              (error as any).code === 'unavailable');

          if (isConnectivityError) {
            console.warn(`Post ${doc.id} normalization failed due to connectivity issues. Using fallback data.`);
          }

          // Get as much safe data as possible from the document
          const data = doc.data() || {};

          // Return a minimal valid post object with safer property access
          return {
            id: doc.id,
            title: data.title || 'Untitled (Offline Mode)',
            slug: data.slug || doc.id,
            content: data.content || '',
            excerpt: data.excerpt || '',
            coverImage: data.coverImage || '',
            sticky: Boolean(data.sticky),
            published: true,
            images: Array.isArray(data.images) ? data.images : [],
            authorId: data.authorId || 'system',
            authorEmail: data.authorEmail || 'system@fsce.org',
            date: data.date || Timestamp.now(),
            category: data.category || 'uncategorized',
            featured: Boolean(data.featured),
            tags: Array.isArray(data.tags) ? data.tags : [],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            _isOfflineData: true // Flag to indicate this was generated during offline mode
          };
        }
      });

      // In offline mode, we need to filter for published posts manually
      if (isOfflineMode) {
        posts = posts.filter(post => post.published === true);
      }

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

  async updatePost(id: string, post: Partial<Post>): Promise<boolean | { success: boolean, pending?: boolean, offline?: boolean, error?: string }> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();

      // Check if post exists
      if (!postDoc.exists() || !postData) {
        throw new Error('Post not found');
      }

      // Check authorization - this was missing and causing the issue
      // Allow editing if:
      // 1. The current user is the post author
      // 2. Post has no authorId (system-created)
      // 3. Post's authorId is 'system'
      const currentUserId = post.authorId;
      const postAuthorId = postData.authorId;
      const isSystemPost = !postAuthorId || postAuthorId === 'system';

      // If it's not a system post and the current user is not the author, deny access
      if (!isSystemPost && postAuthorId && currentUserId && postAuthorId !== currentUserId) {
        console.error('Unauthorized edit attempt: current user', currentUserId, 'trying to edit post by', postAuthorId);
        throw new Error('You do not have permission to edit this post');
      }

      try {
        await updateDoc(postRef, {
          ...post,
          updatedAt: serverTimestamp()
        });
        return true;
      } catch (updateError: any) {
        // Check if this is a connectivity/offline issue
        if (updateError.code === 'unavailable' ||
          updateError.message?.includes('network') ||
          updateError.message?.includes('offline')) {
          console.warn('Firebase is offline while trying to update post. Changes will be applied when connectivity is restored.');

          // Firebase will automatically retry the operation when back online due to persistence
          // Return true with a special flag to indicate pending updates
          return { success: true, pending: true, offline: true };
        }

        // Re-throw for other errors
        throw updateError;
      }
    } catch (error: any) {
      const isOfflineError = error.code === 'unavailable' ||
        error.message?.includes('offline') ||
        error.message?.includes('network');

      if (isOfflineError) {
        console.warn('Update operation will be retried when connection is restored:', error);
        return { success: false, offline: true, error: error.message };
      }

      console.error('Error updating post:', error);
      return false;
    }
  }

  async deletePost(userId: string, id: string): Promise<boolean | { success: boolean, offline?: boolean, error?: string }> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);

      let postDoc;
      try {
        postDoc = await getDoc(postRef);
      } catch (getError: any) {
        // Handle offline fetch during delete
        if (getError.code === 'unavailable' ||
          getError.message?.includes('offline') ||
          getError.message?.includes('network')) {
          console.warn('Firebase is offline while trying to delete post. Cannot verify permissions offline.');
          return {
            success: false,
            offline: true,
            error: 'Cannot delete post while offline. Please try again when your connection is restored.'
          };
        }
        throw getError;
      }

      const postData = postDoc.data();

      // Check if post exists
      if (!postDoc.exists() || !postData) {
        throw new Error('Post not found');
      }

      // Allow deletion if:
      // 1. User is the author of the post
      // 2. Post has no authorId (system-created)
      // 3. Post's authorId is 'system'
      const postAuthorId = postData.authorId;
      const isSystemPost = !postAuthorId || postAuthorId === 'system';

      if (!isSystemPost && postAuthorId !== userId) {
        throw new Error('Unauthorized deletion attempt');
      }

      try {
        await deleteDoc(postRef);
        return true;
      } catch (deleteError: any) {
        // Handle offline mode during delete
        if (deleteError.code === 'unavailable' ||
          deleteError.message?.includes('offline') ||
          deleteError.message?.includes('network')) {
          console.warn('Firebase is offline while trying to delete post. Operation will be retried when connection is restored.');
          return { success: true, offline: true };
        }
        throw deleteError;
      }
    } catch (error: any) {
      const isOfflineError = error.code === 'unavailable' ||
        error.message?.includes('offline') ||
        error.message?.includes('network');

      if (isOfflineError) {
        console.warn('Delete operation will be retried when connection is restored:', error);
        return { success: false, offline: true, error: error.message };
      }

      console.error('Error deleting post:', error);
      return false;
    }
  }
}

export const postsService = new PostsService();
