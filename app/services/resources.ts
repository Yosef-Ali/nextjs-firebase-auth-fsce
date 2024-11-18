import { db } from '@/app/firebase';
import { Resource, ResourceType, ResourceStatistics } from '@/app/types/resource';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  orderBy,
  Timestamp,
  increment,
  updateDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';

const COLLECTION_NAME = 'resources';

class ResourcesService {
  async getPublishedResources(type?: ResourceType): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      const constraints = [
        where('published', '==', true),
        orderBy('publishedDate', 'desc')
      ];
      
      if (type) {
        constraints.push(where('type', '==', type));
      }
      
      const q = query(resourcesRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : doc.data().createdAt,
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : doc.data().updatedAt,
        publishedDate: doc.data().publishedDate instanceof Timestamp 
          ? doc.data().publishedDate.toMillis() 
          : doc.data().publishedDate,
      } as Resource));
    } catch (error) {
      console.error('Error getting resources:', error);
      throw error;
    }
  }

  async getResourceBySlug(slug: string): Promise<Resource | null> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      const q = query(
        resourcesRef,
        where('slug', '==', slug),
        where('published', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? doc.data().createdAt.toMillis() 
          : doc.data().createdAt,
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? doc.data().updatedAt.toMillis() 
          : doc.data().updatedAt,
        publishedDate: doc.data().publishedDate instanceof Timestamp 
          ? doc.data().publishedDate.toMillis() 
          : doc.data().publishedDate,
      } as Resource;
    } catch (error) {
      console.error('Error getting resource by slug:', error);
      throw error;
    }
  }

  async getResourceStatistics(): Promise<ResourceStatistics> {
    try {
      const resources = await this.getPublishedResources();
      
      const stats: ResourceStatistics = {
        totalResources: resources.length,
        totalDownloads: resources.reduce((total, resource) => total + resource.downloadCount, 0),
        resourcesByType: {
          publication: 0,
          report: 0,
          toolkit: 0,
          research: 0,
        },
      };
      
      resources.forEach(resource => {
        stats.resourcesByType[resource.type]++;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting resource statistics:', error);
      throw error;
    }
  }

  async incrementDownloadCount(resourceId: string): Promise<void> {
    try {
      const resourceRef = doc(db, COLLECTION_NAME, resourceId);
      await updateDoc(resourceRef, {
        downloadCount: increment(1),
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
      throw error;
    }
  }

  async getRelatedResources(resourceId: string, type: ResourceType, limit: number = 3): Promise<Resource[]> {
    try {
      const resourcesRef = collection(db, COLLECTION_NAME);
      const q = query(
        resourcesRef,
        where('published', '==', true),
        where('type', '==', type),
        orderBy('publishedDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const resources = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toMillis() 
            : doc.data().createdAt,
          updatedAt: doc.data().updatedAt instanceof Timestamp 
            ? doc.data().updatedAt.toMillis() 
            : doc.data().updatedAt,
          publishedDate: doc.data().publishedDate instanceof Timestamp 
            ? doc.data().publishedDate.toMillis() 
            : doc.data().publishedDate,
        } as Resource))
        .filter(resource => resource.id !== resourceId)
        .slice(0, limit);
        
      return resources;
    } catch (error) {
      console.error('Error getting related resources:', error);
      throw error;
    }
  }

  async createResource(resource: Omit<Resource, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount'>): Promise<Resource> {
    try {
      const now = Timestamp.now();
      const resourceData = {
        ...resource,
        downloadCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), resourceData);
      return {
        id: docRef.id,
        ...resourceData,
        createdAt: now.toMillis(),
        updatedAt: now.toMillis(),
      } as Resource;
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async updateResource(id: string, resource: Partial<Resource>): Promise<void> {
    try {
      const resourceRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(resourceRef, {
        ...resource,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }

  async deleteResource(id: string): Promise<void> {
    try {
      const resourceRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(resourceRef);
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}

export const resourcesService = new ResourcesService();

async function testGetPublishedResources() {
  try {
    const resources = await resourcesService.getPublishedResources();
    console.log('Fetched Resources:', resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
}

// Call the test function immediately for testing
testGetPublishedResources();
