import { db } from '@/lib/firebase';
import { Post, Category, PostStatus } from '@/app/types/post';
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
  FieldValue
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
            id: typeof category === 'string'
              ? category
              : typeof category === 'object' && category?.id
                ? category.id
                : '',
            name: typeof category === 'string'
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : typeof category === 'object' && category?.name
                ? category.name
                : ''
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

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'category'> & { category: string | Category }): Promise<Post> {
    const now = serverTimestamp();

    // Normalize category to proper Category object
    const normalizedCategory: Category = {
      id: typeof post.category === 'string'
        ? post.category
        : typeof post.category === 'object' && post.category?.id
          ? post.category.id
          : '',
      name: typeof post.category === 'string'
        ? post.category.charAt(0).toUpperCase() + post.category.slice(1)
        : typeof post.category === 'object' && post.category?.name
          ? post.category.name
          : ''
    };

    const postData = {
      ...post,
      category: normalizedCategory,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), postData);

    const newPost: Post = {
      id: docRef.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      category: normalizedCategory,
      published: post.published || false,
      authorId: post.authorId || '',
      authorEmail: post.authorEmail || '',
      date: post.date || '',
      featured: post.featured || false,
      coverImage: post.coverImage,
      images: post.images || [],
      section: post.section,
      tags: post.tags || [],
      time: post.time,
      location: post.location,
      status: post.status as PostStatus,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return newPost;
  },

  async updatePost(id: string, post: Partial<Omit<Post, 'category'>> & { category?: string | Category }, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const updateData: Partial<Post> & { updatedAt: FieldValue } = {
        ...post,
        updatedAt: serverTimestamp()
      };

      if (post.category) {
        const category = post.category;
        updateData.category = {
          id: typeof category === 'string'
            ? category
            : typeof category === 'object' && category?.id
              ? category.id
              : '',
          name: typeof category === 'string'
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : typeof category === 'object' && category?.name
              ? category.name
              : ''
        } as Category;
      }

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
      console.log('Service: Getting posts by category:', category);
      const postsRef = collection(db, COLLECTION_NAME);
      const constraints: QueryConstraint[] = [
        where('published', '==', true)
      ];

      // Normalize the category name to handle various cases
      const categoryLower = category.toLowerCase();
      const possibleCategories = [
        // Original format
        category,
        // Capitalized format
        category.charAt(0).toUpperCase() + category.slice(1),
        // All lowercase
        categoryLower,
        // All uppercase first letter
        categoryLower.charAt(0).toUpperCase() + categoryLower.slice(1),
        // Object formats
        { id: category },
        { id: category, name: category },
        { id: categoryLower },
        { id: categoryLower, name: categoryLower },
        { id: category.charAt(0).toUpperCase() + category.slice(1) },
        { id: category.charAt(0).toUpperCase() + category.slice(1), name: category.charAt(0).toUpperCase() + category.slice(1) }
      ];
      
      constraints.push(where('category', 'in', possibleCategories));

      const q = query(postsRef, ...constraints);
      console.log('Service: Executing query for category:', category);
      const querySnapshot = await getDocs(q);
      console.log('Service: Found', querySnapshot.size, 'documents');

      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Service: Processing document:', doc.id, data);
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

      const sortedPosts = posts.sort((a, b) => b.createdAt - a.createdAt);
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
          id: typeof category === 'string'
            ? category
            : typeof category === 'object' && category?.id
              ? category.id
              : '',
          name: typeof category === 'string'
            ? category.charAt(0).toUpperCase() + category.slice(1)
            : typeof category === 'object' && category?.name
              ? category.name
              : ''
        },
        published: Boolean(data?.published),
        authorId: data?.authorId ?? '',
        authorEmail: data?.authorEmail ?? '',
        date: data?.date ?? new Date().toISOString(),
        createdAt: createdAt instanceof Timestamp ? createdAt.toMillis() :
          typeof createdAt === 'number' ? createdAt : Date.now(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toMillis() :
          typeof updatedAt === 'number' ? updatedAt : Date.now(),
        coverImage: data?.coverImage ?? '',
        images: Array.isArray(data?.images) ? data.images : [],
        featured: Boolean(data?.featured),
        section: data?.section ?? '',
        tags: Array.isArray(data?.tags) ? data.tags : [],
        time: data?.time ?? '',
        location: data?.location ?? '',
        status: data?.status
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
            title: data?.title ?? '',
            content: data?.content ?? '',
            excerpt: data?.excerpt ?? '',
            slug: data?.slug ?? doc.id,
            category: typeof data.category === 'string'
              ? { id: data.category, name: data.category }
              : data.category || { id: '', name: '' },
            published: Boolean(data?.published),
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
          title: data?.title ?? '',
          content: data?.content ?? '',
          excerpt: data?.excerpt ?? '',
          slug: data?.slug ?? doc.id,
          category: {
            id: typeof category === 'string'
              ? category
              : typeof category === 'object' && category?.id
                ? category.id
                : '',
            name: typeof category === 'string'
              ? category.charAt(0).toUpperCase() + category.slice(1)
              : typeof category === 'object' && category?.name
                ? category.name
                : ''
          },
          published: Boolean(data?.published),
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
      });

      // Sort in memory instead of in query
      return posts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  },

  // Remove getUpcomingEvents and getAllNews methods as they're no longer needed
};
