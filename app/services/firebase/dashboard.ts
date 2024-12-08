import { db } from '../../../app/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from 'firebase/firestore';

const POSTS_PER_PAGE = 10;

export const dashboardService = {
  // Categories
  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Media
  async getMedia(lastDoc?: DocumentSnapshot) {
    try {
      let q = query(
        collection(db, 'media'),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        media,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
      };
    } catch (error) {
      console.error('Error getting media:', error);
      throw error;
    }
  },
};
