import { useState, useEffect, useRef } from 'react';
import { Query, onSnapshot } from 'firebase/firestore';
import { listenerManager } from '@/app/utils/listener-manager';

export function useFirestoreQuery<T>(query: Query) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const queryKey = useRef<string>(`query_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    setLoading(true);

    try {
      // Create a unique key for this query
      const key = queryKey.current;

      // Set up the listener
      const unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          try {
            const results: T[] = [];
            snapshot.forEach((doc) => {
              results.push({
                id: doc.id,
                ...doc.data(),
              } as T);
            });
            setData(results);
            setLoading(false);
          } catch (err) {
            console.error('Error processing snapshot:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
            setLoading(false);
          }
        },
        (err) => {
          // Ignore already-exists errors
          if (err.code === 'already-exists') {
            console.warn('Ignoring already-exists error for query');
            return;
          }
          console.error('Firestore subscription error:', err);
          setError(err);
          setLoading(false);
        }
      );

      // Register with the listener manager
      const managedUnsubscribe = listenerManager.registerListener(key, unsubscribe);

      // Cleanup subscription on unmount
      return () => {
        managedUnsubscribe();
      };
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, [query]);

  return { data, loading, error };
}