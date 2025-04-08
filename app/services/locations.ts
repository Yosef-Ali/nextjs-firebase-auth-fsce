import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { Location, LocationType } from '@/app/types/location';
import { optimizedQuery } from '@/app/utils/query-helpers';

class LocationsService {
  private collectionName = 'locations';

  async getAllLocations(): Promise<Location[]> {
    try {
      // Use optimized query to avoid complex indexes
      const results = await optimizedQuery(this.collectionName, {
        published: true,
        sortBy: 'createdAt',
        sortDirection: 'desc'
      });

      // Process timestamps
      return results.map(doc => ({
        id: doc.id,
        ...doc,
        createdAt: doc.createdAt instanceof Timestamp
          ? doc.createdAt.toMillis()
          : Date.now(),
        updatedAt: doc.updatedAt instanceof Timestamp
          ? doc.updatedAt.toMillis()
          : Date.now(),
      })) as Location[];
    } catch (error) {
      console.error('Error getting locations:', error);
      throw error;
    }
  }

  async getLocationsByType(type: LocationType): Promise<Location[]> {
    try {
      // First get locations by type (single where clause)
      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type)
      );

      const querySnapshot = await getDocs(q);
      const allResults = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Then filter and sort in memory
      const filteredResults = allResults
        .filter(doc => doc.published === true)
        .sort((a, b) => {
          const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : 0;
          return timeB - timeA; // Descending order
        });

      // Process timestamps
      return filteredResults.map(doc => ({
        id: doc.id,
        ...doc,
        createdAt: doc.createdAt instanceof Timestamp
          ? doc.createdAt.toMillis()
          : Date.now(),
        updatedAt: doc.updatedAt instanceof Timestamp
          ? doc.updatedAt.toMillis()
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
