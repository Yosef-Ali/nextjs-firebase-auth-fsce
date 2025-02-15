import { db } from '@/lib/firebase';
import { Resource } from '@/app/types/resource';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { serializeData } from '@/app/utils/serialization';

const COLLECTION_NAME = 'resources';

class ResourcesService {
  async getAllResources(category?: string): Promise<Resource[]> {
    try {
      const collectionRef = collection(db, COLLECTION_NAME);
      const q = category
        ? query(collectionRef, where('category', '==', category))
        : query(collectionRef);

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return serializeData({
          id: doc.id,
          ...data,
          // Ensure all required fields from Resource type are present
          slug: data.slug || doc.id,
          description: data.description || '',
          downloadCount: data.downloadCount || 0,
        }) as Resource;
      });
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  }

  async getResourceById(id: string): Promise<Resource | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return serializeData({
        id: docSnap.id,
        ...data,
        // Ensure all required fields from Resource type are present
        slug: data.slug || docSnap.id,
        description: data.description || '',
        downloadCount: data.downloadCount || 0,
      }) as Resource;
    } catch (error) {
      console.error('Error fetching resource:', error);
      throw error;
    }
  }

  async createResource(data: Omit<Resource, 'id'>): Promise<Resource> {
    try {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const resource = {
        ...data,
        id: docRef.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        downloadCount: 0,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      };

      await setDoc(docRef, resource);
      return resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const updateData = {
        ...data,
        updatedAt: Date.now()
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }

  async deleteResource(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }

  async incrementDownloadCount(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        downloadCount: (await getDoc(docRef)).data()?.downloadCount + 1 || 1,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
      throw error;
    }
  }
}

export const resourcesService = new ResourcesService();
