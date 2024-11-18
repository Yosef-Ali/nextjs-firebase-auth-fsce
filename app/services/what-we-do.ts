import { db } from '@/app/firebase';
import { collection, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { Program, ProgramCategory } from '@/app/types/program';

class WhatWeDoService {
  private collectionName = 'programs';

  async getAllPrograms(): Promise<Program[]> {
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
      })) as Program[];
    } catch (error) {
      console.error('Error getting programs:', error);
      throw error;
    }
  }

  async getProgramsByCategory(category: ProgramCategory): Promise<Program[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
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
      })) as Program[];
    } catch (error) {
      console.error('Error getting programs by category:', error);
      throw error;
    }
  }

  async getProgramById(id: string): Promise<Program | null> {
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
      } as Program;
    } catch (error) {
      console.error('Error getting program by id:', error);
      throw error;
    }
  }
}

export const whatWeDoService = new WhatWeDoService();
