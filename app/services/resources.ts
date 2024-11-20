import { db } from '@/app/firebase';
import { Resource } from '@/app/types/post';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  Timestamp,
  increment,
  updateDoc,
} from 'firebase/firestore';

class ResourcesService {
  private collectionName = 'resources';

  private convertTimestampToMillis(timestamp: unknown): number {
    if (timestamp instanceof Timestamp) {
      return timestamp.toMillis();
    }
    return Date.now();
  }

  async getAllResources(category?: string): Promise<Resource[]> {
    try {
      // Get all resources
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      
      // Convert and filter in memory
      const resources = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: this.convertTimestampToMillis(doc.data().createdAt),
          updatedAt: this.convertTimestampToMillis(doc.data().updatedAt),
        } as Resource))
        .filter(resource => resource.published) // Only published resources
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt desc

      // Filter by category if specified
      if (category && category !== 'all') {
        return resources.filter(resource => resource.category === category);
      }

      return resources;
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
}

export const resourcesService = new ResourcesService();
