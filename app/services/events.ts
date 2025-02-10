import { db } from '@/lib/firebase';
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
      console.log('Events Service: Getting upcoming events');
      const postsRef = collection(db, COLLECTION_NAME);
      // Match all possible category formats for events
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
      console.log('Events Service: Found', querySnapshot.size, 'events');

      let events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Events Service: Processing event:', data.title);
        return {
          id: doc.id,
          ...data,
          category: typeof data.category === 'string'
            ? { id: 'events', name: 'Events' }
            : data.category || { id: 'events', name: 'Events' },
          date: data.date || new Date().toISOString(),
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

      // Filter future events and sort by date
      const now = new Date();
      console.log('Events Service: Filtering events from', now);
      events = events
        .filter(event => {
          try {
            const eventDate = new Date(event.date);
            const isValid = !isNaN(eventDate.getTime()) && eventDate >= now;
            console.log('Events Service: Event date check:', event.title, eventDate, isValid);
            return isValid;
          } catch (e) {
            console.error('Events Service: Invalid date for event:', event.title, event.date);
            return false;
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      console.log('Events Service: Returning', events.length, 'upcoming events');
      return limit ? events.slice(0, limit) : events;
    } catch (error) {
      console.error('Events Service: Error getting upcoming events:', error);
      return [];
    }
  },

  async getAllEvents(includePastEvents = false): Promise<Post[]> {
    try {
      console.log('Events Service: Getting all events');
      const postsRef = collection(db, COLLECTION_NAME);
      // Match all possible category formats for events
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
      console.log('Events Service: Found', querySnapshot.size, 'events');

      let events = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          category: typeof data.category === 'string'
            ? { id: 'events', name: 'Events' }
            : data.category || { id: 'events', name: 'Events' },
          date: data.date || new Date().toISOString(),
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
        const now = new Date();
        console.log('Events Service: Filtering out past events');
        events = events
          .filter(event => {
            try {
              const eventDate = new Date(event.date);
              return !isNaN(eventDate.getTime()) && eventDate >= now;
            } catch (e) {
              console.error('Events Service: Invalid date for event:', event.title, event.date);
              return false;
            }
          });
      }

      events = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log('Events Service: Returning', events.length, 'events');
      return events;
    } catch (error) {
      console.error('Events Service: Error getting all events:', error);
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
      const createdAt = data.createdAt;
      const updatedAt = data.updatedAt;

      return {
        id: doc.id,
        ...data,
        createdAt: createdAt instanceof Timestamp ? createdAt.toMillis() :
          typeof createdAt === 'number' ? createdAt : Date.now(),
        updatedAt: updatedAt instanceof Timestamp ? updatedAt.toMillis() :
          typeof updatedAt === 'number' ? updatedAt : Date.now(),
      } as Post;
    } catch (error) {
      console.error('Error getting event by slug:', error);
      return null;
    }
  },

  async createEvent(event: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const now = serverTimestamp();
    const eventData = {
      ...event,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);

    return {
      id: docRef.id,
      ...event,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as Post;
  },

  async updateEvent(id: string, event: Partial<Post>): Promise<boolean> {
    try {
      const eventRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(eventRef, {
        ...event,
        updatedAt: serverTimestamp()
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
