import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ProgramOffice, ProgramOfficeCreate, ProgramOfficeUpdate } from '@/app/types/program-office';

export const programOfficesService = {
  async getAllProgramOffices(): Promise<ProgramOffice[]> {
    try {
      const officesCollection = collection(db, 'programOffices');
      const officesSnapshot = await getDocs(officesCollection);
      return officesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgramOffice[];
    } catch (error) {
      console.error('Error getting program offices:', error);
      throw error;
    }
  },

  async getProgramOffice(id: string): Promise<ProgramOffice | null> {
    try {
      const docRef = doc(db, 'programOffices', id);
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
      const docRef = doc(collection(db, 'programOffices'));
      await setDoc(docRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating program office:', error);
      throw error;
    }
  },

  async updateProgramOffice(id: string, data: ProgramOfficeUpdate): Promise<void> {
    try {
      const docRef = doc(db, 'programOffices', id);
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
      await deleteDoc(doc(db, 'programOffices', id));
    } catch (error) {
      console.error('Error deleting program office:', error);
      throw error;
    }
  }
};
