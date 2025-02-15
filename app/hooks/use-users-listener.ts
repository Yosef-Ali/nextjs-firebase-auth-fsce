import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AppUser, User } from '../types/user';
import { convertToAppUser } from '../utils/user-utils';

export function useUsersListener() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, 'users');

    const unsubscribe = onSnapshot(usersRef, snapshot => {
      try {
        const updatedUsers = snapshot.docs.map(doc => {
          const userData = doc.data() as User;
          const now = Date.now();

          const baseUser = {
            ...userData,
            uid: doc.id,
            emailVerified: userData.emailVerified || false,
            metadata: {
              lastLogin: userData.metadata?.lastLogin || now,
              createdAt: userData.metadata?.createdAt || now
            }
          };

          return convertToAppUser(baseUser);
        });

        setUsers(updatedUsers.filter((user): user is AppUser => user !== null));
        setIsLoading(false);
      } catch (error) {
        console.error('Error processing users:', error);
        setIsLoading(false);
      }
    }, error => {
      console.error('Error listening to users:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { users, isLoading };
}
