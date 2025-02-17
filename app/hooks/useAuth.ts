import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
import { AuthError, handleAuthError } from '@/app/lib/auth-errors';

export interface AuthUser extends FirebaseUser {
    role?: UserRole;
    status?: UserStatus;
}

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userData, setUserData] = useState<UserMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AuthError | null>(null);
    const router = useRouter();
    const unsubscribeRef = useRef<(() => void) | undefined>();

    const createUserMetadata = (
        firebaseUser: FirebaseUser,
        userData: User
    ): UserMetadata => {
        const now = Date.now();
        return {
            lastLogin: now,
            createdAt: userData.createdAt || now,
            role: userData.role || UserRole.USER,
            status: userData.status || UserStatus.ACTIVE,
            displayName: userData.displayName || firebaseUser.displayName || '',
            email: userData.email || firebaseUser.email || '',
            photoURL: userData.photoURL || firebaseUser.photoURL,
            uid: firebaseUser.uid,
            emailVerified: firebaseUser.emailVerified,
            providerData: firebaseUser.providerData,
            refreshToken: firebaseUser.refreshToken || '',
            phoneNumber: firebaseUser.phoneNumber,
            tenantId: firebaseUser.tenantId
        };
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        let mounted = true;

        const setupAuthListener = () => {
            try {
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (!mounted) return;

                    try {
                        setError(null);
                        if (firebaseUser) {
                            const userData = await usersService.createUserIfNotExists(firebaseUser);

                            if (userData && mounted) {
                                const authUser = {
                                    ...firebaseUser,
                                    role: userData.role,
                                    status: userData.status
                                } as AuthUser;
                                setUser(authUser);
                                setUserData(createUserMetadata(firebaseUser, userData));
                            }
                        } else {
                            if (mounted) {
                                setUser(null);
                                setUserData(null);
                            }
                        }
                    } catch (error) {
                        if (mounted) {
                            console.error('Auth state change error:', error);
                            setError(error as AuthError);
                        }
                    } finally {
                        if (mounted) {
                            setLoading(false);
                        }
                    }
                });

                unsubscribeRef.current = unsubscribe;
                return unsubscribe;
            } catch (error) {
                console.error('Auth listener setup error:', error);
                if (mounted) {
                    setError(error as AuthError);
                    setLoading(false);
                }
                return () => { };
            }
        };

        const unsubscribe = setupAuthListener();

        return () => {
            mounted = false;
            if (typeof unsubscribe === 'function') {
                try {
                    unsubscribe();
                } catch (error) {
                    console.warn('Auth cleanup warning:', error);
                }
            }
            if (unsubscribeRef.current) {
                try {
                    unsubscribeRef.current();
                } catch (error) {
                    console.warn('Ref cleanup warning:', error);
                }
            }
        };
    }, []);

    const signIn = async (email: string, password: string): Promise<UserMetadata> => {
        try {
            setError(null);
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            const metadata = createUserMetadata(result.user, userData);
            return metadata;
        } catch (error: any) {
            const authError = handleAuthError(error);
            setError(authError);
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
            const authError = handleAuthError(error);
            setError(authError);
            throw authError;
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
            const metadata = createUserMetadata(result.user, userData);
            return {
                userCredential: result,
                userData: metadata
            };
        } catch (error) {
            const authError = handleAuthError(error);
            setError(authError);
            throw authError;
        }
    };

    const resetPassword = async (email: string): Promise<void> => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            const authError = handleAuthError(error);
            setError(authError);
            throw authError;
        }
    };

    const signOut = async () => {
        try {
            setError(null);
            await firebaseSignOut(auth);
            router.replace('/sign-in');
        } catch (error) {
            const authError = handleAuthError(error);
            setError(authError);
            throw authError;
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
