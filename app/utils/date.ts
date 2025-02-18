import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export function toFirebaseTimestamp(date: Date | undefined): Timestamp | undefined {
    return date ? Timestamp.fromDate(date) : undefined;
}

export function fromFirebaseTimestamp(timestamp: Timestamp | undefined): Date | undefined {
    return timestamp ? timestamp.toDate() : undefined;
}

export function ensureDate(value: Date | Timestamp | number | undefined): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    return new Date(value);
}

export function normalizeFirebaseTimestamps<T extends { createdAt?: Date | Timestamp | number; updatedAt?: Date | Timestamp | number; date?: Date | Timestamp | number }>(
    data: T
): T {
    return {
        ...data,
        createdAt: ensureDate(data.createdAt),
        updatedAt: ensureDate(data.updatedAt),
        date: ensureDate(data.date)
    };
}

// Convert any date-like value to a timestamp number
export const toTimestamp = (date: Date | number | any): number => {
    if (typeof date === 'number') return date;
    if (date instanceof Date) return date.getTime();
    if (date?.toDate instanceof Function) return date.toDate().getTime();
    return Date.now();
};

// Format a timestamp using a provided format string
export const formatDate = (timestamp: number, formatStr: string = 'MMM d, yyyy'): string => {
    return format(new Date(timestamp), formatStr);
};

// Format a timestamp with time
export const formatDateTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
};

// Format a timestamp for publishing display
export const formatPublishDate = (timestamp: number): string => {
    return format(new Date(timestamp), 'MMMM d, yyyy');
};
