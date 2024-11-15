import { db } from '../../../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';

export interface Post {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const POSTS_PER_PAGE = 10;

export const dashboardService = {
  // Posts
  async getPosts(
    status?: Post['status'],
    category?: string,
    lastDoc?: DocumentSnapshot
  ) {
    try {
      let postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      if (status && status !== 'all') {
        postsQuery = query(postsQuery, where('status', '==', status));
      }

      if (category) {
        postsQuery = query(postsQuery, where('category', '==', category));
      }

      if (lastDoc) {
        postsQuery = query(postsQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(postsQuery);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return { posts, lastVisible };
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(id: string, data: Partial<Post>) {
    try {
      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  },

  async deletePost(id: string) {
    try {
      const docRef = doc(db, 'posts', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Media
  async getMedia(lastDoc?: DocumentSnapshot) {
    try {
      let mediaQuery = query(
        collection(db, 'media'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      if (lastDoc) {
        mediaQuery = query(mediaQuery, startAfter(lastDoc));
      }

      const snapshot = await getDocs(mediaQuery);
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];

      return { media, lastVisible };
    } catch (error) {
      console.error('Error fetching media:', error);
      throw error;
    }
  },
};
