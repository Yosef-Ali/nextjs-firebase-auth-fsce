import { db } from '@/lib/firebase/index';
import { Post } from '@/app/types/post';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

class NewsService {
  private collectionName = 'posts';

  async getLatestNews(count: number = 5, includeUnpublished: boolean = false): Promise<Post[]> {
    try {
      // Simple query with just the collection
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
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
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
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

      // Filter and sort in memory
      return posts
        .filter(post => post.category && typeof post.category !== 'string' && post.category.id === 'news' && (includeUnpublished || post.published))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, count);
    } catch (error) {
      console.error('Error getting news:', error);
      return [];
    }
  }

  async getAllPosts(includeUnpublished: boolean = false): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
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
            id: category.id ?? category ?? '',
            name: category.name ?? category ?? ''
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

      // Sort in memory
      return posts
        .filter(post => post.category && typeof post.category !== 'string' && post.category.id === 'news' && (includeUnpublished || post.published))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error getting all posts:', error);
      return [];
    }
  }
}

export const newsService = new NewsService();
