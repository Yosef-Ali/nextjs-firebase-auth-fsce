import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { Post } from '@/app/types/post';

interface GetPostsOptions {
  category?: string;
  tag?: string;
  limit?: number;
  published?: boolean;
}

export async function getPosts(options: GetPostsOptions = {}): Promise<Post[]> {
  try {
    const postsRef = collection(db, 'posts');
    const constraints: any[] = [];

    if (options.category) {
      constraints.push(where('category', '==', options.category));
    }

    if (options.tag) {
      constraints.push(where('tags', 'array-contains', options.tag));
    }

    if (options.published !== undefined) {
      constraints.push(where('published', '==', options.published));
    }

    // Always order by createdAt in descending order (newest first)
    constraints.push(orderBy('createdAt', 'desc'));

    if (options.limit) {
      constraints.push(limit(options.limit));
    }

    const q = query(postsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const posts: Post[] = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt,
        updatedAt: doc.data().updatedAt,
      } as Post);
    });

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt,
      updatedAt: doc.data().updatedAt,
    } as Post;
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    throw error;
  }
}

export async function getRecentPosts(count: number = 3): Promise<Post[]> {
  return getPosts({ limit: count, published: true });
}

export async function getPostsByCategory(category: string): Promise<Post[]> {
  return getPosts({ category, published: true });
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  return getPosts({ tag, published: true });
}
