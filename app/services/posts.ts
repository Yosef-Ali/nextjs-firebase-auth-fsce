import { User } from 'firebase/auth';
import { Authorization, authorization } from '@/lib/authorization';
import { db } from '@/lib/firebase';
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
  FieldValue,
  QueryConstraint,
  orderBy,
  limit as firestoreLimit,
  DocumentData // Import DocumentData
} from 'firebase/firestore';
import { ensureCategory } from '@/app/utils/category';
import { normalizePost } from '@/app/utils/post';
import { optimizedQuery } from '@/app/utils/query-helpers'; // Import optimizedQuery

const COLLECTION_NAME = 'posts';

class PostsService {
  async getCategories(): Promise<Category[]> {
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
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));
      } catch (innerError: any) {
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline, attempting to use cached data');

          const fallbackSnapshot = await getDocs(collection(db, COLLECTION_NAME));
          const posts = fallbackSnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));

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
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline while getting post, attempting to use cached data');

          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.metadata.fromCache) {
            console.log('Retrieved post from cache');
            return normalizePost(docSnap.data(), docSnap.id);
          }
        }

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
      // Query only by slug to avoid composite index
      const q = query(postsRef, where('slug', '==', slug));

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      // Find the first published post matching the slug
      for (const doc of querySnapshot.docs) {
        const postData = doc.data();
        if (postData.published === true) {
          return normalizePost(postData, doc.id);
        }
      }

      // If no published post found with that slug
      return null;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      // Consider offline handling if necessary, similar to getPostById
      return null;
    }
  }

  async getRelatedPosts(currentSlug: string, categoryId: string, limit = 3): Promise<Post[]> {
    try {
      const currentPost = await this.getPostBySlug(currentSlug);
      if (!currentPost) {
        return [];
      }

      const allPosts = await this.getPublishedPosts(categoryId);

      return allPosts
        .filter(post => post.id !== currentPost.id)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }

  async getAchievements(): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const querySnapshot = await getDocs(postsRef);

      const results: Post[] = [];

      querySnapshot.forEach(doc => {
        try {
          const data = doc.data();

          if (data.published !== true) return;

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

          results.push(post);
        } catch (docError) {
          console.error(`Error processing achievement ${doc.id}:`, docError);
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
      if (categoryId === 'achievements') {
        return this.getAchievements();
      }

      const postsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [
        where('published', '==', true)
      ];

      let querySnapshot;
      let isOfflineMode = false;

      try {
        const q = query(postsRef, ...constraints);
        querySnapshot = await getDocs(q);
      } catch (innerError: any) {
        if (innerError.code === 'unavailable' ||
          innerError.message?.includes('network') ||
          innerError.message?.includes('offline')) {
          console.warn('Firebase is offline, attempting to use cached data for published posts');

          querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
          console.log('Retrieved posts from cache, will filter locally');
          isOfflineMode = true;
        } else {
          throw innerError;
        }
      }

      let posts = querySnapshot.docs.map(doc => {
        try {
          return normalizePost(doc.data(), doc.id);
        } catch (error) {
          console.error(`Error normalizing post ${doc.id}:`, error);
          const isConnectivityError = error instanceof Error &&
            (error.message?.includes('offline') ||
              error.message?.includes('network') ||
              error.message?.includes('connection') ||
              (error as any).code === 'unavailable');

          if (isConnectivityError) {
            console.warn(`Post ${doc.id} normalization failed due to connectivity issues. Using fallback data.`);
          }

          const data = doc.data() || {};

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
            _isOfflineData: true
          };
        }
      });

      if (isOfflineMode) {
        posts = posts.filter(post => post.published === true);
      }

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
      // Use optimizedQuery to fetch published posts sorted by creation date
      const publishedPosts: DocumentData[] = await optimizedQuery(COLLECTION_NAME, {
        published: true,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      // Filter in memory for the 'news' category
      const newsPosts = publishedPosts.filter((post: DocumentData) => { // Add type annotation
        const category = post.category;
        if (!category) return false;
        const categoryId = typeof category === 'string' ? category : category.id;
        return categoryId?.toLowerCase() === 'news';
      });

      // Normalize the results
      return newsPosts.map((postData: DocumentData) => normalizePost(postData, postData.id)); // Add type annotation

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

  async updatePost(
    currentUser: User | null,
    id: string,
    postUpdateData: Partial<Post>
  ): Promise<{ success: boolean; pending?: boolean; offline?: boolean; error?: string }> {
    // ... (currentUser check) ...
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // ... (get postDoc and originalPostData) ...
      const postRef = doc(db, COLLECTION_NAME, id);
      const postDoc = await getDoc(postRef);
      const originalPostData = postDoc.data();

      if (!postDoc.exists() || !originalPostData) {
        return { success: false, error: 'Post not found' };
      }

      const normalizedOriginalPost = normalizePost(originalPostData, id);

      // Add await to the authorization check
      if (!(await authorization.canEditPost(currentUser, normalizedOriginalPost.authorId))) {
        console.error(
          `Unauthorized edit attempt: User ${currentUser.uid} (${currentUser.email}) tried to edit post ${id} by author ${normalizedOriginalPost.authorId}`
        );
        return { success: false, error: 'You do not have permission to edit this post' };
      }

      // ... (prepare updatePayload) ...
      const updatePayload: Partial<Omit<Post, 'createdAt' | 'updatedAt'>> & { updatedAt: FieldValue } = {
        ...postUpdateData,
        category: postUpdateData.category ? ensureCategory(postUpdateData.category) : undefined,
        updatedAt: serverTimestamp()
      };

      // ... (delete fields) ...
      delete updatePayload.id;
      delete updatePayload.authorId; // Prevent changing author via update

      try {
        // ... (updateDoc call) ...
        await updateDoc(postRef, updatePayload as any);
        return { success: true };
      } catch (updateError: any) {
        // ... (offline handling for update) ...
        if (updateError.code === 'unavailable' ||
          updateError.message?.includes('network') ||
          updateError.message?.includes('offline')) {
          console.warn('Firebase is offline while trying to update post. Changes will be applied when connectivity is restored.');
          return { success: true, pending: true, offline: true };
        }
        throw updateError;
      }
    } catch (error: any) {
      // ... (general error handling for updatePost) ...
      const isOfflineError = error.code === 'unavailable' ||
        error.message?.includes('offline') ||
        error.message?.includes('network');

      if (isOfflineError) {
        console.warn('Update operation failed due to offline status:', error);
        return { success: false, offline: true, error: 'Operation failed while offline. It might be retried automatically.' };
      }

      console.error('Error updating post:', error);
      return { success: false, error: error.message || 'Failed to update post' };
    }
  }

  async deletePost(
    currentUser: User | null,
    id: string
  ): Promise<{ success: boolean; offline?: boolean; error?: string }> {
    // ... (currentUser check) ...
    if (!currentUser) {
      return { success: false, error: 'Authentication required' };
    }

    try {
      // ... (get postDoc, handle offline fetch error) ...
      const postRef = doc(db, COLLECTION_NAME, id);
      let postDoc;

      try {
        postDoc = await getDoc(postRef);
      } catch (getError: any) {
        if (getError.code === 'unavailable' ||
          getError.message?.includes('offline') ||
          getError.message?.includes('network')) {
          console.warn('Firebase is offline while trying to fetch post for deletion. Cannot verify permissions offline.');
          return {
            success: false,
            offline: true,
            error: 'Cannot delete post while offline. Please try again when connection is restored.'
          };
        }
        throw getError; // Re-throw other fetch errors
      }

      const postData = postDoc.data();

      if (!postDoc.exists() || !postData) {
        return { success: false, error: 'Post not found' };
      }

      const normalizedPost = normalizePost(postData, id);

      // Add await to the authorization check
      if (!(await authorization.canDeletePost(currentUser, normalizedPost.authorId))) {
        console.error(
          `Unauthorized delete attempt: User ${currentUser.uid} (${currentUser.email}) tried to delete post ${id} by author ${normalizedPost.authorId}`
        );
        return { success: false, error: 'You do not have permission to delete this post' };
      }

      try {
        // ... (deleteDoc call) ...
        await deleteDoc(postRef);
        return { success: true };
      } catch (deleteError: any) {
        // ... (offline handling for delete) ...
        if (deleteError.code === 'unavailable' ||
          deleteError.message?.includes('offline') ||
          deleteError.message?.includes('network')) {
          console.warn('Firebase is offline while trying to delete post. Operation will be retried when connection is restored.');
          return { success: true, offline: true }; // Indicate success because Firestore handles offline persistence
        }
        throw deleteError;
      }
    } catch (error: any) {
      // ... (general error handling for deletePost) ...
      const isOfflineError = error.code === 'unavailable' ||
        error.message?.includes('offline') ||
        error.message?.includes('network');

      if (isOfflineError) {
        console.warn('Delete operation failed due to offline status:', error);
        return { success: false, offline: true, error: 'Operation failed while offline. It might be retried automatically.' };
      }

      console.error('Error deleting post:', error);
      return { success: false, error: error.message || 'Failed to delete post' };
    }
  }
}

export const postsService = new PostsService();
