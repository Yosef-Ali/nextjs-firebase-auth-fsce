import { db } from '@/lib/firebase';
import { firestoreManager } from '@/lib/firestore-manager';
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
    const defaultContent = {
      id: doc.id,
      title: '',
      content: '',
      section: '',
      published: false,
      category: '',
      excerpt: '',
      coverImage: '',
      images: [],
      authorId: 'system',
      authorEmail: 'system@fsce.org',
      slug: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const result = {
        ...defaultContent,
        title: data?.title || '',
        content: data?.content || '',
        section: data?.section || '',
        published: Boolean(data?.published),
        category: data?.category || '',
        excerpt: data?.excerpt || '',
        coverImage: data?.coverImage || '',
        images: Array.isArray(data?.images) ? data.images : [],
        authorId: data?.authorId || 'system',
        authorEmail: data?.authorEmail || 'system@fsce.org',
        slug: data?.slug || '',
        createdAt: this.convertTimestamp(data?.createdAt),
        updatedAt: this.convertTimestamp(data?.updatedAt)
      };

      console.log('Converted document:', { id: doc.id, result });
      return result;
    } catch (error) {
      console.error('Error converting document:', { id: doc.id, error });
      return defaultContent;
    }
  }

  async getAboutContent(): Promise<AboutContent[]> {
    try {
      // Reset Firestore connection to clear any existing target IDs
      await firestoreManager.resetConnection();

      // Use collection reference
      const aboutCollection = collection(db, 'about');

      // Use getDocs for a one-time fetch instead of onSnapshot
      const querySnapshot = await getDocs(aboutCollection);

      // Use helper function for mapping and filter
      const aboutData: AboutContent[] = querySnapshot.docs
        .map((doc) => this.documentToAboutContent(doc))
        .filter(item => ['vision', 'mission', 'values'].includes(item.section));

      console.log('About data fetched:', aboutData.length, 'items');
      return aboutData;
    } catch (error) {
      console.error('Error fetching about content:', error);
      // Make sure network is re-enabled in case of error
      await firestoreManager.enableNetwork();
      throw error;
    }
  }

  async getContentBySection(section: string): Promise<AboutContent[]> {
    try {
      // Use a simpler query approach with minimal filters
      const postsCollection = collection(db, this.collectionName);

      // Create a simple query with minimal filters
      const basicQuery = query(
        postsCollection,
        where('published', '==', true)
      );

      // Use getDocs for a one-time fetch instead of onSnapshot
      const querySnapshot = await getDocs(basicQuery);

      // Filter in memory for category and section
      const documents = querySnapshot.docs
        .map((doc) => this.documentToAboutContent(doc))
        .filter(item => item.category === this.category && item.section === section);

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
      // Use a simpler query to avoid complex indexes
      const postsCollection = collection(db, this.collectionName);

      // Create a simple query with minimal filters
      const basicQuery = query(
        postsCollection,
        where('published', '==', true)
      );

      // Use getDocs for a one-time fetch instead of onSnapshot
      const querySnapshot = await getDocs(basicQuery);

      // Filter in memory instead of in the query
      const documents = querySnapshot.docs
        .map((doc) => this.documentToAboutContent(doc))
        .filter(item =>
          item.category === this.category &&
          ['vision', 'mission', 'core-values'].includes(item.section)
        );

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
