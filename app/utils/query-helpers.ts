import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  QueryConstraint,
  DocumentData,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Optimized query helper to minimize index requirements
 *
 * This function uses a strategy to reduce composite index requirements:
 * 1. Use only one where clause in the actual Firestore query
 * 2. Perform additional filtering and sorting in memory
 *
 * @param collectionName The Firestore collection to query
 * @param options Query options
 * @returns Filtered and sorted documents
 */
export async function optimizedQuery(
  collectionName: string,
  options: {
    published?: boolean;
    status?: string;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    limitCount?: number;
    category?: string;
    categoryId?: string;
    usePublishedDate?: boolean; // Flag to use publishedDate for sorting
  } = {}
): Promise<DocumentData[]> {
  // Use a collection query with at most one filter to avoid complex index requirements
  const collectionRef = collection(db, collectionName);

  // Start with an empty constraints array
  const constraints: QueryConstraint[] = [];

  // Add only ONE where clause to minimize index requirements
  // Choose the most selective filter to use in the query
  if (options.published !== undefined) {
    constraints.push(where('published', '==', options.published));
  } else if (options.status !== undefined) {
    constraints.push(where('status', '==', options.status));
  }

  // Create and execute the query
  const q = query(collectionRef, ...constraints);
  const querySnapshot = await getDocs(q);

  // Convert to array of documents
  let results = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DocumentData));

  // Apply all filters in memory
  // Filter by published status if specified
  if (options.published !== undefined) {
    results = results.filter(doc => doc.published === options.published);
  }

  // Filter by status if specified
  if (options.status !== undefined) {
    results = results.filter(doc => doc.status === options.status);
  }

  // Apply category filter if specified
  if (options.category) {
    results = results.filter(doc => {
      // Handle both string categories and category objects
      if (typeof doc.category === 'string') {
        return doc.category === options.category;
      } else if (doc.category && doc.category.id) {
        return doc.category.id === options.category;
      }
      return false;
    });
  }

  if (options.categoryId) {
    results = results.filter(doc => {
      if (typeof doc.category === 'string') {
        return doc.category === options.categoryId;
      } else if (doc.category && doc.category.id) {
        return doc.category.id === options.categoryId;
      }
      return false;
    });
  }

  // Apply sorting in memory
  if (options.sortBy) {
    const { sortBy, sortDirection } = options;
    results.sort((a, b) => {
      let valueA = a[sortBy];
      let valueB = b[sortBy];

      // Handle dates (Timestamp, Date, or number)
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'publishedDate') {
        valueA = normalizeTimestamp(valueA);
        valueB = normalizeTimestamp(valueB);
      }

      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      // Handle numeric comparison
      return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
    });
  } else if (options.usePublishedDate) {
    // Sort by publishedDate if that flag is set
    results.sort((a, b) => {
      const timeA = normalizeTimestamp(a.publishedDate);
      const timeB = normalizeTimestamp(b.publishedDate);
      return timeB - timeA; // Descending order
    });
  } else {
    // Default sort by createdAt desc if no sort specified
    results.sort((a, b) => {
      const timeA = normalizeTimestamp(a.createdAt);
      const timeB = normalizeTimestamp(b.createdAt);
      return timeB - timeA; // Descending order
    });
  }

  return results;
}

/**
 * Helper function to normalize timestamp values for comparison
 */
function normalizeTimestamp(value: any): number {
  if (!value) return 0;

  if (value instanceof Timestamp) {
    return value.toMillis();
  } else if (value instanceof Date) {
    return value.getTime();
  } else if (typeof value === 'string') {
    return new Date(value).getTime();
  } else if (typeof value === 'number') {
    return value;
  }

  return 0;
}

/**
 * Helper function to get published posts with minimal index requirements
 */
export async function getPublishedPosts(
  collectionName: string = 'posts',
  options: {
    category?: string;
    categoryId?: string;
    limitCount?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
): Promise<DocumentData[]> {
  return optimizedQuery(collectionName, {
    published: true,
    ...options
  });
}

/**
 * Helper function to get posts by status with minimal index requirements
 */
export async function getPostsByStatus(
  status: string = 'published',
  collectionName: string = 'posts',
  options: {
    category?: string;
    categoryId?: string;
    limitCount?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
): Promise<DocumentData[]> {
  return optimizedQuery(collectionName, {
    status,
    ...options
  });
}

/**
 * Helper function to get published resources with minimal index requirements
 * This function is specifically designed for the resources collection
 * and sorts by publishedDate by default
 *
 * This version uses a simpler query approach to avoid complex indexes
 */
export async function getPublishedResources(
  collectionName: string = 'resources',
  options: {
    category?: string;
    limitCount?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
): Promise<DocumentData[]> {
  try {
    // Use a query with a single filter for published=true
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where('published', '==', true));
    const querySnapshot = await getDocs(q);

    // Process results in memory
    let results = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as DocumentData));

    // Apply category filter if needed
    if (options.category) {
      results = results.filter(item => item.type === options.category);
    }

    // Sort by publishedDate by default
    results.sort((a, b) => {
      const timeA = normalizeTimestamp(a.publishedDate);
      const timeB = normalizeTimestamp(b.publishedDate);
      return timeB - timeA; // Descending order
    });

    // Apply limit if specified
    if (options.limitCount && options.limitCount > 0) {
      results = results.slice(0, options.limitCount);
    }

    return results;
  } catch (error) {
    console.error('Error in getPublishedResources:', error);
    return [];
  }
}
