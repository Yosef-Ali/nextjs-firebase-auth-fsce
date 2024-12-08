import * as functions from 'firebase-functions';
import { onUserCreated, onUserDeleted, onUserUpdated } from './users';

// Export the functions
export {
  onUserCreated,
  onUserDeleted,
  onUserUpdated
};
