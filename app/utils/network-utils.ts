import { db } from '@/lib/firebase';
import { enableNetwork, disableNetwork } from 'firebase/firestore';

/**
 * Utility functions for handling network status and Firestore connectivity
 */

/**
 * Check if the application is online
 * @returns boolean indicating if the app is online
 */
export function isOnline(): boolean {
  if (typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  return true; // Default to true on server
}

/**
 * Enable Firestore network access
 * @returns Promise that resolves when network is enabled
 */
export async function enableFirestoreNetwork(): Promise<void> {
  try {
    console.log('Enabling Firestore network');
    await enableNetwork(db);
  } catch (error) {
    console.error('Error enabling Firestore network:', error);
    throw error;
  }
}

/**
 * Disable Firestore network access (use offline cache only)
 * @returns Promise that resolves when network is disabled
 */
export async function disableFirestoreNetwork(): Promise<void> {
  try {
    console.log('Disabling Firestore network');
    await disableNetwork(db);
  } catch (error) {
    console.error('Error disabling Firestore network:', error);
    throw error;
  }
}

/**
 * Toggle Firestore network access based on online status
 * @param online boolean indicating if the app is online
 * @returns Promise that resolves when network state is updated
 */
export async function updateFirestoreNetworkStatus(online: boolean): Promise<void> {
  if (online) {
    return enableFirestoreNetwork();
  } else {
    return disableFirestoreNetwork();
  }
}
