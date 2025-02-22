import { db } from '@/lib/firebase/index';
import { Post } from '@/app/types/post';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

export const eventsService = {
  async getUpcomingEvents(limit: number = 3): Promise<Post[]> {
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
          date: data.date || Date.now(),
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
        } as Post;
      });

      const now = Date.now();
      events = events
        .filter(event => event.date && event.date >= now)
        .sort((a, b) => (a.date || 0) - (b.date || 0));

      return limit ? events.slice(0, limit) : events;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
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
          date: data.date || Date.now(),
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
        } as Post;
      });

      if (!includePastEvents) {
        const now = Date.now();
        events = events.filter(event => event.date && event.date >= now);
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
        date: data.date || Date.now(),
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
      createdAt: now,
      updatedAt: now,
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
        updatedAt: now
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
