import { auth } from '@/app/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export async function getCurrentUser(): Promise<User> {
  const user = await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  return user;
}
