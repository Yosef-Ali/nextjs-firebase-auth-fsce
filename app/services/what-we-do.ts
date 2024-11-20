import { db } from '@/app/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp, addDoc, updateDoc, deleteDoc, limit } from 'firebase/firestore';
import { Post } from '@/app/types/post';

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

class WhatWeDoService {
  private collectionName = 'posts';

  async getAllPrograms(includeUnpublished = false): Promise<Post[]> {
    try {
      let constraints = [
        where('tags', 'array-contains', 'programs')
      ];

      if (!includeUnpublished) {
        constraints.push(where('published', '==', true));
      }

      // Create separate queries for filtering and sorting
      const q = query(
        collection(db, this.collectionName),
        ...constraints
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as Post[];

      // Sort in memory for now to avoid complex indexes
      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting programs:', error);
      throw error;
    }
  }

  async getProgramsByCategory(category: string, includeUnpublished = false): Promise<Post[]> {
    try {
      let constraints = [
        where('category', '==', category),
        where('tags', 'array-contains', 'programs')
      ];

      if (!includeUnpublished) {
        constraints.push(where('published', '==', true));
      }

      // Create separate queries for filtering and sorting
      const q = query(
        collection(db, this.collectionName),
        ...constraints
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as Post[];

      // Sort in memory for now to avoid complex indexes
      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting programs by category:', error);
      throw error;
    }
  }

  async getProgramBySlug(slug: string): Promise<Post | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('tags', 'array-contains', 'programs'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error getting program by slug:', error);
      throw error;
    }
  }

  async createProgram(program: Omit<Post, 'id' | 'slug'>): Promise<Post> {
    try {
      // Generate slug from title if not provided
      const slug = generateSlug(program.title);

      // Check if slug already exists
      const existingPost = await this.getProgramBySlug(slug);
      if (existingPost) {
        throw new Error('A program with this title already exists');
      }

      const docRef = await addDoc(collection(db, this.collectionName), {
        ...program,
        slug,
        tags: [...(program.tags || []), 'programs'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      const doc = await getDoc(docRef);
      return {
        id: doc.id,
        ...doc.data(),
      } as Post;
    } catch (error) {
      console.error('Error creating program:', error);
      throw error;
    }
  }

  async updateProgram(id: string, program: Partial<Post>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // If title is being updated, update slug as well
      if (program.title) {
        program.slug = generateSlug(program.title);
      }
      
      await updateDoc(docRef, {
        ...program,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating program:', error);
      throw error;
    }
  }

  async deleteProgram(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting program:', error);
      throw error;
    }
  }

  async getRelatedPosts(currentPost: Post, maxPosts: number = 3): Promise<Post[]> {
    try {
      // First, get all posts in the same category
      const postsRef = collection(db, this.collectionName);
      const q = query(
        postsRef,
        where("category", "==", currentPost.category),
        limit(maxPosts + 1) // Get one extra to account for the current post
      );

      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      // Filter out the current post and limit to maxPosts
      querySnapshot.forEach((doc) => {
        const post = { id: doc.id, ...doc.data() } as Post;
        if (post.slug !== currentPost.slug) {
          posts.push(post);
        }
      });

      return posts.slice(0, maxPosts);
    } catch (error) {
      console.error("Error fetching related posts:", error);
      return [];
    }
  }
}

export const whatWeDoService = new WhatWeDoService();
