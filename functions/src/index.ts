import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all user management functions
export * from './users';
