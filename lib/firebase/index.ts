// Client-side exports
export { auth, db, default as app } from './client';

// Server-side exports
export { adminAuth, adminDb, adminStorage, default as adminApp } from './admin';
export { authenticateServerRequest, verifyAuthToken, validateAuthHeader } from './auth-server';
export type { AuthenticatedRequest } from './auth-server';

// Server actions and middleware
export { withAuth } from '../middleware/with-auth';
export { withServerAuth, adminAction } from '../server/auth-actions';