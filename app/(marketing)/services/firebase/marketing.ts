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

export interface Author {
  id: string;
  name: string;
  image: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  images?: string[];
  content: any;
  excerpt: string;
  status: PostStatus;
  category: string;
  author: Author;
  updatedAt: number;
}

export type CreatePostInput = Omit<Post, 'id' | 'updatedAt'>;
export type UpdatePostInput = Partial<Omit<Post, 'id'>>;

class MarketingService {
  private readonly collectionName = 'posts';

  async createPost(input: CreatePostInput): Promise<Post> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...input,
        updatedAt: Date.now(),
      });

      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      return {
        id: docRef.id,
        title: data!.title,
        slug: data!.slug,
        images: data!.images,
        content: data!.content,
        excerpt: data!.excerpt,
        status: data!.status,
        category: data!.category,
        author: data!.author,
        updatedAt: data!.updatedAt,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  async updatePost(id: string, input: UpdatePostInput): Promise<Post> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...input,
        updatedAt: Date.now(),
      });

      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      if (!data) {
        throw new Error('Post not found');
      }

      return {
        id: docRef.id,
        title: data.title,
        slug: data.slug,
        images: data.images,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        category: data.category,
        author: data.author,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post');
    }
  }

  async deletePost(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw new Error('Failed to delete post');
    }
  }

  async getUserPosts(userId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('author.id', '==', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          images: data.images,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status,
          category: data.category,
          author: data.author,
          updatedAt: data.updatedAt,
        };
      });
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  }

  async getPostById(id: string): Promise<Post | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        slug: data.slug,
        images: data.images,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        category: data.category,
        author: data.author,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
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
        images: data.images,
        content: data.content,
        excerpt: data.excerpt,
        status: data.status,
        category: data.category,
        author: data.author,
        updatedAt: data.updatedAt,
      };
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          images: data.images,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status,
          category: data.category,
          author: data.author,
          updatedAt: data.updatedAt,
        };
      });
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
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          images: data.images,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status,
          category: data.category,
          author: data.author,
          updatedAt: data.updatedAt,
        };
      });
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
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          slug: data.slug,
          images: data.images,
          content: data.content,
          excerpt: data.excerpt,
          status: data.status,
          category: data.category,
          author: data.author,
          updatedAt: data.updatedAt,
        };
      });

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