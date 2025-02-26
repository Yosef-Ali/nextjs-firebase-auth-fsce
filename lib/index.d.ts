// Type definitions for shared library utilities
declare module 'lib/*' {
    import * as admin from 'firebase-admin';

    export interface ApiResponse<T> {
        data: T;
        error: null | Error;
        loading: boolean;
    }

    export interface FirebaseConfig {
        firestore?: admin.firestore.Settings;
        auth?: admin.auth.AuthSettings;
        storage?: admin.storage.StorageSettings;
    }

    export interface ErrorResult {
        code: string;
        message: string;
        details?: unknown;
    }

    export type FirestoreHandler = (
        snapshot: admin.firestore.DocumentSnapshot,
        context: admin.firestore.EventContext
    ) => Promise<void>;

    export type AuthHandler = (
        user: admin.auth.UserRecord,
        context: admin.auth.EventContext
    ) => Promise<void>;

    export type StorageHandler = (
        object: admin.storage.ObjectMetadata,
        context: admin.storage.EventContext
    ) => Promise<void>;

    export interface KeyValuePair<T = unknown> {
        [key: string]: T;
    }
}
