import { db } from '@/lib/firebase';
import { Post } from '@/app/types/post';
import { usersService } from './users';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  getDoc,
  orderBy,
  serverTimestamp,
  limit,
} from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const postsService = {
  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef, 
        orderBy('createdAt', 'desc')  
      );
      
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          category: data.category || '',
          slug: data.slug || '',
          published: data.published || false,
          authorId: data.authorId || '',
          authorEmail: data.authorEmail || '',
          date: data.date || new Date().toISOString(),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
          excerpt: data.excerpt || '',
          coverImage: data.coverImage || '',
          images: data.images || [],
          section: data.section || '',
          featured: data.featured || false,
          tags: data.tags || [],
          time: data.time || '',
          location: data.location || '',
        } as Post;
      });

      return posts;
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
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
  },

  async updatePost(id: string, post: Partial<Post>, userId: string): Promise<boolean> {
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
  },

  async deletePost(userId: string, postId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(postsRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null;
    }
  },

  async getRelatedPosts(currentSlug: string, category: string, limit: number = 3): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category', '==', category),
        where('slug', '!=', currentSlug),
        orderBy('slug'),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toMillis() : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp ? doc.data().updatedAt.toMillis() : Date.now(),
      })) as Post[];
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  }
};
