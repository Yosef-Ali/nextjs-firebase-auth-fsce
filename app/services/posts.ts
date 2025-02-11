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
  getDoc,
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
          sticky: Boolean(data?.sticky),
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

  async getCategoryById(categoryId: string): Promise<Category | null> {
    try {
      const categoryDoc = await getDoc(doc(db, 'categories', categoryId));
      if (categoryDoc.exists()) {
        const data = categoryDoc.data();
        return {
          id: categoryId,
          name: data.name || categoryId
        };
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
      return {
        id: category,
        name: category
      };
    }
    return {
      id: category.id,
      name: category.name || category.id
    };
  },

  async createPost(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'category'> & { category: string | Category }): Promise<Post> {
    const normalizedCategory = await this.getNormalizedCategory(post.category);
    const now = Date.now();

    const postData = {
      ...post,
      sticky: post.sticky || false,
      category: normalizedCategory,
      createdAt: now,
      updatedAt: now
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
      sticky: post.sticky || false,
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
      createdAt: now,
      updatedAt: now
    };

    return newPost;
  },

  async updatePost(id: string, post: Partial<Omit<Post, 'category'>> & { category?: string | Category }, userId: string): Promise<boolean> {
    try {
      const postRef = doc(db, COLLECTION_NAME, id);
      const now = Date.now();

      // Create initial update data without category
      const { category, ...restData } = post;
      const baseUpdateData: Partial<Omit<Post, 'category'>> = {
        ...restData,
        // Only allow sticky posts if they are published
        sticky: restData.sticky && restData.published !== false ? restData.sticky : false,
        updatedAt: now
      };

      // Only add category if it exists
      if (category) {
        const normalizedCategory = await this.getNormalizedCategory(category);
        await updateDoc(postRef, {
          ...baseUpdateData,
          category: normalizedCategory
        });
      } else {
        await updateDoc(postRef, baseUpdateData);
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
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
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
          return normalizePost(doc.id, data, {
            id: 'child-protection',
            name: 'Child Protection'
          });
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
            return normalizePost(doc.id, data, {
              id: 'advocacy',
              name: 'Advocacy'
            });
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
        return normalizePost(doc.id, data, {
          id: category.toLowerCase(),
          name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        });
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
        return normalizePost(doc.id, data, {
          id: category.toLowerCase(),
          name: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        });
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
        return normalizePost(doc.id, data, {
          id: category.toLowerCase(),
          name: categoryName
        });
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
        sticky: Boolean(data?.sticky),
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

function normalizePost(id: string, data: any, category: Category): Post {
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
    date: data?.date ?? new Date().toISOString(),
    createdAt: data.createdAt instanceof Timestamp ?
      data.createdAt.toMillis() :
      typeof data.createdAt === 'number' ?
        data.createdAt :
        Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ?
      data.updatedAt.toMillis() :
      typeof data.updatedAt === 'number' ?
        data.updatedAt :
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
}
