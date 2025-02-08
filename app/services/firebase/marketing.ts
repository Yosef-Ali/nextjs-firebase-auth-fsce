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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: {
    id: string;
    name: string;
  };
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
  category: {
    id: string;
    name: string;
  };
  status: PostStatus;
  authorId: string;
  authorName: string;
  authorImage: string;
}

export interface UpdatePostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: {
    id: string;
    name: string;
  };
  status?: PostStatus;
  authorId?: string;
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

      const data = docSnap.data();
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      const category = data.category || {};

      return {
        id: docSnap.id,
        title: data?.title ?? '',
        content: data?.content ?? '',
        excerpt: data?.excerpt ?? '',
        slug: data?.slug ?? docSnap.id,
        category: {
          id: category.id ?? category ?? '',
          name: category.name ?? category ?? ''
        },
        status: data?.status,
        authorId: data?.authorId ?? '',
        authorName: data?.authorName ?? '',
        authorImage: data?.authorImage ?? '',
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
      } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, input: UpdatePostInput, userId: string): Promise<Post | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const postDoc = await getDoc(docRef);

      if (!postDoc.exists()) {
        console.error('Post not found');
        return null;
      }

      // Get the user's data to check if they're an admin
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        console.error('User not found');
        return null;
      }

      const userData = userDoc.data();
      const postData = postDoc.data();

      // Allow editing if user is admin or the post author
      if (userData.role !== 'admin' && postData.authorId !== userId) {
        console.error('User not authorized to edit this post');
        return null;
      }

      await updateDoc(docRef, {
        ...input,
        updatedAt: serverTimestamp(),
      });

      const updatedDoc = await getDoc(docRef);

      if (!updatedDoc.exists()) {
        throw new Error('Post not found after update');
      }

      const data = updatedDoc.data();
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      const category = data.category || {};

      return {
        id: updatedDoc.id,
        title: data?.title ?? '',
        content: data?.content ?? '',
        excerpt: data?.excerpt ?? '',
        slug: data?.slug ?? updatedDoc.id,
        category: {
          id: category.id ?? category ?? '',
          name: category.name ?? category ?? ''
        },
        status: data?.status,
        authorId: data?.authorId ?? '',
        authorName: data?.authorName ?? '',
        authorImage: data?.authorImage ?? '',
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
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

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;
        const category = data.category || {};

        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          status: data?.status,
          authorId: data?.authorId ?? '',
          authorName: data?.authorName ?? '',
          authorImage: data?.authorImage ?? '',
          createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
          updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
        } as Post;
      });
    } catch (error) {
      console.error('Error getting user posts:', error);
      throw error;
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
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      const category = data.category || {};

      return {
        id: docSnap.id,
        title: data?.title ?? '',
        content: data?.content ?? '',
        excerpt: data?.excerpt ?? '',
        slug: data?.slug ?? docSnap.id,
        category: {
          id: category.id ?? category ?? '',
          name: category.name ?? category ?? ''
        },
        status: data?.status,
        authorId: data?.authorId ?? '',
        authorName: data?.authorName ?? '',
        authorImage: data?.authorImage ?? '',
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
      } as Post;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      throw error;
    }
  }

  async getPageContent(slug: string): Promise<Post | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('status', '==', 'published')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      const category = data.category || {};

      return {
        id: doc.id,
        title: data?.title ?? '',
        content: data?.content ?? '',
        excerpt: data?.excerpt ?? '',
        slug: data?.slug ?? doc.id,
        category: {
          id: category.id ?? category ?? '',
          name: category.name ?? category ?? ''
        },
        status: data?.status,
        authorId: data?.authorId ?? '',
        authorName: data?.authorName ?? '',
        authorImage: data?.authorImage ?? '',
        createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
      } as Post;
    } catch (error) {
      console.error('Error getting page content:', error);
      throw error;
    }
  }

  async getLatestNews(limitCount = 3): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category.id', '==', 'news'),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;
        const category = data.category || {};

        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          status: data?.status,
          authorId: data?.authorId ?? '',
          authorName: data?.authorName ?? '',
          authorImage: data?.authorImage ?? '',
          createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
          updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
        } as Post;
      });
    } catch (error) {
      console.error('Error fetching latest news:', error);
      return [];
    }
  }

  async getPostsByCategory(categoryId: string): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category.id', '==', categoryId),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;
        const category = data.category || {};

        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          status: data?.status,
          authorId: data?.authorId ?? '',
          authorName: data?.authorName ?? '',
          authorImage: data?.authorImage ?? '',
          createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
          updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
        } as Post;
      });
    } catch (error) {
      console.error(`Error fetching ${categoryId} posts:`, error);
      return [];
    }
  }

  async searchPosts(searchQuery: string, categoryId?: string): Promise<Post[]> {
    try {
      let q: Query = query(
        collection(db, this.collectionName),
        where('status', '==', 'published'),
        orderBy('updatedAt', 'desc')
      );

      if (categoryId) {
        q = query(
          collection(db, this.collectionName),
          where('status', '==', 'published'),
          where('category.id', '==', categoryId),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        const updatedAt = data.updatedAt;
        const category = data.category || {};

        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          status: data?.status,
          authorId: data?.authorId ?? '',
          authorName: data?.authorName ?? '',
          authorImage: data?.authorImage ?? '',
          createdAt: createdAt instanceof Timestamp ? createdAt.toDate() : new Date(),
          updatedAt: updatedAt instanceof Timestamp ? updatedAt.toDate() : new Date(),
        } as Post;
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