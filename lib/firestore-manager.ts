// Firestore connection manager to prevent "Target ID already exists" errors
import { db } from './firebase';
import { enableNetwork, disableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

/**
 * Class to manage Firestore network state to prevent "Target ID already exists" errors
 * This happens when multiple components create listeners with the same target IDs
 */
class FirestoreManager {
    private isNetworkEnabled = true;

    /**
     * Disable Firestore network operations
     * Use this before creating a new connection to prevent conflicts
     */
    async disableNetwork(): Promise<void> {
        if (this.isNetworkEnabled) {
            try {
                await disableNetwork(db);
                this.isNetworkEnabled = false;
                console.log('Firestore network disabled');
            } catch (error) {
                console.error('Error disabling Firestore network:', error);
            }
        }
    }

    /**
     * Enable Firestore network operations
     * Use this after finishing with a connection
     */
    async enableNetwork(): Promise<void> {
        if (!this.isNetworkEnabled) {
            try {
                await enableNetwork(db);
                this.isNetworkEnabled = true;
                console.log('Firestore network enabled');
            } catch (error) {
                console.error('Error enabling Firestore network:', error);
            }
        }
    }

    /**
     * Reset connection by temporarily disabling and then enabling network
     * Use this to clear any existing target IDs before creating new ones
     */
    async resetConnection(): Promise<void> {
        try {
            await this.disableNetwork();
            // Small delay to ensure disconnect completes
            await new Promise(resolve => setTimeout(resolve, 100));
            await this.enableNetwork();
            console.log('Firestore connection reset successfully');
        } catch (error) {
            console.error('Error resetting Firestore connection:', error);
        }
    }
}

export const firestoreManager = new FirestoreManager();
