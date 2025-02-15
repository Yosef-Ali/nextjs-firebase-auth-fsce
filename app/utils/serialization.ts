import { Timestamp } from 'firebase/firestore';

export function serializeTimestamp(timestamp: Timestamp | Date | number | null | undefined): number {
    if (!timestamp) {
        return Date.now();
    }

    if (timestamp instanceof Timestamp) {
        return timestamp.toMillis();
    }

    if (timestamp instanceof Date) {
        return timestamp.getTime();
    }

    if (typeof timestamp === 'number') {
        return timestamp;
    }

    return Date.now();
}

export function serializeData<T extends Record<string, any>>(data: T): T {
    if (!data) return data;

    return Object.entries(data).reduce((acc, [key, value]) => {
        if (value instanceof Timestamp) {
            acc[key] = serializeTimestamp(value);
        } else if (Array.isArray(value)) {
            acc[key] = value.map(item =>
                typeof item === 'object' ? serializeData(item) : item
            );
        } else if (value && typeof value === 'object') {
            acc[key] = serializeData(value);
        } else {
            acc[key] = value;
        }
        return acc;
    }, {} as T);
}