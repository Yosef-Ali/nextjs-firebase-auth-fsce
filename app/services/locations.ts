import { db } from '@/app/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Location, LocationType } from '@/app/types/location';

class LocationsService {
  private collectionName = 'locations';

  async getAllLocations(): Promise<Location[]> {
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
      })) as Location[];
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  async getLocationsByType(type: LocationType): Promise<Location[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
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
      })) as Location[];
    } catch (error) {
      console.error('Error getting locations by type:', error);
      throw error;
    }
  }

  async getLocationById(id: string): Promise<Location | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? data.createdAt.toMillis() 
          : Date.now(),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? data.updatedAt.toMillis() 
          : Date.now(),
      } as Location;
    } catch (error) {
      console.error('Error getting location by id:', error);
      throw error;
    }
  }

  async getLocationStatistics(): Promise<{
    totalLocations: number;
    cityOffices: number;
    regionalOffices: number;
    beneficiariesReached: number;
  }> {
    try {
      const locations = await this.getAllLocations();
      const cityOffices = locations.filter(loc => loc.type === 'city').length;
      const regionalOffices = locations.filter(loc => loc.type === 'regional').length;
      const beneficiariesReached = locations.reduce((total, loc) => total + (loc.beneficiariesCount || 0), 0);

      return {
        totalLocations: locations.length,
        cityOffices,
        regionalOffices,
        beneficiariesReached,
      };
    } catch (error) {
      console.error('Error getting location statistics:', error);
      throw error;
    }
  }
}

export const locationsService = new LocationsService();
