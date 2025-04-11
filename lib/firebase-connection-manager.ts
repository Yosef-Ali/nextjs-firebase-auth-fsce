/**
 * FirebaseConnectionManager
 * A utility class to handle Firebase Firestore connection issues and provide consistent reconnection logic
 */

import { db } from "./firebase";
import { enableNetwork, disableNetwork, setLogLevel } from "firebase/firestore";

// During development, use more detailed logging
if (process.env.NODE_ENV !== 'production') {
    setLogLevel('warn');
} else {
    setLogLevel('error');
}

class FirebaseConnectionManager {
    private static instance: FirebaseConnectionManager;
    private isOnline: boolean;
    private connectionAttempts: number;
    private maxRetries: number;
    private retryTimeout: NodeJS.Timeout | null;
    private connectionListeners: Set<(online: boolean) => void>;

    private constructor() {
        this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
        this.connectionAttempts = 0;
        this.maxRetries = 5;
        this.retryTimeout = null;
        this.connectionListeners = new Set();

        if (typeof window !== 'undefined') {
            // Set up network status listeners
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));

            // Capture Firestore-specific errors
            window.addEventListener('error', this.handleError.bind(this));
        }

        // Initialize network state based on online status
        this.updateNetworkState(this.isOnline);
    }

    public static getInstance(): FirebaseConnectionManager {
        if (!FirebaseConnectionManager.instance) {
            FirebaseConnectionManager.instance = new FirebaseConnectionManager();
        }
        return FirebaseConnectionManager.instance;
    }

    /**
     * Check if the application is currently online
     */
    public isNetworkOnline(): boolean {
        return this.isOnline;
    }

    /**
     * Subscribe to connection state changes
     * @param listener Function to call when connection state changes
     * @returns Function to unsubscribe
     */
    public addConnectionListener(listener: (online: boolean) => void): () => void {
        this.connectionListeners.add(listener);
        // Immediately notify the new listener of current state
        listener(this.isOnline);

        return () => {
            this.connectionListeners.delete(listener);
        };
    }

    /**
     * Notify all listeners of connection state change
     * @param online Current online state
     */
    private notifyListeners(online: boolean): void {
        this.connectionListeners.forEach(listener => {
            try {
                listener(online);
            } catch (error) {
                console.error('Error in connection listener:', error);
            }
        });
    }

    /**
     * Handle browser online event
     */
    private async handleOnline(): Promise<void> {
        console.log('Browser reports online status');
        this.isOnline = true;

        try {
            await this.resetConnection();
            this.notifyListeners(true);
        } catch (error) {
            console.error('Error handling online status:', error);
        }
    }

    /**
     * Handle browser offline event
     */
    private async handleOffline(): Promise<void> {
        console.log('Browser reports offline status');
        this.isOnline = false;

        try {
            await this.disableNetwork();
            this.notifyListeners(false);
        } catch (error) {
            console.error('Error handling offline status:', error);
        }
    }

    /**
     * Handle JavaScript error events to detect Firestore issues
     */
    private handleError(event: ErrorEvent): boolean | undefined {
        const errorMessage = event.message || '';

        // Check for Firestore-specific error messages
        if (
            errorMessage.includes('already-exists') ||
            errorMessage.includes('Target ID already exists') ||
            errorMessage.includes('Could not reach Cloud Firestore backend') ||
            errorMessage.includes('The operation could not be completed') ||
            errorMessage.includes('Failed to get document') ||
            errorMessage.includes('FirebaseError') ||
            errorMessage.includes('code=unavailable')
        ) {
            console.warn('Detected Firestore connection error:', errorMessage);

            // Prevent the error from showing in console
            event.preventDefault();

            // Attempt to reset the connection
            this.resetConnection();

            return false;
        }

        return undefined;
    }

    /**
     * Update Firestore network state based on online status
     */
    private async updateNetworkState(online: boolean): Promise<void> {
        if (online) {
            await this.enableNetwork();
        } else {
            await this.disableNetwork();
        }
    }

    /**
     * Enable Firestore network access
     */
    private async enableNetwork(): Promise<void> {
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
     */
    private async disableNetwork(): Promise<void> {
        try {
            console.log('Disabling Firestore network');
            await disableNetwork(db);
        } catch (error) {
            console.error('Error disabling Firestore network:', error);
            throw error;
        }
    }

    /**
     * Reset the Firestore connection by temporarily disabling then enabling the network
     */
    public async resetConnection(): Promise<boolean> {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }

        try {
            console.log('Attempting to reset Firestore connection...');

            // First disable network
            await this.disableNetwork();

            // Wait a moment for disconnect to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Then enable network again
            await this.enableNetwork();

            console.log('Firestore connection reset successful');
            this.connectionAttempts = 0;

            return true;
        } catch (error) {
            console.error('Error resetting Firestore connection:', error);
            this.connectionAttempts += 1;

            if (this.connectionAttempts < this.maxRetries) {
                console.log(`Retry attempt ${this.connectionAttempts} of ${this.maxRetries}`);

                // Schedule another retry with exponential backoff
                const delay = 1000 * Math.pow(2, this.connectionAttempts);
                this.retryTimeout = setTimeout(() => this.resetConnection(), delay);

                return false;
            } else {
                console.error('Failed to reset Firestore connection after multiple attempts');
                return false;
            }
        }
    }

    /**
     * Clean up resources when the application is unmounted
     */
    public cleanup(): void {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline.bind(this));
            window.removeEventListener('offline', this.handleOffline.bind(this));
            window.removeEventListener('error', this.handleError.bind(this));
        }

        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
        }

        this.connectionListeners.clear();
    }
}

export const firebaseConnectionManager = FirebaseConnectionManager.getInstance();
