import { db } from '@/app/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { AboutContent } from '@/app/types/about';

class WhoWeAreService {
  private readonly collectionName = 'posts';
  private readonly category = 'about';

  private convertTimestamp(timestamp: Timestamp | number | null | undefined): number {
    if (timestamp instanceof Timestamp) {
      return timestamp.toMillis();
    }
    return timestamp || Date.now();
  }

  private documentToAboutContent(doc: QueryDocumentSnapshot<DocumentData>): AboutContent {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt),
    } as AboutContent;
  }

  async getAboutContent(): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('published', '==', true),
        where('category', '==', this.category)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => this.documentToAboutContent(doc));
      
      if (documents.length === 0) {
        console.log('No about content available. Please check the database for posts with category about and status published.');
      }
      
      return documents.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching about content:', error);
      throw error;
    }
  }

  async getContentBySection(section: string): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('published', '==', true),
        where('category', '==', this.category),
        where('section', '==', section)
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => this.documentToAboutContent(doc));
      
      return documents.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error fetching content by section:', error);
      throw error;
    }
  }

  async getContentById(id: string): Promise<AboutContent | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.log('No about content available. Please check the database for posts with category about and status published.');
        return null;
      }

      return this.documentToAboutContent(docSnap as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      throw error;
    }
  }
}

export const whoWeAreService = new WhoWeAreService();
