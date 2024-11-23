import {
  useCollection,
  useDocument,
} from 'react-firebase-hooks/firestore';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase-config';

// Collection hooks
export const useFirestoreCollection = (
  path: string,
  constraints: QueryConstraint[] = []
) => {
  const ref = collection(db, path);
  const q = query(ref, ...constraints);
  return useCollection(q);
};

// Document hooks
export const useFirestoreDocument = (path: string, id: string) => {
  const ref = doc(db, path, id);
  return useDocument(ref);
};

// Firestore operations
export const addDocument = async (
  collectionPath: string,
  data: DocumentData
) => {
  try {
    const ref = collection(db, collectionPath);
    return await addDoc(ref, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
};

export const updateDocument = async (
  collectionPath: string,
  id: string,
  data: Partial<DocumentData>
) => {
  try {
    const ref = doc(db, collectionPath, id);
    return await updateDoc(ref, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

export const deleteDocument = async (collectionPath: string, id: string) => {
  try {
    const ref = doc(db, collectionPath, id);
    return await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Helper functions
export const createQueryConstraints = ({
  whereConstraints = [],
  orderByField,
  orderByDirection = 'desc',
  limitCount,
}: {
  whereConstraints?: [string, string, any][];
  orderByField?: string;
  orderByDirection?: 'asc' | 'desc';
  limitCount?: number;
}) => {
  const constraints: QueryConstraint[] = [];

  whereConstraints.forEach(([field, operator, value]) => {
    constraints.push(where(field, operator, value));
  });

  if (orderByField) {
    constraints.push(orderBy(orderByField, orderByDirection));
  }

  if (limitCount) {
    constraints.push(limit(limitCount));
  }

  return constraints;
};
