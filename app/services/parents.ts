import { Parent } from '@/app/types/parent';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const toTimestamp = (date: Date | number | any): number => {
    if (typeof date === 'number') return date;
    if (date instanceof Date) return date.getTime();
    if (date?.toDate instanceof Function) return date.toDate().getTime();
    return Date.now();
};

const COLLECTION_NAME = 'parents';

export const parentsService = {
    getParents: async (): Promise<Parent[]> => {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: toTimestamp(doc.data().createdAt),
            updatedAt: toTimestamp(doc.data().updatedAt)
        })) as Parent[];
    },

    getParentById: async (id: string): Promise<Parent | null> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            id,
            ...data,
            createdAt: toTimestamp(data.createdAt),
            updatedAt: toTimestamp(data.updatedAt)
        } as Parent;
    },

    createParent: async (data: Omit<Parent, 'id' | 'createdAt' | 'updatedAt'>): Promise<Parent> => {
        const now = Date.now();
        const parentData = {
            ...data,
            createdAt: Timestamp.fromMillis(now),
            updatedAt: Timestamp.fromMillis(now)
        };
        const docRef = doc(collection(db, COLLECTION_NAME));
        await setDoc(docRef, parentData);
        return {
            id: docRef.id,
            ...data,
            createdAt: now,
            updatedAt: now
        };
    },

    updateParent: async (id: string, data: Partial<Parent>): Promise<boolean> => {
        try {
            const now = Date.now();
            await updateDoc(doc(db, COLLECTION_NAME, id), {
                ...data,
                updatedAt: Timestamp.fromMillis(now)
            });
            return true;
        } catch (error) {
            console.error('Error updating parent:', error);
            return false;
        }
    },

    deleteParent: async (id: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
            return true;
        } catch (error) {
            console.error('Error deleting parent:', error);
            return false;
        }
    }
};