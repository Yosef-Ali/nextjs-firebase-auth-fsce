import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

// Convert any date-like value to a Firebase Timestamp
export function toTimestamp(date: Date | number | Timestamp | any): Timestamp {
    try {
        if (!date) return Timestamp.now();
        if (date instanceof Timestamp) return date;
        if (typeof date === 'number') return Timestamp.fromMillis(date);
        if (date instanceof Date) return Timestamp.fromDate(date);
        if (date?.toDate instanceof Function) return Timestamp.fromDate(date.toDate());
        if (typeof date === 'string') {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                return Timestamp.fromDate(parsedDate);
            }
        }
        return Timestamp.now();
    } catch (error) {
        console.error('Error converting to timestamp:', error, date);
        return Timestamp.now();
    }
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
export const compareTimestamps = (a: Timestamp | Date | number | any, b: Timestamp | Date | number | any): number => {
    try {
        // Convert timestamps to milliseconds for comparison
        const getTimeValue = (timestamp: any): number => {
            if (!timestamp) return 0;
            if (timestamp instanceof Timestamp) return timestamp.toMillis();
            if (timestamp instanceof Date) return timestamp.getTime();
            if (timestamp && typeof timestamp.toDate === 'function') return timestamp.toDate().getTime();
            if (typeof timestamp === 'number') return timestamp;
            return 0;
        };

        return getTimeValue(b) - getTimeValue(a); // Sort by descending order (newer first)
    } catch (error) {
        console.error('Error comparing timestamps:', error);
        return 0;
    }
};

// Convert to Date (handles Timestamp objects)
export function toDate(timestamp: Timestamp | Date | number | any): Date {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }
    if (timestamp?.toDate instanceof Function) {
        return timestamp.toDate();
    }
    return timestamp instanceof Date ? timestamp : new Date();
}

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
