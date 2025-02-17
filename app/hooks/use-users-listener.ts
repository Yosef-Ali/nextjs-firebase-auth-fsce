import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUser, UserRole, UserStatus } from '../types/user';
import { convertToAppUser } from '../utils/user-utils';

export function useUsersListener() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    // Create a query for the users collection
    const usersQuery = query(collection(db, 'users'));

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
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
        setError(error.message);
        setIsLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return { users, isLoading, error };
}
