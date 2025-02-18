import { db } from '@/lib/firebase';
import { Parent } from '@/app/types/parent';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'parents';

export const parentsService = {
  async getParents(): Promise<Parent[]> {
    try {
      const parentsRef = collection(db, COLLECTION_NAME);
      const q = query(parentsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt instanceof Timestamp 
          ? new Date(doc.data().createdAt.toMillis()) 
          : new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt instanceof Timestamp 
          ? new Date(doc.data().updatedAt.toMillis()) 
          : new Date(doc.data().updatedAt),
      } as Parent));
    } catch (error) {
      console.error('Error getting parents:', error);
      return [];
    }
  },

  async getParentById(id: string): Promise<Parent | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp 
          ? new Date(data.createdAt.toMillis()) 
          : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp 
          ? new Date(data.updatedAt.toMillis()) 
          : new Date(data.updatedAt),
      } as Parent;
    } catch (error) {
      console.error('Error getting parent:', error);
      return null;
    }
  },

  async createParent(data: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Parent | null> {
    try {
      const now = new Date();
      const parentData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), parentData);
      return {
        id: docRef.id,
        ...parentData,
      } as Parent;
    } catch (error) {
      console.error('Error creating parent:', error);
      return null;
    }
  },

  async updateParent(id: string, data: Partial<Omit<Parent, 'id'>>): Promise<boolean> {
    try {
      const parentRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(parentRef, {
        ...data,
        updatedAt: new Date(),
      });
      return true;
    } catch (error) {
      console.error('Error updating parent:', error);
      return false;
    }
  },

  async deleteParent(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return true;
    } catch (error) {
      console.error('Error deleting parent:', error);
      return false;
    }
  }
};