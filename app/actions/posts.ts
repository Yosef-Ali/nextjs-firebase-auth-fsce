import { collection, getDocs, query, where, Timestamp, QueryConstraint } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Post } from '@/app/types/post';
import { Category } from '@/app/types/category';
import { ensureCategory, getCategoryId } from '@/app/utils/category';

const COLLECTION_NAME = 'posts';

const isEventCategory = (category: any): boolean => {
  if (!category) return false;

  // Check string format
  if (typeof category === 'string') {
    const lowerCategory = category.toLowerCase();
    return lowerCategory === 'events' || lowerCategory === 'event';
  }

  // Check object format
  if (typeof category === 'object') {
    const id = category.id?.toLowerCase();
    const name = category.name?.toLowerCase();
    return (id === 'events' || id === 'event') || (name === 'events' || name === 'event');
  }

  return false;
};

interface GetPostsOptions {
  category?: string;
  tag?: string;
  limit?: number;
  published?: boolean;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  try {
    console.log('Getting posts with options:', options);
    const postsRef = collection(db, 'posts');

    // Get all posts first
    const querySnapshot = await getDocs(postsRef);
    console.log('Total documents:', querySnapshot.size);

    // Then filter in memory
    let posts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const category = data.category || {};

      // Normalize category to correct format
      // Use ensureCategory helper which handles all required Category fields
      const normalizedCategory = ensureCategory(
        typeof category === 'string' ? category : category.id || ''
      );

      const post: Post = {
        id: doc.id,
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: normalizedCategory,
        published: data.published || false,
        authorId: data.authorId || '',
        authorEmail: data.authorEmail || '',
        sticky: data.sticky || false,
        featured: data.featured || false,
        section: data.section,
        coverImage: data.coverImage,
        images: data.images || [],
        tags: data.tags || [],
        time: data.time,
        location: data.location,
        status: data.status,
        date: data.date,
        createdAt: data.createdAt instanceof Timestamp
          ? data.createdAt.toMillis()
          : typeof data.createdAt === 'number'
            ? data.createdAt
            : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp
          ? data.updatedAt.toMillis()
          : typeof data.updatedAt === 'number'
            ? data.updatedAt
            : Date.now()
      };
      return post;
    });

    // Apply filters in memory
    if (options.published !== undefined) {
      posts = posts.filter(post => post.published === options.published);
    }

    if (options.category) {
      posts = posts.filter(post => {
        const searchCategory = options.category?.toLowerCase();
        const categoryId = typeof post.category === 'string'
          ? post.category.toLowerCase()
          : post.category.id.toLowerCase();
        return categoryId === searchCategory;
      });
    }

    if (options.tag) {
      posts = posts.filter(post =>
        post.tags?.some(tag => tag.toLowerCase() === options.tag?.toLowerCase())
      );
    }

    posts = posts.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt;
      return dateB - dateA;
    });

    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }

    console.log('Final filtered posts:', posts.length);
    return posts;
  } catch (error) {
    console.error('Error getting posts:', error);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    // Use ensureCategory helper for consistent category normalization
    const category = ensureCategory(data.category || '');

    const post: Post = {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || '',
      content: data.content,
      category,
      published: data.published || false,
      authorId: data.authorId || '',
      authorEmail: data.authorEmail || '',
      sticky: data.sticky || false,
      date: data.date || '',
      featured: data.featured || false,
      coverImage: data.coverImage,
      images: data.images || [],
      section: data.section,
      tags: data.tags || [],
      time: data.time,
      location: data.location,
      status: data.status,
      createdAt: data.createdAt instanceof Timestamp
        ? data.createdAt.toMillis()
        : typeof data.createdAt === 'number'
          ? data.createdAt
          : Date.now(),
      updatedAt: data.updatedAt instanceof Timestamp
        ? data.updatedAt.toMillis()
        : typeof data.updatedAt === 'number'
          ? data.updatedAt
          : Date.now()
    };

    return post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}

export async function getRecentPosts(count: number = 3): Promise<Post[]> {
  console.log('Getting recent posts, count:', count);
  const posts = await getPosts({
    limit: count,
    published: true
  });
  console.log('Recent posts retrieved:', posts.length);
  return posts;
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  console.log('Getting posts by category:', category);
  const posts = await getPosts({
    category,
    published: true
  });
  console.log(`Retrieved ${posts.length} posts for category:`, category);
  return posts;
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  console.log('Getting posts by tag:', tag);
  return getPosts({ tag, published: true });
}

export const postsService = {
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
          const post: Post = {
            id: doc.id,
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            category: ensureCategory('child-protection'),
            published: data.published || false,
            authorId: data.authorId || '',
            authorEmail: data.authorEmail || '',
            sticky: data.sticky || false,
            featured: data.featured || false,
            section: data.section,
            coverImage: data.coverImage,
            images: data.images || [],
            tags: data.tags || [],
            time: data.time,
            location: data.location,
            status: data.status,
            date: data.date,
            createdAt: data.createdAt || Date.now(),
            updatedAt: data.updatedAt || Date.now()
          };
          return post;
        }));
      }

      // Remove duplicates by ID
      const uniquePosts = Array.from(
        new Map(posts.map(post => [post.id, {
          ...post,
          category: ensureCategory(post.category)
        }])).values()
      );

      // Sort by creation date (newest first) and apply limit if specified
      const sortedPosts = uniquePosts.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt;
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt;
        return dateB - dateA;
      });

      return limit ? sortedPosts.slice(0, limit) : sortedPosts;
    } catch (error) {
      console.error('Error getting posts by category:', error);
      return [];
    }
  },

  filterPostsByCategory(posts: Post[], searchCategory: string): Post[] {
    return posts.filter(post => {
      const categoryId = getCategoryId(post.category);
      return categoryId.toLowerCase() === searchCategory.toLowerCase();
    });
  }
}
