import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

// Common timestamp type to ensure consistency across the app
export type Timestamp = FirebaseTimestamp;

// Common interfaces for timestamp fields
export interface WithTimestamps {
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface WithOptionalTimestamps {
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

// Re-export Firebase types we need
export { FirebaseTimestamp };

// Export common type utilities
export type Immutable<T> = {
    readonly [K in keyof T]: T[K];
};

// Common input types
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;

// Helper type for Firebase document data
export type FirestoreData<T> = Omit<T, 'id'>;

// Re-export Category type
export type { Category } from './category';