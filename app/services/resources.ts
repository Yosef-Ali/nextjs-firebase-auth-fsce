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
  query,
  where,
} from 'firebase/firestore';
import { fetchAllDocuments, filterDocumentsByProperty, sortDocumentsByProperty } from '@/app/utils/firebase-helpers';

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
      // Fetch all documents from the collection (no filters to avoid index requirements)
      const allDocuments = await fetchAllDocuments(this.collectionName);

      // Filter for published resources in memory
      let resources = filterDocumentsByProperty(allDocuments, 'published', true);

      // Sort by publishedDate in memory
      resources = sortDocumentsByProperty(resources, 'publishedDate');

      // Process the results
      let processedResources = resources.map(doc => ({
        id: doc.id,
        ...doc,
        createdAt: this.convertTimestampToMillis(doc.createdAt),
        updatedAt: this.convertTimestampToMillis(doc.updatedAt),
        publishedDate: this.convertTimestampToMillis(doc.publishedDate),
        slug: doc.slug || doc.id,
      } as Resource));

      // Filter by category in memory if needed
      if (category && category !== 'all') {
        processedResources = processedResources.filter(resource => resource.type === category);
      }

      return processedResources;
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
