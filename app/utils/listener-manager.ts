/**
 * Utility to manage Firestore listeners and prevent duplicate listeners
 * and "Target ID already exists" errors
 */

type UnsubscribeFunction = () => void;

interface ListenerInfo {
  unsubscribe: UnsubscribeFunction;
  timestamp: number;
}

class ListenerManager {
  private static instance: ListenerManager;
  private listeners: Map<string, ListenerInfo> = new Map();
  private isCleaningUp: boolean = false;

  private constructor() {
    // Set up global error handler for Firestore errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleError.bind(this));

      // Handle page visibility changes to clean up listeners when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.cleanupListeners();
        }
      });

      // Handle online/offline transitions
      window.addEventListener('online', () => {
        console.log('App is online. Cleaning up listeners...');
        this.cleanupListeners();
        // Reload the page after a short delay
        setTimeout(() => window.location.reload(), 1000);
      });
    }
  }

  public static getInstance(): ListenerManager {
    if (!ListenerManager.instance) {
      ListenerManager.instance = new ListenerManager();
    }
    return ListenerManager.instance;
  }

  /**
   * Register a listener with a unique key
   * @param key Unique identifier for the listener
   * @param unsubscribe Function to unsubscribe the listener
   * @returns The unsubscribe function
   */
  public registerListener(key: string, unsubscribe: UnsubscribeFunction): UnsubscribeFunction {
    // If a listener with this key already exists, unsubscribe it first
    this.unregisterListener(key);

    // Register the new listener
    this.listeners.set(key, {
      unsubscribe,
      timestamp: Date.now()
    });

    // Return a wrapped unsubscribe function that also removes from our registry
    return () => {
      this.unregisterListener(key);
    };
  }

  /**
   * Unregister a listener by key
   * @param key Unique identifier for the listener
   */
  public unregisterListener(key: string): void {
    const listener = this.listeners.get(key);
    if (listener) {
      try {
        listener.unsubscribe();
      } catch (error) {
        console.warn(`Error unsubscribing listener ${key}:`, error);
      }
      this.listeners.delete(key);
    }
  }

  /**
   * Unregister all listeners
   */
  public unregisterAll(): void {
    console.log(`Unregistering all ${this.listeners.size} listeners`);

    this.listeners.forEach((listener, key) => {
      try {
        listener.unsubscribe();
      } catch (error) {
        console.warn(`Error unsubscribing listener ${key}:`, error);
      }
    });
    this.listeners.clear();
  }

  /**
   * Handle global errors and detect Firestore "Target ID already exists" errors
   */
  private handleError(event: ErrorEvent): boolean {
    const errorMessage = event.message || '';

    // Check if this is a Firestore "already-exists" error
    if (errorMessage.includes('already-exists') || errorMessage.includes('Target ID already exists')) {
      console.warn('Detected Firestore listener conflict. Cleaning up listeners...');

      // Clean up listeners and reload the page
      this.cleanupListeners();

      // Prevent the error from showing in the console
      event.preventDefault();

      // Reload the page after a short delay
      setTimeout(() => window.location.reload(), 1000);

      return false;
    }

    return true;
  }

  /**
   * Clean up all listeners and prepare for page reload
   */
  private cleanupListeners(): void {
    // Prevent multiple simultaneous cleanups
    if (this.isCleaningUp) return;

    this.isCleaningUp = true;

    try {
      // Unregister all listeners
      this.unregisterAll();

      // Clear any cached data
      if (typeof window !== 'undefined' && window.caches) {
        window.caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            if (cacheName.includes('firestore')) {
              window.caches.delete(cacheName);
            }
          });
        });
      }
    } catch (error) {
      console.error('Error cleaning up listeners:', error);
    } finally {
      this.isCleaningUp = false;
    }
  }

  /**
   * Check if a listener with the given key exists
   * @param key Unique identifier for the listener
   * @returns True if the listener exists
   */
  public hasListener(key: string): boolean {
    return this.listeners.has(key);
  }

  /**
   * Get the number of active listeners
   * @returns Number of active listeners
   */
  public getListenerCount(): number {
    return this.listeners.size;
  }
}

export const listenerManager = ListenerManager.getInstance();
