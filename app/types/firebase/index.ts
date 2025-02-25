// Auto-generated Firebase type definitions
import '@firebase/app-types';
import '@firebase/auth-types';
import '@firebase/firestore-types';
import '@firebase/storage-types';
import '@firebase/functions-types';
import '@firebase/analytics-types';

// Re-export types from firebase
export * from '@firebase/app-types';
export * from '@firebase/auth-types';
export * from '@firebase/firestore-types';
export * from '@firebase/storage-types';
export * from '@firebase/functions-types';
export * from '@firebase/analytics-types';

// Import specific types from firebase/firestore
import type { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

// Import specific types from firebase/storage
import type {
  FirebaseStorage,
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';

export {
  FirebaseStorage,
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
};

// Export Timestamp type
export type Timestamp = FirestoreTimestamp;

// Explicitly declare commonly used types
declare module 'firebase/app' {
  export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }
}

// Add any custom type augmentations here
declare module 'firebase/auth' {
  export interface UserInfo {
    role?: string;
    status?: string;
  }
}

// Common data types used throughout the application
export interface BaseDocument {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Category extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  type: 'post' | 'resource' | 'award' | 'recognition' | 'event';
  count?: number;
}

export interface Post extends BaseDocument {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: Category | string;
  author?: string;
  authorId?: string;
  image?: string;
  published?: boolean;
  sticky?: boolean;
  featured?: boolean;
}
