import { Timestamp } from 'firebase/firestore';

export type FirebaseTimestamp = Timestamp | Date | number;
export type ClientTimestamp = Date;

// Convert Firebase Timestamp to JS Date
export function toClientDate(timestamp: FirebaseTimestamp): ClientTimestamp {
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }
    return timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
}

// Convert JS Date to Firebase Timestamp
export function toFirebaseTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
}

// Type guard for Firebase Timestamp
export function isFirebaseTimestamp(obj: any): obj is Timestamp {
    return obj instanceof Timestamp;
}
