import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { ProgramOffice, ProgramOfficeCreate } from '@/app/types/program-office';

class ProgramOfficesService {
  private collection = 'program-offices';

  async getProgramOffices(): Promise<ProgramOffice[]> {
    const snapshot = await getDocs(collection(db, this.collection));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgramOffice));
  }

  async deleteProgramOffice(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collection, id));
  }

  async createProgramOffice(data: ProgramOfficeCreate): Promise<ProgramOffice> {
    const docRef = await addDoc(collection(db, this.collection), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return { ...data, id: docRef.id } as ProgramOffice;
  }

  async updateProgramOffice(id: string, data: Partial<ProgramOffice>): Promise<void> {
    const docRef = doc(db, this.collection, id);
    await setDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
}

export const programOfficesService = new ProgramOfficesService();
