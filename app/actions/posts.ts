import { User } from 'firebase/auth'; // Import User type
import { authorization } from '@/lib/authorization';
import { doc, collection, getDocs, query, where, updateDoc, Timestamp } from 'firebase/firestore';
import { Category } from '@/app/types/category';
import { Event, Post, BasePost, NewsPost } from '@/app/types/post';
import { db } from '@/lib/firebase';
import { toTimestamp, compareTimestamps, toDate } from '@/app/utils/date';
import { optimizedQuery } from '@/app/utils/query-helpers';

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
  // Ensure category is always normalized to a Category object
  const normalizedCategory = normalizeCategory(data?.category);

  const post: BasePost = {
    id: id || data.id || '',
    title: data?.title || '',
    slug: data?.slug || '',
    excerpt: data?.excerpt || '',
    content: data?.content || '',
    category: normalizedCategory, // Always assign the Category object
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

  // Add check for NewsPost properties if they exist
  if ('source' in data || 'sourceUrl' in data) {
    return {
      ...post,
      source: data?.source || '',
      sourceUrl: data?.sourceUrl || ''
    } as NewsPost;
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

export async function getPosts(
  options: GetPostsOptions = {},
  currentUser: User | null = null // Accept currentUser as argument
): Promise<Post[]> {
  try {
    const isAdmin = await authorization.isAdmin(currentUser); // Add await

    console.log('Getting posts with options:', options, 'Is Admin:', isAdmin);
    const postsRef = collection(db, 'posts');

    const querySnapshot = await getDocs(postsRef);
    console.log('Total documents fetched:', querySnapshot.size);

    let posts = querySnapshot.docs.map(doc => normalizePost(doc.data(), doc.id));

    // Only filter by 'published' if the user is NOT an admin OR if the 'published' option is explicitly provided
    if (!isAdmin || options.published !== undefined) {
      const filterPublished = options.published === undefined ? true : options.published; // Default to published=true for non-admins
      posts = posts.filter(post => post.published === filterPublished);
      console.log(`Filtered by published: ${filterPublished}. Posts remaining: ${posts.length}`);
    } else {
      console.log('Admin user detected, skipping published filter unless explicitly requested.');
    }

    if (options.category) {
      posts = posts.filter(post => {
        const searchCategory = options.category?.toLowerCase();
        // Access id safely from the Category object (which is guaranteed by normalizePost)
        const categoryId = (post.category as Category)?.id?.toLowerCase() || '';
        return categoryId === searchCategory;
      });
      console.log(`Filtered by category: ${options.category}. Posts remaining: ${posts.length}`);
    }

    if (options.tag) {
      posts = posts.filter(post =>
        post.tags?.some(tag => tag.toLowerCase() === options.tag?.toLowerCase())
      );
      console.log(`Filtered by tag: ${options.tag}. Posts remaining: ${posts.length}`);
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

// Get published posts (no change needed, already filters by published: true)
export async function getPublishedPosts(): Promise<Post[]> {
  try {
    // Use the optimized query helper to avoid complex indexes
    const results = await optimizedQuery('posts', {
      published: true,
      sortBy: 'createdAt',
      sortDirection: 'desc'
    });

    // Normalize the results
    return results.map(doc => normalizePost(doc));
  } catch (error) {
    console.error('Error getting published posts:', error);
    return [];
  }
}

export async function getRecentPosts(count: number = 3, currentUser: User | null = null): Promise<Post[]> {
  console.log('Getting recent posts, count:', count);
  // Pass currentUser to getPosts
  const posts = await getPosts({ limit: count, published: true }, currentUser);
  console.log('Recent posts retrieved:', posts.length);
  return posts;
}

export async function getPostsByCategory(category: string, currentUser: User | null = null): Promise<Post[]> {
  console.log('Getting posts by category:', category);
  // Pass currentUser to getPosts
  const posts = await getPosts({ category, published: true }, currentUser);
  console.log(`Retrieved ${posts.length} posts for category:`, category);
  return posts;
}

export async function getPostsByTag(tag: string, currentUser: User | null = null): Promise<Post[]> {
  console.log('Getting posts by tag:', tag);
  // Pass currentUser to getPosts
  return getPosts({ tag, published: true }, currentUser);
}

// Update post sticky status
export async function updatePostSticky(
  postId: string,
  sticky: boolean,
  currentUser: User | null // Accept currentUser as argument
): Promise<void> {

  // Authorization Check: Only admins/editors should update sticky status
  // Add await to the authorization check
  if (!(await authorization.canEditPost(currentUser))) {
    console.error(`User ${currentUser?.uid} unauthorized to update sticky status for post ${postId}`);
    throw new Error('Unauthorized: You do not have permission to update sticky status.');
  }

  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    sticky,
    updatedAt: Timestamp.now()
  });
  console.log(`Post ${postId} sticky status updated to ${sticky} by user ${currentUser?.uid}`);
}

export const postsService = {
  async getPostsByCategory(category: string, limit?: number, currentUser: User | null = null): Promise<Post[]> {
    try {
      console.log('Service: Getting posts by category:', category);
      // Assuming getPosts is the primary fetch mechanism
      let posts = await getPosts({ category, published: true }, currentUser); // Pass currentUser

      // Apply limit after fetching (if needed, or adjust getPosts call)
      return limit ? posts.slice(0, limit) : posts;
    } catch (error) {
      console.error('Error getting posts by category:', error);
      return [];
    }
  },

  filterPostsByCategory(posts: Post[], searchCategory: string): Post[] {
    return posts.filter(post => {
      // Access id safely from the Category object (guaranteed by normalizePost)
      const categoryId = (post.category as Category)?.id?.toLowerCase() || '';
      return categoryId === searchCategory.toLowerCase();
    });
  }
}
