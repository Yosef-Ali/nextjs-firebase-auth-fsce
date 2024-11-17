import { db } from '@/app/firebase';
import { Post } from '@/app/types/post';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const postsService = {
  async getUserPosts(authorId: string): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(
      postsRef,
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = Date.now();
    const postData = {
      ...post,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);
    return {
      id: docRef.id,
      ...postData,
    };
  },

  async updatePost(id: string, post: Partial<Post>): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      ...post,
      updatedAt: Date.now(),
    });
  },

  async deletePost(id: string): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(postRef);
  },

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
};
