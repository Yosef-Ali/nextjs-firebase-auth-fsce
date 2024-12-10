import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit, orderBy, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Post } from '@/app/types/post';

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

class EventsService {
  private collectionName = 'posts';

  async getAllEvents(includeUnpublished = false, includePastEvents = false): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Filter and sort in memory
      return posts
        .filter(post => {
          const eventDate = new Date(post.date);
          return post.category === 'events' &&
            (includeUnpublished || post.published) &&
            (includePastEvents || eventDate >= new Date());
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5); // Apply limit in memory
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async getUpcomingEvents(count: number = 3, includeUnpublished = false): Promise<Post[]> {
    try {
      const q = query(
        collection(db, this.collectionName)
      );

      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Post));

      // Filter and sort in memory
      return posts
        .filter(post => {
          const eventDate = new Date(post.date);
          return post.category === 'events' &&
            (includeUnpublished || post.published) &&
            eventDate >= new Date();
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, count);
    } catch (error) {
      console.error('Error getting upcoming events:', error);
      return [];
    }
  }

  async getEventBySlug(slug: string): Promise<Post | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('slug', '==', slug),
        where('category', '==', 'events')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Post;
    } catch (error) {
      console.error('Error getting event by slug:', error);
      return null;
    }
  }

  async createEvent(data: Partial<Post>): Promise<string> {
    try {
      const eventData = {
        ...data,
        category: 'events',
        slug: generateSlug(data.title || ''),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.collectionName), eventData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, data: Partial<Post>): Promise<void> {
    try {
      const eventRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: Timestamp.now()
      };
      await updateDoc(eventRef, updateData);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const eventRef = doc(db, this.collectionName, id);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
