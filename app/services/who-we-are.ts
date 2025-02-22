import { db } from '@/lib/firebase/index';
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
    console.log('Converting document:', {
      id: doc.id,
      data: {
        title: data.title,
        section: data.section,
        content: data.content,
        category: data.category,
        published: data.published
      }
    });

    return {
      id: doc.id,
      title: data.title,
      content: data.content,
      section: data.section,
      published: data.published,
      category: data.category,
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || '',
      images: data.images || [],
      authorId: data.authorId || 'system',
      authorEmail: data.authorEmail || 'system@fsce.org',
      slug: data.slug || '',
      createdAt: this.convertTimestamp(data.createdAt),
      updatedAt: this.convertTimestamp(data.updatedAt)
    };
  }

  async getAboutContent(): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, 'about'),
        where('section', 'in', ['vision', 'mission', 'values'])
      );

      const querySnapshot = await getDocs(q);
      const aboutData: AboutContent[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AboutContent));

      return aboutData;
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

      if (docSnap.exists()) {
        return this.documentToAboutContent(docSnap as any);
      }

      return null;
    } catch (error) {
      console.error('Error fetching content by id:', error);
      throw error;
    }
  }

  async getVisionMissionContent(): Promise<AboutContent[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('published', '==', true),
        where('category', '==', this.category),
        where('section', 'in', ['vision', 'mission', 'core-values'])
      );

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => this.documentToAboutContent(doc));
      
      if (documents.length === 0) {
        console.log('No vision/mission content available.');
      }
      
      return documents.sort((a, b) => {
        // Custom sort order for sections
        const order = { vision: 1, mission: 2, 'core-values': 3 };
        return order[a.section as keyof typeof order] - order[b.section as keyof typeof order];
      });
    } catch (error) {
      console.error('Error fetching vision/mission content:', error);
      throw error;
    }
  }
}

export const whoWeAreService = new WhoWeAreService();
