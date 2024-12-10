import { db } from '@/lib/firebase';
import { Resource } from '@/app/types/resource';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  increment,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from 'firebase/firestore';

class ResourcesService {
  private collectionName = 'resources';

  private convertTimestampToMillis(timestamp: unknown): number {
    if (timestamp instanceof Timestamp) {
      return timestamp.toMillis();
    }
    return Date.now();
  }

  createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 60); // Limit length
  }

  async createResource(data: Omit<Resource, 'id'>): Promise<Resource> {
    try {
      // Create a new document reference with auto-generated ID
      const docRef = doc(collection(db, this.collectionName));
      
      // Use the document ID as the slug if not provided
      const resourceData = {
        ...data,
        slug: data.slug || docRef.id,
        createdAt: data.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      // Set the document with the ID as its slug
      await setDoc(docRef, resourceData);

      return {
        id: docRef.id,
        ...resourceData,
      };
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  }

  async getAllResources(category?: string): Promise<Resource[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      
      return querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: this.convertTimestampToMillis(data.createdAt),
            updatedAt: this.convertTimestampToMillis(data.updatedAt),
            publishedDate: this.convertTimestampToMillis(data.publishedDate),
            slug: data.slug || doc.id,
          } as Resource;
        })
        .filter(resource => {
          if (category && category !== 'all') {
            return resource.type === category;
          }
          return true;
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt in descending order (newest first)
    } catch (error) {
      console.error('Error getting resources:', error);
      return [];
    }
  }

  async incrementDownloadCount(resourceId: string): Promise<void> {
    try {
      const resourceRef = doc(db, this.collectionName, resourceId);
      await updateDoc(resourceRef, {
        downloadCount: increment(1)
      });
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }

  async getResourceById(id: string): Promise<Resource | null> {
    try {
      const resourceRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(resourceRef);
      
      if (!docSnap.exists()) return null;
      
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: this.convertTimestampToMillis(data.createdAt),
        updatedAt: this.convertTimestampToMillis(data.updatedAt),
      } as Resource;
    } catch (error) {
      console.error('Error getting resource:', error);
      return null;
    }
  }

  async updateResource(id: string, data: Partial<Resource>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: Date.now(),
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  }

  async deleteResource(id: string): Promise<void> {
    try {
      const resourceRef = doc(db, this.collectionName, id);
      await deleteDoc(resourceRef);
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
}

export const resourcesService = new ResourcesService();
