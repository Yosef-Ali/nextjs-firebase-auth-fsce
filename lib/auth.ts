import { getAuth } from 'firebase/auth';
import {
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { app } from '@/lib/firebase';

const auth = getAuth(app);

// Set persistence to LOCAL (survives browser restarts)
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});

export { auth };
