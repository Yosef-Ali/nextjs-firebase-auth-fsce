'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/app/firebase';

export function useUser() {
  const [user, setUser] = useState<{
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          image: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return { user };
}
