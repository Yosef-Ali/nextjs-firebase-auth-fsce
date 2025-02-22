import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc, where } from 'firebase/firestore';
import { ProgramOffice, ProgramOfficeCreate, ProgramOfficeUpdate } from '@/types/program-office';

export const programOfficesService = {
  collectionName: 'programOffices',

  async getAllProgramOffices(): Promise<ProgramOffice[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgramOffice));
    } catch (error) {
      console.error('Error getting program offices:', error);
      throw error;
    }
  },

  async getProgramOfficeById(id: string): Promise<ProgramOffice | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ProgramOffice;
      }
      return null;
    } catch (error) {
      console.error('Error getting program office:', error);
      throw error;
    }
  },

  async createProgramOffice(data: ProgramOfficeCreate): Promise<string> {
    try {
      const docRef = doc(collection(db, this.collectionName));
      const timestamp = new Date().toISOString();
      
      await setDoc(docRef, {
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating program office:', error);
      throw error;
    }
  },

  async updateProgramOffice(id: string, data: ProgramOfficeUpdate): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating program office:', error);
      throw error;
    }
  },

  async deleteProgramOffice(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting program office:', error);
      throw error;
    }
  },

  async getProgramOfficesByRegion(region: string): Promise<ProgramOffice[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('region', '==', region)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgramOffice));
    } catch (error) {
      console.error('Error getting program offices by region:', error);
      throw error;
    }
  }
};
