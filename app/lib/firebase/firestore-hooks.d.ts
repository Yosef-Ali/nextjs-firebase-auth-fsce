declare module '@/lib/firebase/firestore-hooks' {
  import { DocumentData, QueryConstraint, WhereFilterOp } from 'firebase/firestore';

  export function useFirestoreCollection(
    path: string, 
    constraints?: QueryConstraint[]
  ): [DocumentData[] | undefined, boolean, Error | undefined];

  export function useFirestoreDocument(
    path: string, 
    id: string
  ): [DocumentData | undefined, boolean, Error | undefined];

  export function addDocument(
    collectionPath: string, 
    data: DocumentData
  ): Promise<void>;

  export function updateDocument(
    collectionPath: string, 
    id: string, 
    data: Partial<DocumentData>
  ): Promise<void>;

  export function deleteDocument(
    collectionPath: string, 
    id: string
  ): Promise<void>;

  export function createQueryConstraints(options: {
    whereConstraints?: [string, WhereFilterOp, any][];
    orderByField?: string;
    orderByDirection?: 'asc' | 'desc';
    limitCount?: number;
  }): QueryConstraint[];
}
