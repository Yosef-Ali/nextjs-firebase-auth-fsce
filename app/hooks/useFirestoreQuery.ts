import { useState, useEffect } from 'react';
import { Query, onSnapshot } from 'firebase/firestore';

export function useFirestoreQuery<T>(query: Query) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const results: T[] = [];
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data(),
          } as T);
        });
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [query]);

  return { data, loading, error };
}