import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  WhereFilterOp,
  Query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Safely execute a Firestore query with error handling
 * This function is designed to avoid listener conflicts
 * 
 * @param collectionName The name of the collection to query
 * @param constraints Query constraints (where, orderBy, limit)
 * @returns Array of documents
 */
export async function safeQuery(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<DocumentData[]> {
  try {
    // Create a query with the provided constraints
    const q = query(collection(db, collectionName), ...constraints);

    // Execute the query once (no listeners)
    const querySnapshot = await getDocs(q);

    // Convert to array of documents
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error executing query on ${collectionName}:`, error);
    return [];
  }
}

/**
 * Get published documents from a collection
 * 
 * @param collectionName The name of the collection to query
 * @param options Additional query options
 * @returns Array of published documents
 */
export async function getPublishedDocuments(
  collectionName: string,
  options: {
    category?: string;
    limitCount?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
): Promise<DocumentData[]> {
  // For free users: Use only a simple query without indexes
  // Just get all documents and filter in memory

  try {
    // Import firestoreManager to prevent connection issues
    const { firestoreManager } = await import('@/lib/firestore-manager');

    // Reset connection to avoid Target ID conflicts
    await firestoreManager.resetConnection();

    // Simple query - no complex constraints that require indexes
    const querySnapshot = await getDocs(collection(db, collectionName));

    // Filter in memory instead of using complex where/orderBy queries
    let results = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DocumentData))
      // Filter published items in memory
      .filter(doc => doc.published === true);

    // Filter by category in memory if needed
    if (options.category) {
      results = results.filter(doc => {
        // Type assertion to avoid TypeScript errors
        const typedDoc = doc as DocumentData;
        return (
          typedDoc.type === options.category ||
          typedDoc.category === options.category ||
          (typedDoc.category && typedDoc.category.id === options.category)
        );
      });
    }

    // Sort in memory
    if (options.sortBy && options.sortBy.trim() !== '') {
      results.sort((a, b) => {
        // Type assertion to avoid TypeScript errors
        const sortField = options.sortBy as string;
        if (options.sortDirection === 'asc') {
          return a[sortField] > b[sortField] ? 1 : -1;
        } else {
          return a[sortField] < b[sortField] ? 1 : -1;
        }
      });
    }

    // Apply limit in memory
    if (options.limitCount && options.limitCount > 0) {
      results = results.slice(0, options.limitCount);
    }

    return results;
  } catch (error) {
    console.error(`Error getting published documents from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Get a document by ID
 * 
 * @param collectionName The name of the collection
 * @param id The document ID
 * @returns The document or null if not found
 */
export async function getDocumentById(
  collectionName: string,
  id: string
): Promise<DocumentData | null> {
  try {
    const results = await safeQuery(collectionName, [
      where('__name__', '==', id)
    ]);

    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error(`Error getting document ${id} from ${collectionName}:`, error);
    return null;
  }
}

/**
 * Get documents by a field value
 * 
 * @param collectionName The name of the collection
 * @param field The field to filter by
 * @param operator The comparison operator
 * @param value The value to compare against
 * @returns Array of matching documents
 */
export async function getDocumentsByField(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: any
): Promise<DocumentData[]> {
  try {
    return await safeQuery(collectionName, [
      where(field, operator, value)
    ]);
  } catch (error) {
    console.error(`Error getting documents by field ${field} from ${collectionName}:`, error);
    return [];
  }
}
