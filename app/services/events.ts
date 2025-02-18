import { Post } from '@/types/post';
import { db } from '@/lib/firebase';
import { getDocs, query, collection, where, orderBy, limit as firestoreLimit, Timestamp } from 'firebase/firestore';
import { addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

const toTimestamp = (date: Date | number | any): number => {
  if (typeof date === 'number') return date;
  if (date instanceof Date) return date.getTime();
  if (date?.toDate instanceof Function) return date.toDate().getTime();
  return Date.now();
};

export const eventsService = {
  getUpcomingEvents: async (): Promise<Post[]> => {
    const now = Date.now();
    const snapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('category.type', '==', 'event'),
        where('date', '>=', now),
        orderBy('date', 'asc'),
        firestoreLimit(3)
      )
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: toTimestamp(doc.data().date),
      createdAt: toTimestamp(doc.data().createdAt),
      updatedAt: toTimestamp(doc.data().updatedAt)
    } as Post));
  },

  getPastEvents: async (): Promise<Post[]> => {
    const now = Date.now();
    const snapshot = await getDocs(
      query(
        collection(db, 'posts'),
        where('category.type', '==', 'event'),
        where('date', '<', now),
        orderBy('date', 'desc')
      )
    );
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: toTimestamp(doc.data().date),
      createdAt: toTimestamp(doc.data().createdAt),
      updatedAt: toTimestamp(doc.data().updatedAt)
    } as Post));
  },

  async getAllEvents(includePastEvents = false): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTION_NAME);
      const q = query(
        postsRef,
        where('category', 'in', [
          'events',
          { id: 'events' },
          { id: 'events', name: 'Events' }
        ]),
        where('published', '==', true)
      );
      const querySnapshot = await getDocs(q);
      let events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: typeof data.category === 'string'
            ? { id: 'events', name: 'Events' }
            : data.category || { id: 'events', name: 'Events' },
          date: toTimestamp(data.date),
          createdAt: toTimestamp(data.createdAt),
          updatedAt: toTimestamp(data.updatedAt),
        } as Post;
      });

      if (!includePastEvents) {
        const now = Date.now();
        events = events.filter(event => event.date >= now);
      }

      events = events.sort((a, b) => (a.date || 0) - (b.date || 0));
      return events;
    } catch (error) {
      console.error('Error getting all events:', error);
      return [];
    }
  },

  async getEventBySlug(slug: string): Promise<Post | null> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(eventsRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: toTimestamp(data.date),
        createdAt: toTimestamp(data.createdAt),
        updatedAt: toTimestamp(data.updatedAt),
      } as Post;
    } catch (error) {
      console.error('Error getting event by slug:', error);
      return null;
    }
  },

  async createEvent(event: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = Date.now();
    const eventData = {
      ...event,
      createdAt: Timestamp.fromMillis(now),
      updatedAt: Timestamp.fromMillis(now),
      date: event.date || now
    };
    const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);
    return {
      id: docRef.id,
      ...event,
      createdAt: now,
      updatedAt: now,
      date: event.date || now
    } as Post;
  },

  async updateEvent(id: string, event: Partial<Post>): Promise<boolean> {
    try {
      const now = Date.now();
      const eventRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(eventRef, {
        ...event,
        updatedAt: Timestamp.fromMillis(now)
      });
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, eventId));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }
};
