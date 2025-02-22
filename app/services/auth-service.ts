import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usersService } from '@/app/services/users-service';

export class AuthService {
    static async signIn(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userData = await usersService.getUser(userCredential.user.uid);
        return { user: userCredential.user, userData };
    }

    static async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const { user } = await usersService.createUserIfNotExists(userCredential.user);
        return { user: userCredential.user, userData: user };
    }

    static async signUp(email: string, password: string, displayName: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = await usersService.createUserIfNotExists(userCredential.user);
        return { user: userCredential.user, userData: user };
    }

    static async resetPassword(email: string) {
        await sendPasswordResetEmail(auth, email);
    }

    static async signOut() {
        await signOut(auth);
    }
}