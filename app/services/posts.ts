import { db } from '@/lib/firebase';
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
  Timestamp,
  serverTimestamp,
  QueryConstraint,
  orderBy,
  FieldValue,
  setDoc
} from 'firebase/firestore';

// Helper function to create a complete Category object
function createCategory(id: string, name: string, type: CategoryType = 'post'): Category {
  const now = new Date();
  return {
    id,
    name,
    slug: id.toLowerCase(),
    type,
    featured: false, // Required by Category interface
    createdAt: now,
    updatedAt: now
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
        return normalizePost(doc.id, data, {
          id: typeof data.category === 'string' ? data.category : data.category?.id,
          name: typeof data.category === 'string' ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : data.category?.name,
          slug: data.category?.slug,
          type: data.category?.type || 'post',
          createdAt: data.category?.createdAt || Date.now(),
          updatedAt: data.category?.updatedAt || Date.now()
        });
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
      typeof category.createdAt === 'number' &&
      typeof category.updatedAt === 'number';
  },

  async createPost(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    try {
      const now = new Date();
      const id = crypto.randomUUID();

      const post: Post = {
        id,
        createdAt: now,
        updatedAt: now,
        ...data,
      };

      await setDoc(doc(db, 'posts', id), post);
      return post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    try {
      const now = new Date();
      const updateData = {
        ...data,
        updatedAt: now
      };

      await updateDoc(doc(db, 'posts', id), updateData);
      return { id, ...data, updatedAt: now } as Post;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
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
      const uniquePosts = Array.from(
        new Map(posts.map(post => [post.id, post])).values()
      );

      // Sort by creation date (newest first) and apply limit if specified
      const sortedPosts = uniquePosts.sort((a, b) => b.createdAt - a.createdAt);

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
      return normalizePost(doc.id, data, {
        id: typeof data.category === 'string' ? data.category : data.category?.id,
        name: typeof data.category === 'string' ? data.category.charAt(0).toUpperCase() + data.category.slice(1) : data.category?.name,
        slug: data.category?.slug,
        type: data.category?.type || 'post',
        createdAt: data.category?.createdAt || Date.now(),
        updatedAt: data.category?.updatedAt || Date.now()
      });
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
            date: data?.date ?? new Date().toISOString(),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() :
              typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() :
              typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
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
          date: data?.date ?? new Date().toISOString(),
          createdAt: data.createdAt instanceof Timestamp
            ? data.createdAt.toMillis()
            : typeof data.createdAt === 'number'
              ? data.createdAt
              : Date.now(),
          updatedAt: data.updatedAt instanceof Timestamp
            ? data.updatedAt.toMillis()
            : typeof data.updatedAt === 'number'
              ? data.updatedAt
              : Date.now(),
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
      posts = posts.sort((a, b) => b.createdAt - a.createdAt);

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
        const now = Date.now();

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
            createdAt: category.createdAt,
            updatedAt: category.updatedAt
          },
          published: Boolean(data?.published),
          sticky: Boolean(data?.sticky),
          authorId: data?.authorId ?? '',
          authorEmail: data?.authorEmail ?? '',
          date: this.normalizeDate(data?.date),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : typeof data.createdAt === 'number' ? data.createdAt : now,
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : typeof data.updatedAt === 'number' ? data.updatedAt : now,
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

      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  },

  // Helper function to normalize post date
  normalizeDate(date: any): number {
    if (typeof date === 'number') {
      return date;
    }
    if (date instanceof Date) {
      return date.getTime();
    }
    if (typeof date === 'string') {
      const parsed = Date.parse(date);
      return isNaN(parsed) ? Date.now() : parsed;
    }
    return Date.now();
  },

  // Remove getUpcomingEvents and getAllNews methods as they're no longer needed
};

function normalizePost(id: string, data: any, category: Category): Post {
  const now = Date.now();
  return {
    id,
    title: data?.title ?? '',
    content: data?.content ?? '',
    excerpt: data?.excerpt ?? '',
    slug: data?.slug ?? id,
    category: {
      ...category,
      featured: category.featured ?? false
    },
    published: Boolean(data?.published),
    sticky: Boolean(data?.sticky),
    authorId: data?.authorId ?? '',
    authorEmail: data?.authorEmail ?? '',
    date: postsService.normalizeDate(data?.date || now),
    createdAt: data.createdAt instanceof Timestamp ?
      data.createdAt.toMillis() :
      typeof data.createdAt === 'number' ?
        data.createdAt :
        now,
    updatedAt: data.updatedAt instanceof Timestamp ?
      data.updatedAt.toMillis() :
      typeof data.updatedAt === 'number' ?
        data.updatedAt :
        now,
    coverImage: data?.coverImage ?? '',
    images: Array.isArray(data?.images) ? data.images : [],
    featured: Boolean(data?.featured),
    section: data?.section ?? '',
    tags: Array.isArray(data?.tags) ? data.tags : [],
    time: data?.time ?? '',
    location: data?.location ?? '',
    status: data?.status ?? PostStatus.DRAFT
  } as Post;
}
