import { Timestamp } from 'firebase/firestore';

export type ClientTimestamp = Date;

// Convert Firebase Timestamp to JS Date
export function toClientDate(timestamp: Timestamp | Date | number): ClientTimestamp {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }
    return timestamp;
}

// Convert JS Date to Firebase Timestamp
export function toFirebaseTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
}

// Type guard for Firebase Timestamp
export function isFirebaseTimestamp(obj: any): obj is Timestamp {
    return obj instanceof Timestamp;
}
