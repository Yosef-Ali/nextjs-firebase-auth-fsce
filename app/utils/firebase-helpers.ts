import { Timestamp } from 'firebase/firestore';

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