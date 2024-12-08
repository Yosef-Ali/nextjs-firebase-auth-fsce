import { signInWithEmailAndPassword, signInWithPopup as signInWithPopupAuth, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      // Handle popup closed error
      throw new Error('Sign-in popup was closed');
    }
    throw error;
  }
};

// Add popup sign in as fallback
export const signInWithPopup = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return await signInWithPopupAuth(auth, provider);
  } catch (error: any) {
    console.error('Popup sign in error:', error);
    throw error;
  }
};
