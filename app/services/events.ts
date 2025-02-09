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
  getDoc,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';

const COLLECTION_NAME = 'events';

export const eventsService = {
  async getUpcomingEvents(limit: number = 3): Promise<Post[]> {
    try {
      const now = Timestamp.now();
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef,
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const postDate = data.date instanceof Timestamp ? data.date : 
                         typeof data.date === 'string' ? Timestamp.fromDate(new Date(data.date)) :
                         typeof data.date === 'number' ? Timestamp.fromMillis(data.date) :
                         now;
          
          return {
            id: doc.id,
            ...data,
            date: postDate instanceof Timestamp ? postDate.toDate().toISOString() : new Date().toISOString(),
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                      typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                      typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          } as Post;
        })
        .filter(event => {
          try {
            return new Date(event.date) >= new Date();
          } catch (e) {
            console.error('Invalid date format:', event.date);
            return false;
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, limit);

      return events;
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  },

  async getAllEvents(includePastEvents = false): Promise<Post[]> {
    try {
      const eventsRef = collection(db, COLLECTION_NAME);
      const q = query(
        eventsRef,
        where('published', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : 
                      typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : 
                      typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          } as Post;
        })
        .filter(event => {
          if (includePastEvents) return true;
          try {
            return new Date(event.date) >= new Date();
          } catch (e) {
            console.error('Invalid date format:', event.date);
            return false;
          }
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
