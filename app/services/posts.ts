import { db } from '@/lib/firebase';
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
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  orderBy,
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
          published: Boolean(data?.published),
          authorId: data?.authorId ?? '',
          authorEmail: data?.authorEmail ?? '',
          date: data?.date ?? new Date().toISOString(),
          createdAt: createdAt instanceof Timestamp ? createdAt.toMillis() : 
                    typeof createdAt === 'number' ? createdAt : 
                    Date.now(),
          updatedAt: updatedAt instanceof Timestamp ? updatedAt.toMillis() : 
                    typeof updatedAt === 'number' ? updatedAt : 
                    Date.now(),
          coverImage: data?.coverImage ?? '',
          images: Array.isArray(data?.images) ? data.images : [],
          featured: Boolean(data?.featured),
          section: data?.section ?? '',
          tags: Array.isArray(data?.tags) ? data.tags : [],
          time: data?.time ?? '',
          location: data?.location ?? '',
          status: data?.status
        } as Post;
      });
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = serverTimestamp();
    const postData = {
      ...post,
      category: typeof post.category === 'string' ? post.category : post.category?.id || '',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);

    return {
      id: docRef.id,
      ...post,
      category: typeof post.category === 'string' ? post.category : post.category?.id || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Post;
  },

  async updatePost(id: string, post: Partial<Post>, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...post,
        category: typeof post.category === 'string' ? post.category : post.category?.id || '',
        updatedAt: serverTimestamp()
      };
      await updateDoc(postRef, updateData);
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

  async getPostsByCategory(category: string, limit?: number): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category', '==', category),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: typeof data.category === 'string' ? data.category : data.category?.id || category,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                    typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                    typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        } as Post;
      });

      // Handle sorting based on category
      let sortedPosts = [...posts];
      if (category === 'events') {
        // For events, filter future events and sort by date
        sortedPosts = posts
          .filter(post => new Date(post.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        // For other categories, sort by creation date
        sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
      }

      // Apply limit if specified
      return limit ? sortedPosts.slice(0, limit) : sortedPosts;
    } catch (error) {
      console.error('Error getting posts by category:', error);
      return [];
    }
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
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;
      const category = data.category || {};

      return {
        id: doc.id,
        ...data,
        category: {
          id: category.id ?? '',
          name: category.name ?? ''
        },
        createdAt: createdAt instanceof Timestamp ? createdAt.toMillis() : 
                  typeof createdAt === 'number' ? createdAt : Date.now(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toMillis() : 
                  typeof updatedAt === 'number' ? updatedAt : Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null;
    }
  },

  async getRelatedPosts(slug: string, category: string, limit: number = 3): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category.id', '==', category),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                      typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                      typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          } as Post;
        })
        .filter(post => post.slug !== slug)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);

      return posts;
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  },

  async getPublishedPosts(category?: string, limitCount?: number): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [
        where('published', '==', true),
      ];

      if (category) {
        // Handle both string categories and category objects
        constraints.push(
          where('category', 'in', [
            category,
            { id: category, name: category.charAt(0).toUpperCase() + category.slice(1) }
          ])
        );
      }

      const q = query(postsRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                    typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                    typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        } as Post;
      });

      // For events, filter future events and sort by date
      if (category === 'events') {
        posts = posts
          .filter(post => new Date(post.date) >= new Date())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      } else {
        // For other categories, sort by creation date
        posts = posts.sort((a, b) => b.createdAt - a.createdAt);
      }

      if (limitCount) {
        posts = posts.slice(0, limitCount);
      }

      return posts;
    } catch (error) {
      console.error('Error getting published posts:', error);
      return [];
    }
  },

  async getAllNews(): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      // Simplified query without composite index
      const q = query(
        postsRef,
        where('category.id', '==', 'news'),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const category = data.category || {};
        return {
          id: doc.id,
          ...data,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                    typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                    typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        } as Post;
      });

      // Sort in memory instead of in query
      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  },

  async getUpcomingEvents(limit: number = 3): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category.id', '==', 'events'),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const category = data.category || {};
        return {
          id: doc.id,
          ...data,
          category: {
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
          },
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                    typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                    typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        } as Post;
      });

      const futureEvents = events
        .filter(event => new Date(event.date) >= new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);

      return futureEvents;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }
};
