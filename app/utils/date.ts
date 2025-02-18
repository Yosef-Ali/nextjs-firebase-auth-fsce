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

// Format a timestamp using a provided format string
export const formatDate = (timestamp: Timestamp | Date | number): string => {
    if (timestamp instanceof Timestamp) {
        return format(timestamp.toDate(), 'MMM d, yyyy');
    }
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return format(date, 'MMM d, yyyy');
};

// Format a timestamp with time
export const formatDateTime = (timestamp: Timestamp | Date | number): string => {
    if (timestamp instanceof Timestamp) {
        return format(timestamp.toDate(), 'MMM d, yyyy h:mm a');
    }
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return format(date, 'MMM d, yyyy h:mm a');
};

// Format a timestamp for publishing display
export const formatPublishDate = (timestamp: Timestamp | Date | number): string => {
    if (timestamp instanceof Timestamp) {
        return format(timestamp.toDate(), 'MMMM d, yyyy');
    }
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return format(date, 'MMMM d, yyyy');
};

// Compare two timestamps for sorting (newer first)
export const compareTimestamps = (a: Timestamp | number | Date, b: Timestamp | number | Date): number => {
    const aTime = toTimestamp(a);
    const bTime = toTimestamp(b);
    return bTime.seconds - aTime.seconds;
};

// Convert Timestamp to Date
export const toDate = (timestamp: Timestamp | number | Date): Date => {
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
};

// Normalize Firebase timestamps in an object
export function normalizeTimestamps<T>(data: T): T {
    if (!data) return data;
    const result = { ...data } as any;
    const now = Timestamp.now();

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
