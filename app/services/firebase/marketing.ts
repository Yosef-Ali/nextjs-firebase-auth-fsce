import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  Query,
  WhereFilterOp,
  addDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/app/firebase';

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: PostStatus;
  authorId: string;
  authorName: string;
  authorImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: PostStatus;
  authorId: string;
  authorName: string;
  authorImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  status?: PostStatus;
  authorId?: string;
  updatedAt: Date;
}

class MarketingService {
  private readonly collectionName = 'posts';

  async createPost(input: CreatePostInput): Promise<Post> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...input,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Failed to create post');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      await updateDoc(docRef, {
        ...input,
        updatedAt: serverTimestamp(),
      });

      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Post not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('authorId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const docSnap = await getDoc(doc(db, this.collectionName, id));
      
      if (!docSnap.exists()) {
        return null;
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Post;
    } catch (error) {
      console.error('Error getting post:', error);
      throw error;
    }
  }

  async getPageContent(slug: string): Promise<Post | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        firestoreLimit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const docData = querySnapshot.docs[0];
      const data = docData.data();
      
      return {
        id: docData.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        category: data.category,
        status: data.status,
        authorId: data.authorId,
        authorName: data.authorName,
        authorImage: data.authorImage,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as Post;
    } catch (error) {
      console.error('Error fetching page content:', error);
      return null;
    }
  }

  async getLatestNews(limitCount = 3): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', 'news'),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  async getPostsByCategory(category: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
    } catch (error) {
      console.error(`Error fetching ${category} posts:`, error);
      return [];
    }
  }

  async searchPosts(searchQuery: string, category?: string): Promise<Post[]> {
    try {
      let q: Query = query(
        collection(db, this.collectionName),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc')
      );

      if (category) {
        q = query(
          collection(db, this.collectionName),
          where('status', '==', 'published'),
          where('category', '==', category),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      // Client-side search since Firestore doesn't support full-text search
      const searchTermLower = searchQuery.toLowerCase();
      return posts.filter(post => 
        post.title.toLowerCase().includes(searchTermLower) ||
        post.excerpt.toLowerCase().includes(searchTermLower) ||
        String(post.content).toLowerCase().includes(searchTermLower)
      );
    } catch (error) {
      console.error('Error searching posts:', error);
      return [];
    }
  }
}

export const marketingService = new MarketingService();