import { ProgramOffice } from "@/app/types/program-office";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

const COLLECTION = "programOffices";

export async function getProgramOffices(): Promise<ProgramOffice[]> {
  const querySnapshot = await getDocs(collection(db, COLLECTION));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProgramOffice[];
}

export async function getProgramOffice(id: string): Promise<ProgramOffice | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    } as ProgramOffice;
  }
  return null;
}

export async function createProgramOffice(data: Partial<ProgramOffice>): Promise<ProgramOffice> {
  const docRef = doc(collection(db, COLLECTION));
  const timestamp = new Date().toISOString();
  
  const programOffice = {
    id: docRef.id,
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await setDoc(docRef, programOffice);
  return programOffice as ProgramOffice;
}

export async function updateProgramOffice(
  id: string,
  data: Partial<ProgramOffice>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function deleteProgramOffice(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function getProgramOfficesByRegion(region: string): Promise<ProgramOffice[]> {
  const q = query(collection(db, COLLECTION), where("region", "==", region));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProgramOffice[];
}
