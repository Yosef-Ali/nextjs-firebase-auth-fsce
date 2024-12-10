import { create } from 'zustand';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProgramOffice {
  id: string;
  type: 'Program';
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

interface ProgramOfficesStore {
  offices: ProgramOffice[];
  loading: boolean;
  setOffices: (offices: ProgramOffice[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useProgramOffices = create<ProgramOfficesStore>((set) => ({
  offices: [],
  loading: true,
  setOffices: (offices) => set({ offices }),
  setLoading: (loading) => set({ loading }),
}));

// Initialize the real-time listener
const officesCollection = collection(db, 'programOffices');
const q = query(officesCollection);

onSnapshot(q, (snapshot) => {
  const officesData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ProgramOffice[];
  
  useProgramOffices.getState().setOffices(officesData);
  useProgramOffices.getState().setLoading(false);
});
