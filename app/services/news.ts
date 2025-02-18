import { Post } from '@/types/post';
import { db } from '@/lib/firebase';
import { getDocs, query, collection, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

const toTimestamp = (date: Date | number | any): number => {
  if (typeof date === 'number') return date;
  if (date instanceof Date) return date.getTime();
  if (date?.toDate instanceof Function) return date.toDate().getTime();
  return Date.now();
};

function sortByDate(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

export const newsService = {
  getLatestNews: async (): Promise<Post[]> => {
    const snapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('category.type', '==', 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      )
    );
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: toTimestamp(data.date),
        createdAt: toTimestamp(data.createdAt),
        updatedAt: toTimestamp(data.updatedAt)
      } as Post;
    });
  },

  getAllNews: async (): Promise<Post[]> => {
    const snapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('category.type', '==', 'news'),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      )
    );
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      const now = Date.now();
      return {
        id: doc.id,
        ...data,
        date: toTimestamp(data.date || now),
        createdAt: toTimestamp(data.createdAt || now),
        updatedAt: toTimestamp(data.updatedAt || now),
        category: {
          ...data.category,
          createdAt: toTimestamp(data.category?.createdAt || now),
          updatedAt: toTimestamp(data.category?.updatedAt || now)
        }
      } as Post;
    });
    return sortByDate(posts);
  },

  createNews: async (newsData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> => {
    const now = Date.now();
    const data = {
      ...newsData,
      createdAt: Timestamp.fromMillis(now),
      updatedAt: Timestamp.fromMillis(now)
    };
    const docRef = await addDoc(collection(db, 'posts'), data);
    return {
      id: docRef.id,
      ...newsData,
      createdAt: now,
      updatedAt: now
    } as Post;
  },

  updateNews: async (id: string, data: Partial<Post>): Promise<void> => {
    const now = Date.now();
    const updateData = {
      ...data,
      updatedAt: Timestamp.fromMillis(now)
    };
    await updateDoc(doc(db, 'posts', id), updateData);
  }
};
