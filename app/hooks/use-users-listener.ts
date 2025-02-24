import { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUser, UserRole, UserStatus } from '../types/user';
import { convertToAppUser } from '../utils/user-utils';

export function useUsersListener() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const setupListener = () => {
      try {
        // Clear any existing listener
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }

        // Create a query for the users collection
        const usersQuery = query(collection(db, 'users'));

        // Set up real-time listener
        const unsubscribe = onSnapshot(
          usersQuery,
          (snapshot) => {
            if (!mounted) return;

            const updatedUsers = snapshot.docs.map(doc => {
              const userData = doc.data();
              const baseUser = convertToAppUser({ ...userData, uid: doc.id } as any);
              if (baseUser) {
                baseUser.role = userData.role || UserRole.USER;
                baseUser.status = userData.status || UserStatus.ACTIVE;
              }
              return baseUser;
            });

            setUsers(updatedUsers.filter(user => user !== null) as AppUser[]);
            setIsLoading(false);
            setError(null);
          },
          (error) => {
            console.error('Error in users listener:', error);
            if (mounted) {
              setError(error.message);
              setIsLoading(false);
            }
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (error) {
        console.error('Error setting up users listener:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    };

    setupListener();

    return () => {
      mounted = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  return { users, isLoading, error };
}
