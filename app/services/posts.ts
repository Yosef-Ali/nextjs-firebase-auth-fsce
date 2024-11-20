import { db } from '@/app/firebase';
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
} from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const postsService = {
  async getUserPosts(userId: string): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(postsRef);
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));

    // Sort in memory
    return posts.sort((a, b) => b.createdAt - a.createdAt);
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = Timestamp.now();
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
      updatedAt: Timestamp.now(),
    });
  },

  async deletePost(id: string): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(postRef);
  },

  async canEditPost(userId: string, postId: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, postId);
      const postDoc = await getDoc(postRef);
      return postDoc.exists();
    } catch (error) {
      console.error('Error checking post permissions:', error);
      return false;
    }
  },

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  },

  async getPublishedPosts(category?: string): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(postsRef, where('published', '==', true));
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));

    // Filter by category and sort in memory
    return posts
      .filter(post => !category || post.category === category)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async getPostBySlug(slug: string, category?: string): Promise<Post | null> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(
      postsRef,
      where('slug', '==', slug),
      where('published', '==', true)
    );
  
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;

    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));

    // Filter by category in memory if needed
    const filteredPosts = category 
      ? posts.filter(post => post.category === category)
      : posts;

    return filteredPosts[0] || null;
  },

  async getLatestPosts(category: string, count: number = 3): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));

    // Sort and limit in memory
    return posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, count);
  },

  async getUpcomingEvents(count?: number): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const now = new Date().toISOString().split('T')[0];
    
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', 'events')
    );
    
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));

    // Filter future events, sort by date, and limit in memory
    return events
      .filter(event => event.date >= now)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, count || events.length);
  },

  async getLatestNews(count?: number): Promise<Post[]> {
    return this.getLatestPosts('news', count || 3);
  },

  async getAllEvents(includePastEvents = false): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const now = new Date().toISOString().split('T')[0];
    
    const q = query(
      postsRef,
      where('published', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toMillis() 
          : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toMillis() 
          : data.updatedAt,
        date: data.date || ''
      } as Post;
    });

    // Filter events by category and date
    const eventCategories = ['conference', 'workshop', 'campaign', 'training', 'forum', 'exhibition'];
    return events
      .filter(event => 
        eventCategories.includes(event.category) && 
        (includePastEvents || (event.date && event.date >= now))
      )
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      });
  },

  async getAllNews(): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(postsRef, where('published', '==', true));
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));

    // Filter news only and sort by date
    return posts
      .filter(post => post.category === 'major' || post.category === 'program' || 
                     post.category === 'impact' || post.category === 'partnership')
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async getRelatedPosts(postId: string, category: string, limit: number = 3): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', category)
    );
    
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : doc.data().createdAt,
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : doc.data().updatedAt,
      } as Post))
      .filter(post => post.id !== postId);

    // Sort in memory and limit results
    return posts
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  },
};
