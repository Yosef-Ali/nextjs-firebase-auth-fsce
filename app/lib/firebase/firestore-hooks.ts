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
  WhereFilterOp,
} from 'firebase/firestore';
import { db } from './firebase-config';

// Collection hooks
export const useFirestoreCollection = (
  path: string,
  constraints: QueryConstraint[] = []
) => {
  const collectionRef = collection(db, path);
  return useCollection(constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef);
};

// Document hooks
export const useFirestoreDocument = (path: string, id: string) => {
  const docRef = doc(db, path, id);
  return useDocument(docRef);
};

// Firestore operations
export const addDocument = async (
  collectionPath: string,
  data: DocumentData
) => {
  try {
    const collectionRef = collection(db, collectionPath);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef;
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
    const docRef = doc(db, collectionPath, id);
    await updateDoc(docRef, {
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
    const docRef = doc(db, collectionPath, id);
    await deleteDoc(docRef);
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
  whereConstraints?: [string, WhereFilterOp, any][];
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
