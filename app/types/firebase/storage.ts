import type {
    FirebaseStorage,
    StorageReference as _StorageReference,
    UploadMetadata as _UploadMetadata,
    UploadTask as _UploadTask,
    UploadTaskSnapshot as _UploadTaskSnapshot
} from 'firebase/storage';

// Re-export storage types with unique names to avoid conflicts
export type StorageRef = _StorageReference;
export type UploadMeta = _UploadMetadata;
export type UploadJob = _UploadTask;
export type UploadSnapshot = _UploadTaskSnapshot;
export type Storage = FirebaseStorage;

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

// Add custom type augmentations
declare module 'firebase/auth' {
    export interface UserInfo {
        role?: string;
        status?: string;
    }
}