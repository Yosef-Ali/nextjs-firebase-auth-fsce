import { Timestamp } from 'firebase/firestore';
import { Post, PostStatus } from '@/app/types/post';
import { Category, CategoryType } from '@/app/types/category';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toTimestamp, compareTimestamps } from '@/app/utils/date';
import { normalizeCategory } from '@/app/utils/category';

// Helper function to normalize timestamps in an object
function normalizeTimestamps(data: any): any {
  if (!data) return data;

  const now = Timestamp.now();
  const result = { ...data };

  // Convert date fields to Timestamps if they exist
  if (data.createdAt) result.createdAt = toTimestamp(data.createdAt);
  if (data.updatedAt) result.updatedAt = toTimestamp(data.updatedAt);
  if (data.date) result.date = toTimestamp(data.date);

  // Set default timestamps if they don't exist
  if (!result.createdAt) result.createdAt = now;
  if (!result.updatedAt) result.updatedAt = now;
  if (!result.date) result.date = now;

  return result;
}

// Helper function to create a Category object with consistent structure
function createCategory(id: string, name: string): Category {
  const now = Timestamp.now();
  return {
    id,
    name,
    slug: id.toLowerCase(),
    type: 'post' as CategoryType,
    featured: false, // Add default value for featured property
    createdAt: now,
    updatedAt: now
  };
}

// Sort helper using our timestamp compare function
function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => {
    if (a.createdAt instanceof Timestamp && b.createdAt instanceof Timestamp) {
      return b.createdAt.seconds - a.createdAt.seconds;
    }
    // Fallback to comparing milliseconds if we have numbers
    const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : a.createdAt;
    const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : b.createdAt;
    return bTime - aTime;
  });
}

// Normalize post data with proper timestamp handling
function normalizePost(id: string, data: any, category: Category): Post {
  const now = Timestamp.now();
  return {
    id,
    title: data?.title ?? '',
    content: data?.content ?? '',
    excerpt: data?.excerpt ?? '',
    slug: data?.slug ?? id,
    category,
    published: Boolean(data?.published),
    sticky: Boolean(data?.sticky),
    authorId: data?.authorId ?? '',
    authorEmail: data?.authorEmail ?? '',
    date: toTimestamp(data?.date ?? now),
    createdAt: toTimestamp(data?.createdAt ?? now),
    updatedAt: toTimestamp(data?.updatedAt ?? now),
    coverImage: data?.coverImage ?? '',
    images: Array.isArray(data?.images) ? data.images : [],
    featured: Boolean(data?.featured),
    section: data?.section ?? '',
    tags: Array.isArray(data?.tags) ? data.tags : [],
    time: data?.time ?? '',
    location: data?.location ?? '',
    status: data?.status
  };
}

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
        return normalizeTimestamps({
          id: doc.id,
          ...data
        }) as Post;
      });
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  },

  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      if (categoryDoc.exists()) {
        const data = categoryDoc.data();
        return createCategory(categoryId, data.name || categoryId);
      }
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  async getNormalizedCategory(category: string | Category): Promise<Category> {
    if (typeof category === 'string') {
      const categoryDetails = await this.getCategoryById(category);
      if (categoryDetails) {
        return categoryDetails;
      }
      return createCategory(category, category);
    }
    if (this.isCompleteCategory(category)) {
      return category;
    }
    // If category is an object but incomplete, create a new complete category
    const id = (category as Partial<Category>).id || '';
    const name = (category as Partial<Category>).name || id;
    return createCategory(id, name);
  },

  isCompleteCategory(category: any): category is Category {
    return category &&
      typeof category.id === 'string' &&
      typeof category.name === 'string' &&
      typeof category.slug === 'string' &&
      typeof category.type === 'string' &&
      category.createdAt instanceof Timestamp &&
      category.updatedAt instanceof Timestamp;
  },

  async createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    try {
      const now = Timestamp.now();
      const postData = {
        ...data,
        createdAt: now,
        updatedAt: now,
        date: toTimestamp(data.date || now),
        slug: data.slug || this.createSlug(data.title),
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);

      return {
        id: docRef.id,
        ...postData,
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(id: string, post: Partial<Omit<Post, 'category'>> & { category?: string | Category }, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const now = Timestamp.now();

      // Create initial update data without category
      const { category, ...restData } = post;
      const baseUpdateData: Partial<Omit<Post, 'category'>> = {
        ...restData,
        // Only allow sticky posts if they are published
        sticky: restData.sticky && restData.published !== false ? restData.sticky : false,
        updatedAt: now,
        date: toTimestamp(restData.date || now)
      };

      // Only add category if it exists
      if (category) {
        const normalizedCategory = await this.getNormalizedCategory(category);
        await updateDoc(postRef, {
          ...baseUpdateData,
          category: normalizedCategory,
          updatedAt: now
        });
      } else {
        await updateDoc(postRef, {
          ...baseUpdateData,
          updatedAt: now
        });
      }

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
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  async getPostsByCategory(category: string, limit?: number): Promise<Post[]> {
    try {
      console.log('Service: Getting posts by category:', category);
      const postsRef = collection(db, COLLECTION_NAME);
      let posts: Post[] = [];

      // Special cases for specific categories
      if (category.toLowerCase() === 'child-protection') {
        const specialQuery = query(
          postsRef,
          where('published', '==', true),
          where('category.id', '==', 'RMglo9PIj6wNdQNSFcuA')
        );
        const specialSnapshot = await getDocs(specialQuery);
        posts = posts.concat(specialSnapshot.docs.map(doc => {
          const data = doc.data();
          return normalizePost(doc.id, data, createCategory('child-protection', 'Child Protection'));
        }));
      } else if (category.toLowerCase() === 'advocacy') {
        // Special handling for advocacy posts with both object and string formats
        const advocacyQueries = [
          // Query for object format with lowercase id
          query(
            postsRef,
            where('published', '==', true),
            where('category.id', '==', 'advocacy')
          ),
          // Query for object format with capitalized name
          query(
            postsRef,
            where('published', '==', true),
            where('category.name', '==', 'Advocacy')
          ),
          // Query for string format
          query(
            postsRef,
            where('published', '==', true),
            where('category', '==', 'advocacy')
          ),
          // Query for string format capitalized
          query(
            postsRef,
            where('published', '==', true),
            where('category', '==', 'Advocacy')
          ),
          // Query for programs tagged with advocacy
          query(
            postsRef,
            where('published', '==', true),
            where('tags', 'array-contains', 'advocacy')
          )
        ];

        for (const q of advocacyQueries) {
          const snapshot = await getDocs(q);
          posts = posts.concat(snapshot.docs.map(doc => {
            const data = doc.data();
            return normalizePost(doc.id, data, createCategory('advocacy', 'Advocacy'));
          }));
        }
      }

      // Query for normalized category format
      const normalizedQuery = query(
        postsRef,
        where('published', '==', true),
        where('category.id', 'in', [category.toLowerCase(), category])
      );
      const normalizedSnapshot = await getDocs(normalizedQuery);
      posts = posts.concat(normalizedSnapshot.docs.map(doc => {
        const data = doc.data();
        return normalizePost(doc.id, data, createCategory(category.toLowerCase(), category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')));
      }));

      // Query for legacy string format
      const stringQuery = query(
        postsRef,
        where('published', '==', true),
        where('category', 'in', [
          category.toLowerCase(),
          category,
          category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        ])
      );
      const stringSnapshot = await getDocs(stringQuery);
      posts = posts.concat(stringSnapshot.docs.map(doc => {
        const data = doc.data();
        return normalizePost(doc.id, data, createCategory(category.toLowerCase(), category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')));
      }));

      // Query for name-based format
      const categoryName = category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const nameQuery = query(
        postsRef,
        where('published', '==', true),
        where('category.name', '==', categoryName)
      );
      const nameSnapshot = await getDocs(nameQuery);
      posts = posts.concat(nameSnapshot.docs.map(doc => {
        const data = doc.data();
        return normalizePost(doc.id, data, createCategory(category.toLowerCase(), categoryName));
      }));

      // Remove duplicates by ID
      const uniquePosts = Array.from(new Map(posts.map(post => [post.id, post])).values());
      const sortedPosts = uniquePosts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      const result = limit ? sortedPosts.slice(0, limit) : sortedPosts;
      console.log('Service: Returning', result.length, 'posts for category:', category);
      return result;

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
      return normalizeTimestamps({
        id: doc.id,
        ...data
      }) as Post;
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
            title: data?.title ?? '',
            content: data?.content ?? '',
            excerpt: data?.excerpt ?? '',
            slug: data?.slug ?? doc.id,
            category: typeof data.category === 'string'
              ? { id: data.category, name: data.category }
              : data.category || { id: '', name: '' },
            published: Boolean(data?.published),
            sticky: Boolean(data?.sticky),
            authorId: data?.authorId ?? '',
            authorEmail: data?.authorEmail ?? '',
            date: data?.date ? toTimestamp(data.date) : Timestamp.now(),
            createdAt: toTimestamp(data.createdAt),
            updatedAt: toTimestamp(data.updatedAt),
            coverImage: data?.coverImage ?? '',
            images: Array.isArray(data?.images) ? data.images : [],
            featured: Boolean(data?.featured),
            section: data?.section ?? '',
            tags: Array.isArray(data?.tags) ? data.tags : [],
            time: data?.time ?? '',
            location: data?.location ?? '',
            status: data?.status
          } as Post;
        })
        .filter(post => post.slug !== slug)
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        .slice(0, limit);

      return posts;
    } catch (error) {
      console.error('Error getting related posts:', error);
      return [];
    }
  },

  async getPublishedPosts(category?: string, limitCount?: number): Promise<Post[]> {
    try {
      console.log('Service: Getting published posts, category:', category);
      const postsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [
        where('published', '==', true),
      ];

      if (category) {
        console.log('Service: Adding category constraint:', category);
        const categoryLower = category.toLowerCase();
        const possibleCategories = [
          category,
          category.charAt(0).toUpperCase() + category.slice(1),
          categoryLower,
          categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1),
          { id: category },
          { id: category, name: category },
          { id: categoryLower },
          { id: categoryLower, name: categoryLower },
          { id: category.charAt(0).toUpperCase() + category.slice(1) },
          { id: category.charAt(0).toUpperCase() + category.slice(1), name: category.charAt(0).toUpperCase() + category.slice(1) }
        ];
        constraints.push(where('category', 'in', possibleCategories));
      }

      const q = query(postsRef, ...constraints);
      const querySnapshot = await getDocs(q);
      console.log('Service: Query returned', querySnapshot.size, 'documents');

      let posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: typeof data.category === 'string'
            ? { id: data.category, name: data.category }
            : data.category || { id: '', name: '' },
          date: data?.date ? toTimestamp(data.date) : Timestamp.now(),
          createdAt: toTimestamp(data.createdAt),
          updatedAt: toTimestamp(data.updatedAt),
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

      // Sort by creation date (newest first)
      posts = posts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      const result = limitCount ? posts.slice(0, limitCount) : posts;
      console.log('Service: Returning', result.length, 'published posts');
      return result;
    } catch (error) {
      console.error('Error getting published posts:', error);
      return [];
    }
  },

  async getAllNews(): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category.id', '==', 'news'),
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const category = data.category || {};
        const now = Timestamp.now();

        return {
          id: doc.id,
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: typeof category === 'string' ? category : category.id,
            name: typeof category === 'string' ? category.charAt(0).toUpperCase() + category.slice(1) : category.name,
            slug: category.slug,
            type: category.type,
            createdAt: category.createdAt ? toTimestamp(category.createdAt) : now,
            updatedAt: category.updatedAt ? toTimestamp(category.updatedAt) : now
          },
          published: Boolean(data?.published),
          sticky: Boolean(data?.sticky),
          authorId: data?.authorId ?? '',
          authorEmail: data?.authorEmail ?? '',
          date: toTimestamp(data?.date),
          createdAt: toTimestamp(data.createdAt),
          updatedAt: toTimestamp(data.updatedAt),
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

      return posts.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  },

  async getAllPosts(): Promise<Post[]> {
    const snapshot = await getDocs(
      query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc')
      )
    );

    const posts = snapshot.docs.map(doc => normalizeTimestamps({
      id: doc.id,
      ...doc.data()
    }) as Post);

    return sortByDate(posts);
  },

  // Helper function to normalize post date
  normalizeDate(date: any): Timestamp {
    return toTimestamp(date);
  },

  // Remove getUpcomingEvents and getAllNews methods as they're no longer needed
};
