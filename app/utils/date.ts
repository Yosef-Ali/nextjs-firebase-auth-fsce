import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

// Convert any date-like value to a Firebase Timestamp
export function toTimestamp(date: Date | number | Timestamp | any): Timestamp {
    if (!date) return Timestamp.now();
    if (date instanceof Timestamp) return date;
    if (typeof date === 'number') return Timestamp.fromMillis(date);
    if (date instanceof Date) return Timestamp.fromDate(date);
    if (date?.toDate instanceof Function) return Timestamp.fromDate(date.toDate());
    return Timestamp.now();
}

// Format a date using a provided format string
export const formatDate = (date: Date | number): string => {
    const d = date instanceof Date ? date : new Date(date);
    return format(d, 'MMM d, yyyy');
};

// Format a date with time
export const formatDateTime = (date: Date | number): string => {
    const d = date instanceof Date ? date : new Date(date);
    return format(d, 'MMM d, yyyy h:mm a');
};

// Format a date for publishing display
export const formatPublishDate = (date: Date | number): string => {
    const d = date instanceof Date ? date : new Date(date);
    return format(d, 'MMMM d, yyyy');
};

// Compare two timestamps for sorting (newer first)
export const compareTimestamps = (a: Timestamp | Date | number, b: Timestamp | Date | number): number => {
    const aTime = a instanceof Timestamp ? a.toMillis() : new Date(a).getTime();
    const bTime = b instanceof Timestamp ? b.toMillis() : new Date(b).getTime();
    return bTime - aTime;
};

// Convert to Date (just returns the input if it's already a Date)
export const toDate = (date: Date | number): Date => {
    return date instanceof Date ? date : new Date(date);
};

// Normalize Firebase timestamps in an object
export function normalizeTimestamps<T>(data: T): T {
    if (!data) return data;
    const result = { ...data } as any;
    const now = new Date();

    // Convert timestamp fields
    ['createdAt', 'updatedAt', 'date'].forEach(field => {
        if (field in result) {
            result[field] = toTimestamp(result[field]);
        } else {
            result[field] = now;
        }
    });

    return result as T;
}
