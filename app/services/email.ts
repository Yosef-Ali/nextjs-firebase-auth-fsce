import { auth } from '@/app/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  sendEmailVerification,
  ActionCodeSettings,
  signInWithEmailAndPassword
} from 'firebase/auth';

const isDevelopment = process.env.NODE_ENV === 'development';
const BASE_URL = isDevelopment 
  ? 'http://localhost:3000'
  : 'https://nextjs-firebase-auth-fsce.vercel.app';

const getActionCodeSettings = (role: string): ActionCodeSettings => ({
  url: `${BASE_URL}/dashboard?role=${encodeURIComponent(role)}`,
  handleCodeInApp: true
});

// Role descriptions for email content
const roleDescriptions = {
  user: 'You now have access to the FSCE.org platform',
  author: 'You can now create and publish blog posts on FSCE.org',
  admin: 'You now have full administrative access to manage FSCE.org'
};

export const emailService = {
  async sendInvitationEmail(email: string, role: 'user' | 'author' | 'admin'): Promise<boolean> {
    try {
      console.log('Starting invitation process for:', { email, role });
      const actionCodeSettings = getActionCodeSettings(role);
      console.log('Action code settings:', actionCodeSettings);

      // First try to send password reset email
      try {
        await sendPasswordResetEmail(auth, email, actionCodeSettings);
        console.log('Sent password reset email with role:', role);
        return true;
      } catch (error: any) {
        // If user doesn't exist, create them
        if (error.code === 'auth/user-not-found') {
          console.log('Creating new user with role:', role);
          const tempPassword = Math.random().toString(36).slice(-12) + 
                             Math.random().toString(36).slice(-12);
          
          try {
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              email,
              tempPassword
            );
            
            // Send verification email with role
            await sendEmailVerification(userCredential.user, actionCodeSettings);
            console.log('Sent verification email with role:', role);
            
            // Send password reset email with role
            await sendPasswordResetEmail(auth, email, actionCodeSettings);
            console.log('Sent password reset email with role:', role);
            
            return true;
          } catch (createError: any) {
            if (createError.code === 'auth/email-already-in-use') {
              // Race condition: user was created between our check and create
              await sendPasswordResetEmail(auth, email, actionCodeSettings);
              console.log('Handled race condition, sent password reset email with role:', role);
              return true;
            }
            throw createError;
          }
        }
        throw error;
      }
    } catch (error) {
      console.error('Error in invitation process:', error);
      return false;
    }
  },

  async sendRoleUpdateEmail(email: string, newRole: 'user' | 'author' | 'admin'): Promise<boolean> {
    try {
      console.log('Sending role update email:', { email, newRole });
      const settings = getActionCodeSettings(newRole);
      await sendPasswordResetEmail(auth, email, settings);
      return true;
    } catch (error) {
      console.error('Error sending role update email:', error);
      return false;
    }
  }
};
