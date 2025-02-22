// Public API for Firebase authentication
export * from './firebase/index';
export * from './firebase/auth';
export * from './firebase/errors';
export * from './firebase/user';
export * from './firebase/types';

// Admin utilities are exported separately to avoid client-side imports
export * as adminUtils from './firebase/admin';