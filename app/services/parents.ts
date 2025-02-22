import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ParentClient } from '@/app/types/parent';

const getParents = async (): Promise<ParentClient[]> => {
  const parentsRef = collection(db, 'parents');
  const snapshot = await getDocs(parentsRef);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: doc.id,
    createdAt: new Date(doc.data().createdAt),
    updatedAt: new Date(doc.data().updatedAt)
  })) as ParentClient[];
};

const getParent = async (id: string): Promise<ParentClient | null> => {
  const docRef = doc(db, 'parents', id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  
  return {
    ...docSnap.data(),
    id: docSnap.id,
    createdAt: new Date(docSnap.data().createdAt),
    updatedAt: new Date(docSnap.data().updatedAt)
  } as ParentClient;
};

const createParent = async (data: Omit<ParentClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ParentClient> => {
  const id = crypto.randomUUID();
  const now = new Date();
  
  const parent: ParentClient = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(doc(db, 'parents', id), parent);
  return parent;
};

const updateParent = async (id: string, data: Partial<ParentClient>): Promise<ParentClient> => {
  const now = new Date();
  const updateData = {
    ...data,
    updatedAt: now
  };

  await updateDoc(doc(db, 'parents', id), updateData);
  return { id, ...data, updatedAt: now } as ParentClient;
};

const deleteParent = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'parents', id));
};

export const parentsService = {
  getParents,
  getParent,
  createParent,
  updateParent,
  deleteParent
} as const;