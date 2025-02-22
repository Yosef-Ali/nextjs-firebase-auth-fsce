import { db } from '@/lib/firebase/index';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
  CollectionReference
} from 'firebase/firestore';

export interface FirebaseCollection {
  name: string;
  documents: DocumentData[];
}

export async function createCollection(collectionName: string): Promise<void> {
  try {
    // Collections are automatically created when you add documents
    const collectionRef = collection(db, collectionName);
    console.log(`Collection ${collectionName} reference created`);
    return Promise.resolve();
  } catch (error) {
    console.error(`Error creating collection ${collectionName}:`, error);
    return Promise.reject(error);
  }
}

export async function addDocument(
  collectionName: string, 
  data: DocumentData, 
  documentId?: string
): Promise<string> {
  try {
    const collectionRef = collection(db, collectionName);
    
    if (documentId) {
      // Create document with specific ID
      const docRef = doc(collectionRef, documentId);
      await setDoc(docRef, data);
      console.log(`Document created with ID: ${documentId}`);
      return documentId;
    } else {
      // Create document with auto-generated ID
      const docRef = await addDoc(collectionRef, data);
      console.log(`Document created with ID: ${docRef.id}`);
      return docRef.id;
    }
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

export async function getDocumentsByCategory(
  collectionName: string,
  category: string
): Promise<DocumentData[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("category", "==", category));
    const querySnapshot = await getDocs(q);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

export async function getAllDocuments(
  collectionName: string
): Promise<DocumentData[]> {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const documents: DocumentData[] = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return documents;
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    throw error;
  }
}
