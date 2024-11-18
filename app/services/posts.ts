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
  orderBy,
  Timestamp,
  getDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const postsService = {
  async getUserPosts(userId: string): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    // Show all posts for any authenticated user
    const q = query(postsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    console.log('Fetched Posts:', querySnapshot.docs.length);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Post));
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
      updatedAt: Date.now(),
    });
  },

  async deletePost(id: string): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(postRef);
  },

  async canEditPost(userId: string, postId: string): Promise<boolean> {
    try {
      // Only check if the post exists
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

  async getPublishedPosts(): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(postsRef, where('published', '==', true));
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post));
  },

  async getPostBySlug(slug: string): Promise<Post | null> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(postsRef, where('published', '==', true)); // Removed slug condition temporarily
  
    const querySnapshot = await getDocs(q);
  
    if (querySnapshot.empty) return null;
  
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt instanceof Timestamp 
        ? doc.data().createdAt.toMillis() 
        : doc.data().createdAt,
      updatedAt: doc.data().updatedAt instanceof Timestamp 
        ? doc.data().updatedAt.toMillis() 
        : doc.data().updatedAt,
    } as Post;
  },

  async getRelatedPosts(postId: string, category: string, limit: number = 3): Promise<Post[]> {
    const postsRef = collection(db, COLLECTION_NAME);
    const q = query(
      postsRef,
      where('published', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
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
      .filter(post => post.id !== postId)
      .slice(0, limit);
      
    return posts;
  },
};

async function testGetPublishedPosts() {
  try {
    const posts = await postsService.getPublishedPosts();
    console.log('Fetched Posts:', posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Call the test function immediately for testing
testGetPublishedPosts();
