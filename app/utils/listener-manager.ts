/**
 * Utility to manage Firestore listeners and prevent duplicate listeners
 */

type UnsubscribeFunction = () => void;

interface ListenerInfo {
  unsubscribe: UnsubscribeFunction;
  timestamp: number;
}

class ListenerManager {
  private static instance: ListenerManager;
  private listeners: Map<string, ListenerInfo> = new Map();

  private constructor() {}

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
