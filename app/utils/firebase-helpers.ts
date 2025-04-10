import { Timestamp, collection, getDocs, DocumentData, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Converts a Firestore Timestamp to a JavaScript Date
 */
export function timestampToDate(timestamp: Timestamp | undefined | null): Date | undefined {
  if (!timestamp) return undefined;
  return timestamp.toDate();
}

/**
 * Converts a JavaScript Date to a Firestore Timestamp
 */
export function dateToTimestamp(date: Date | undefined | null): Timestamp | undefined {
  if (!date) return undefined;
  return Timestamp.fromDate(date);
}

/**
 * Formats a Timestamp or Date for display
 */
export function formatDate(date: Timestamp | Date | undefined | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';

  const dateObj = date instanceof Timestamp ? date.toDate() : date;

  return dateObj.toLocaleDateString('en-US', options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Creates a slug from a string
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Safely access nested properties in an object
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }

  return (result === undefined || result === null) ? defaultValue : result as T;
}

/**
 * Format a timestamp as a relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: Timestamp | Date | undefined | null): string {
  if (!timestamp) return '';

  const dateObj = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

  return formatDate(dateObj, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Check if a value is a valid Firestore Timestamp
 */
export function isValidTimestamp(value: any): boolean {
  return value instanceof Timestamp &&
         typeof value.toDate === 'function' &&
         !isNaN(value.toDate().getTime());
}

/**
 * Function to fetch published documents from a collection
 * This uses a simple query with a single filter to avoid complex indexes
 *
 * @param collectionName The name of the collection to fetch
 * @returns Array of published documents
 */
export async function fetchPublishedDocuments(collectionName: string): Promise<DocumentData[]> {
  try {
    // Create a query with a single filter for published=true
    const q = query(collection(db, collectionName), where('published', '==', true));
    const querySnapshot = await getDocs(q);

    // Convert to array of documents
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DocumentData));
  } catch (error) {
    console.error(`Error fetching published documents from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Simple function to fetch all documents from a collection without any filters
 * Use this only for small collections or admin functions
 *
 * @param collectionName The name of the collection to fetch
 * @returns Array of documents
 */
export async function fetchAllDocuments(collectionName: string): Promise<DocumentData[]> {
  try {
    // Create a simple query with no constraints
    const q = query(collection(db, collectionName));
    const querySnapshot = await getDocs(q);

    // Convert to array of documents
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DocumentData));
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    return [];
  }
}

/**
 * Filter documents by a simple property value
 *
 * @param documents Array of documents to filter
 * @param property Property name to filter by
 * @param value Value to match
 * @returns Filtered array of documents
 */
export function filterDocumentsByProperty<T extends DocumentData>(
  documents: T[],
  property: string,
  value: any
): T[] {
  return documents.filter(doc => doc[property] === value);
}

/**
 * Sort documents by a property
 *
 * @param documents Array of documents to sort
 * @param property Property name to sort by
 * @param direction Sort direction ('asc' or 'desc')
 * @returns Sorted array of documents
 */
export function sortDocumentsByProperty<T extends DocumentData>(
  documents: T[],
  property: string,
  direction: 'asc' | 'desc' = 'desc'
): T[] {
  return [...documents].sort((a, b) => {
    const valueA = a[property];
    const valueB = b[property];

    // Handle different types of values
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return direction === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }

    // Default numeric comparison
    const numA = Number(valueA) || 0;
    const numB = Number(valueB) || 0;
    return direction === 'asc' ? numA - numB : numB - numA;
  });
}
