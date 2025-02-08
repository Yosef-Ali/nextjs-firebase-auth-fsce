import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { usersService } from '@/app/services/users';
import {
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    GoogleAuthProvider,
    signInWithPopup,
    createUserWithEmailAndPassword,
    UserCredential,
    sendPasswordResetEmail
} from 'firebase/auth';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
    status?: UserStatus;
}

interface AuthError extends Error {
    code?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    userData: UserMetadata | null;
    loading: boolean;
    error: Error | null;
    signIn: (email: string, password: string) => Promise<UserMetadata>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    signUp: (email: string, password: string, displayName: string) => Promise<{ userCredential: UserCredential; userData: UserMetadata }>;
    resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): AuthContextType {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);
    const router = useRouter();

    const createUserMetadata = (
        firebaseUser: FirebaseUser,
        userData: User
    ): UserMetadata => {
        const now = Date.now();
        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userData.role,
            status: userData.status,
            displayName: userData.displayName || firebaseUser.displayName,
            photoURL: userData.photoURL || firebaseUser.photoURL,
            metadata: {
                lastLogin: now,
                createdAt: userData.createdAt || now
            }
        };
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setError(null);
                if (firebaseUser) {
                    const userData = await usersService.createUserIfNotExists(firebaseUser);
                    if (userData) {
                        const authUser = {
                            ...firebaseUser,
                            role: userData.role,
                            status: userData.status
                        } as AuthUser;

                        const userMetadata = createUserMetadata(firebaseUser, userData);

                        setUser(authUser);
                        setUserData(userMetadata);
                    } else {
                        setUser(null);
                        setUserData(null);
                    }
                } else {
                    setUser(null);
                    setUserData(null);
                }
            } catch (err) {
                console.error('Error in auth state change:', err);
                setError(err as AuthError);
                setUser(null);
                setUserData(null);
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleAuthError = (error: any) => {
        console.error('Authentication error:', error);
        setError(error as AuthError);
        throw error;
    };

    const signIn = async (email: string, password: string): Promise<UserMetadata> => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            // Set user and userData state immediately after successful sign in
            const authUser = {
                ...result.user,
                role: userData.role,
                status: userData.status
            } as AuthUser;
            setUser(authUser);
            const metadata = createUserMetadata(result.user, userData);
            setUserData(metadata);
            return metadata;
        } catch (error: any) {
            // Handle specific Firebase auth errors
            const errorMessage = error.code === 'auth/user-not-found' ? 'No account found with this email' :
                error.code === 'auth/wrong-password' ? 'Incorrect password' :
                    error.code === 'auth/invalid-email' ? 'Invalid email format' :
                        error.code === 'auth/too-many-requests' ? 'Too many attempts. Please try again later' :
                            'Failed to sign in';
            const authError = {
                message: errorMessage,
                name: 'AuthError',
                code: error.code
            } as AuthError;
            throw authError;
        }
    };

    const signUp = async (email: string, password: string, displayName: string): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            setError(null);
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create user data');
            }
            return {
                userCredential: result,
                userData: createUserMetadata(result.user, userData)
            };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const signInWithGoogle = async (): Promise<{ userCredential: UserCredential; userData: UserMetadata }> => {
        try {
            setError(null);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            return {
                userCredential: result,
                userData: createUserMetadata(result.user, userData)
            };
        } catch (error) {
            return handleAuthError(error);
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            handleAuthError(error);
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            router.replace('/sign-in');
        } catch (error) {
            handleAuthError(error);
        }
    };

    return {
        user,
        userData,
        loading,
        error,
        signIn,
        signOut,
        signInWithGoogle,
        signUp,
        resetPassword
    };
}