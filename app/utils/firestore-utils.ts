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
  const constraints: QueryConstraint[] = [
    where('published', '==', true)
  ];
  
  // Add sorting if specified
  if (options.sortBy) {
    constraints.push(orderBy(options.sortBy, options.sortDirection || 'desc'));
  }
  
  // Add limit if specified
  if (options.limitCount && options.limitCount > 0) {
    constraints.push(limit(options.limitCount));
  }
  
  // Execute the query
  const results = await safeQuery(collectionName, constraints);
  
  // Filter by category in memory if needed
  if (options.category) {
    return results.filter(doc => 
      doc.type === options.category || 
      doc.category === options.category ||
      (doc.category && doc.category.id === options.category)
    );
  }
  
  return results;
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
