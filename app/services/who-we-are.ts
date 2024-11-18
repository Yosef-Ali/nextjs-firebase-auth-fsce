import { db } from '@/app/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { AboutContent } from '@/app/types/about';

class WhoWeAreService {
  private collectionName = 'about';

  async getAboutContent(): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as AboutContent[];
    } catch (error) {
      console.error('Error getting about content:', error);
      throw error;
    }
  }

  async getContentBySection(section: string): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('section', '==', section),
        where('published', '==', true),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : Date.now(),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : Date.now(),
      })) as AboutContent[];
    } catch (error) {
      console.error('Error getting section content:', error);
      throw error;
    }
  }
}

export const whoWeAreService = new WhoWeAreService();
