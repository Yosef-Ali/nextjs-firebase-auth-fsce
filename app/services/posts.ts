import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { Post } from '@/app/types/post';

const COLLECTION_NAME = 'posts';

const normalizeTimestamp = (timestamp: Timestamp | number | Date | null | undefined): number => {
  try {
    if (timestamp instanceof Timestamp) {
      return timestamp.toMillis();
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    if (typeof timestamp === 'number') {
      return timestamp;
    }
    return Date.now();
  } catch (error) {
    console.warn('Error normalizing timestamp:', error);
    return Date.now();
  }
};

const normalizePost = (doc: QueryDocumentSnapshot): Post => {
  try {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title ?? '',
      content: data.content ?? '',
      excerpt: data.excerpt ?? '',
      slug: data.slug ?? '',
      status: data.status ?? 'draft',
      category: data.category ?? '',
      createdAt: normalizeTimestamp(data.createdAt),
      updatedAt: normalizeTimestamp(data.updatedAt),
      authorId: data.authorId ?? '',
      authorEmail: data.authorEmail ?? '',
      authorName: data.authorName ?? '',
      published: Boolean(data.published),
      sticky: Boolean(data.sticky),
      featured: Boolean(data.featured),
      coverImage: data.coverImage ?? '',
      images: Array.isArray(data.images) ? data.images : [],
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  } catch (error) {
    console.error('Error normalizing post:', error);
    // Return a minimal valid post object
    return {
      id: doc.id,
      title: 'Error loading post',
      content: '',
      excerpt: '',
      slug: '',
      status: 'draft',
      category: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      authorId: '',
      authorEmail: '',
      authorName: '',
      published: false,
      sticky: false,
      featured: false,
      coverImage: '',
      images: [],
      tags: []
    };
  }
};

export const postsService = {
  async getUserPosts(userId: string): Promise<Post[]> {
    if (!userId) {
      console.warn('getUserPosts called without userId');
      return [];
    }

    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('authorId', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No posts found for user:', userId);
        return [];
      }

      const posts = querySnapshot.docs.map(doc => {
        try {
          return normalizePost(doc);
        } catch (error) {
          console.error('Error processing post document:', error);
          return null;
        }
      }).filter((post): post is Post => post !== null);

      // Sort in memory by createdAt descending
      return posts.sort((a, b) => b.createdAt - a.createdAt);

    } catch (error) {
      if (error instanceof FirestoreError) {
        console.error(`Firestore error (${error.code}):`, error.message);
        throw new Error(`Database error: ${error.message}`);
      }

      console.error('Error fetching user posts:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to fetch user posts'
      );
    }
  }
};
