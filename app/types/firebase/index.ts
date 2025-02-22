// Auto-generated Firebase type definitions
import '@firebase/app-types';
import '@firebase/auth-types';
import '@firebase/firestore-types';
import '@firebase/functions-types';
import '@firebase/analytics-types';

// Re-export types from firebase
export * from '@firebase/app-types';
export * from '@firebase/auth-types';
export * from '@firebase/firestore-types';
export * from '@firebase/functions-types';
export * from '@firebase/analytics-types';

// Re-export storage types from firebase/storage instead of @firebase/storage-types
import type {
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';

export {
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
};

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
