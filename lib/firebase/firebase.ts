import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  // ...existing config...
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure auth settings for development environment
if (process.env.NODE_ENV === 'development') {
  auth.useDeviceLanguage();
}

export { auth };
