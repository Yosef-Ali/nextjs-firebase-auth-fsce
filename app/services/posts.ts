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
    
    // Return with current timestamp for immediate UI update
    return {
      id: docRef.id,
      ...post,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Post;
  },

  async updatePost(id: string, post: Partial<Post>): Promise<void> {
    const postRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(postRef, {
      ...post,
      updatedAt: serverTimestamp()
    });
  },

  async deletePost(userId: string, postId: string): Promise<boolean> {
    try {
      // First, check if the user is the author of the post
      const postDoc = await getDoc(doc(db, COLLECTION_NAME, postId));
      if (!postDoc.exists()) {
        console.error('Post not found');
        return false;
      }

      const postData = postDoc.data();
      if (postData.authorId !== userId) {
        console.error('User not authorized to delete this post');
        return false;
      }

      // If authorized, proceed with deletion
      await deleteDoc(doc(db, COLLECTION_NAME, postId));
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  async canEditPost(userId: string, postId: string): Promise<boolean> {
    try {
      const postDoc = await getDoc(doc(db, COLLECTION_NAME, postId));
      if (!postDoc.exists()) return false;
      
      const post = postDoc.data();
      return post.authorId === userId;
    } catch (error) {
      console.error('Error checking edit permission:', error);
      return false;
    }
  },

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  },

  async getPublishedPosts(category?: string): Promise<Post[]> {
    try {
      console.log('Fetching published posts with category:', category);
      
      let q = query(
        collection(db, COLLECTION_NAME),
        where('published', '==', true)
      );

      if (category) {
        q = query(
          collection(db, COLLECTION_NAME),
          where('published', '==', true),
          where('category', '==', category)
        );
      }

      const querySnapshot = await getDocs(q);
      console.log('Query snapshot size:', querySnapshot.size);

      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Individual post data:', {
          id: doc.id,
          published: data.published,
          category: data.category
        });
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

      console.log('Total posts found:', posts.length);

      // Sort posts by createdAt in memory instead of using orderBy
      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting published posts:', error);
      return [];
    }
  },

  async getPostBySlug(slug: string, category?: string): Promise<Post | null> {
    try {
      let q = query(
        collection(db, COLLECTION_NAME),
        where('slug', '==', slug)
      );

      if (category) {
        q = query(
          collection(db, COLLECTION_NAME),
          where('slug', '==', slug),
          where('category', '==', category)
        );
      }

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
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
    } catch (error) {
      console.error('Error getting post by slug:', error);
      return null;
    }
  },

  async getLatestPosts(category: string, count: number = 3): Promise<Post[]> {
    return this.getPublishedPosts(category).then(posts => posts.slice(0, count));
  },

  async getUpcomingEvents(count?: number): Promise<Post[]> {
    try {
      const posts = await this.getPublishedPosts('events');
      const now = Date.now();
      
      // Filter future events
      const upcomingEvents = posts.filter(post => {
        const eventDate = new Date(post.date).getTime();
        return eventDate >= now;
      });

      // Sort by date ascending (nearest events first)
      const sortedEvents = upcomingEvents.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      return count ? sortedEvents.slice(0, count) : sortedEvents;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  },

  async getLatestNews(count: number = 3): Promise<Post[]> {
    try {
      const posts = await this.getPublishedPosts('news');
      console.log('Fetched news posts:', posts);
      console.log('Number of news posts:', posts.length);
      return posts.slice(0, count);
    } catch (error) {
      console.error('Error getting latest news:', error);
      return [];
    }
  },

  async getAllNews(): Promise<Post[]> {
    try {
      const posts = await this.getPublishedPosts('news');
      
      // Sort by createdAt descending (newest first)
      return posts.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error getting all news:', error);
      return [];
    }
  },

  async getAllEvents(includePastEvents = false): Promise<Post[]> {
    try {
      const posts = await this.getPublishedPosts('events');
      const now = Date.now();

      const filteredEvents = includePastEvents 
        ? posts 
        : posts.filter(post => new Date(post.date).getTime() >= now);

      // Sort by date ascending
      return filteredEvents.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } catch (error) {
      console.error('Error getting all events:', error);
      return [];
    }
  },

  async getRelatedPosts(postId: string, category: string, limit: number = 3): Promise<Post[]> {
    const posts = await this.getPublishedPosts(category);
    return posts
      .filter(post => post.id !== postId)
      .slice(0, limit);
  },
};
