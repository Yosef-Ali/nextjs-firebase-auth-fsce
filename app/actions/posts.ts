import { doc, collection, getDocs, query, where, orderBy, updateDoc, Timestamp } from 'firebase/firestore';
import { Category } from '@/app/types/category';
import { Event, Post } from '@/app/types/post';
import { db } from '@/lib/firebase';
import { toTimestamp, compareTimestamps, toDate } from '@/app/utils/date';

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

// Sort posts by creation date (newest first)
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => compareTimestamps(toDate(a.createdAt), toDate(b.createdAt)));
}

// Helper to normalize post data
export function normalizePost(data: any, id?: string): Post {
  const now = Timestamp.now();
  const post = {
    id: id || data.id || '',
    title: data?.title || '',
    slug: data?.slug || '',
    excerpt: data?.excerpt || '',
    content: data?.content || '',
    category: normalizeCategory(data?.category),
    published: Boolean(data?.published),
    authorId: data?.authorId || '',
    authorEmail: data?.authorEmail || '',
    sticky: Boolean(data?.sticky),
    featured: Boolean(data?.featured),
    section: data?.section || '',
    coverImage: data?.coverImage || '',
    images: Array.isArray(data?.images) ? data.images : [],
    tags: Array.isArray(data?.tags) ? data.tags : [],
    date: toTimestamp(data?.date || now) as Timestamp,
    createdAt: toTimestamp(data?.createdAt || now) as Timestamp,
    updatedAt: toTimestamp(data?.updatedAt || now) as Timestamp
  };

  if ('time' in data || 'location' in data) {
    return {
      ...post,
      time: data?.time || '',
      location: data?.location || ''
    } as Event;
  }

  return post;
}

// Helper to normalize category data
function normalizeCategory(category: string | Category | undefined): Category {
  if (!category) {
    return {
      id: '',
      name: '',
      slug: '',
      type: 'post',
      featured: false,
      description: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  if (typeof category === 'string') {
    return {
      id: category,
      name: category,
      slug: category.toLowerCase(),
      type: 'post',
      featured: false,
      description: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
  }

  return {
    ...category,
    createdAt: toTimestamp(category.createdAt),
    updatedAt: toTimestamp(category.updatedAt)
  };
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  try {
    console.log('Getting posts with options:', options);
    const postsRef = collection(db, 'posts');

    // Get all posts first
    const querySnapshot = await getDocs(postsRef);
    console.log('Total documents:', querySnapshot.size);

    // Then filter in memory
    let posts = querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));

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

    posts = sortPosts(posts);

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
    const post = normalizePost(data, doc.id);

    return post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}

// Get published posts
export async function getPublishedPosts(): Promise<Post[]> {
  const postsRef = collection(db, 'posts');
  const q = query(
    postsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => normalizePost(doc.data(), doc.id));
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

// Update post sticky status
export async function updatePostSticky(postId: string, sticky: boolean): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    sticky,
    updatedAt: Timestamp.now()
  });
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
        posts = posts.concat(specialSnapshot.docs.map(doc => normalizePost(doc.data(), doc.id)));
      }

      // Remove duplicates by ID
      const uniquePosts = Array.from(
        new Map(posts.map(post => [post.id, {
          ...post,
          category: normalizeCategory(post.category)
        }])).values()
      );

      // Sort by creation date (newest first) and apply limit if specified
      const sortedPosts = uniquePosts.sort((a, b) => {
        const dateA = typeof a.createdAt === 'number' ? a.createdAt : new Date().getTime();
        const dateB = typeof b.createdAt === 'number' ? b.createdAt : new Date().getTime();
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
      const categoryId = typeof post.category === 'string'
        ? post.category
        : post.category.id;
      return categoryId.toLowerCase() === searchCategory.toLowerCase();
    });
  }
}
