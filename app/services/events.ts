import { db } from '@/lib/firebase';
import { Post } from '@/app/types/post';
import { collection, getDocs, query, where, orderBy, Timestamp, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
        .filter(post => {
          const eventDate = new Date(post.date);
          return post.category?.id === 'events' &&
            (includeUnpublished || post.published) &&
            (includePastEvents || eventDate >= new Date());
        })
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 5);
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
        .filter(post => {
          const eventDate = new Date(post.date);
          return post.category?.id === 'events' &&
            (includeUnpublished || post.published) &&
            eventDate >= new Date();
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
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
        where('category.id', '==', 'events')
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
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
    } catch (error) {
      console.error('Error getting event by slug:', error);
      return null;
    }
  }

  async createEvent(data: Partial<Post>): Promise<string> {
    try {
      const eventData = {
        ...data,
        category: {
          id: 'events',
          name: 'Events'
        },
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
      await updateDoc(eventRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
