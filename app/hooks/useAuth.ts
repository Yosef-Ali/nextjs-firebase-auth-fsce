import { UserRole, UserStatus, UserMetadata, User } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
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
    sendPasswordResetEmail,
    updateProfile
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
    const unsubscribeRef = useRef<(() => void) | null>(null);
    const processingUserRef = useRef<string | null>(null); // Ref to track processing UID

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
            phoneNumber: firebaseUser.phoneNumber || null,
            tenantId: firebaseUser.tenantId || null
        };
    };

    useEffect(() => {
        let mounted = true;
        // console.log('Setting up auth listener effect...');

        // Ensure listener is only set up once using the ref
        // Note: This check might be redundant if the dependency array is empty,
        // but can be useful if dependencies are added later.
        // if (unsubscribeRef.current) {
        //   console.log('Auth listener already exists, skipping setup.');
        //   if (loading && mounted) setLoading(false); // Ensure loading is false if already initialized
        //   return; // Decide if returning early is desired behavior
        // }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!mounted) {
                // console.log('Component unmounted, ignoring auth state change.');
                return;
            }

            const currentUid = firebaseUser?.uid || null;

            // Avoid processing if already processing this specific UID
            if (processingUserRef.current === currentUid) {
                // console.log(`Already processing user: ${currentUid}, skipping.`);
                if (!currentUid && loading && mounted) setLoading(false); // Handle loading state if user logs out while processing
                return;
            }

            // console.log(`Processing auth state change for UID: ${currentUid}`);
            processingUserRef.current = currentUid; // Mark this UID as being processed

            try {
                setError(null); // Clear previous errors

                if (firebaseUser) {
                    // User is logged in
                    // console.log(`User logged in: ${firebaseUser.uid}. Fetching/creating data...`);
                    const userDataResult = await usersService.createUserIfNotExists(firebaseUser);
                    // console.log(`User data result for ${firebaseUser.uid}:`, userDataResult);

                    // Check mount status *after* async operation
                    if (!mounted) {
                        // console.log('Component unmounted during user data fetch.');
                        processingUserRef.current = null; // Clear processing flag if unmounted
                        return;
                    }

                    if (userDataResult) {
                        // Successfully got user data
                        const authUser: AuthUser = {
                            ...firebaseUser,
                            role: userDataResult.role,
                            status: userDataResult.status,
                        };
                        const metadata = createUserMetadata(firebaseUser, userDataResult);
                        // console.log(`Setting user state for ${firebaseUser.uid}`);
                        setUser(authUser);
                        setUserData(metadata);
                    } else {
                        // Handle case where createUserIfNotExists returns null unexpectedly
                        // This might happen if the function has an error path returning null
                        console.warn(`createUserIfNotExists returned null for user ${firebaseUser.uid}`);
                        setUser(null); // Reset user state
                        setUserData(null);
                        // Optionally set an error state here if this is unexpected
                        // setError(new Error(`Failed to process user data for ${firebaseUser.uid}`));
                    }
                } else {
                    // User is null (logged out)
                    // console.log('User logged out.');
                    setUser(null);
                    setUserData(null);
                }
            } catch (error) {
                console.error('Error during auth state change processing:', error);
                if (mounted) {
                    setError(error as AuthError); // Set error state
                }
            } finally {
                // console.log(`Finished processing auth state change for UID: ${currentUid}`);
                // Clear processing flag only if it still matches the UID we started with
                if (processingUserRef.current === currentUid) {
                    processingUserRef.current = null;
                }
                // Ensure loading is set to false once processing is done or fails
                if (mounted && loading) {
                    // console.log('Setting loading to false.');
                    setLoading(false);
                }
            }
        });

        unsubscribeRef.current = unsubscribe;
        // console.log('Auth listener subscribed.');

        // Cleanup function
        return () => {
            // console.log('Cleaning up auth listener effect...');
            mounted = false;
            processingUserRef.current = null; // Clear processing flag on unmount
            if (unsubscribeRef.current) {
                // console.log('Unsubscribing auth listener.');
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            } else {
                // console.log('No auth listener ref to unsubscribe.');
            }
        };
    }, []); // Keep dependency array empty for run-once behavior

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
                    'Failed to sign in';
            setError({ ...error, message: errorMessage } as AuthError);
            throw error;
        }
    };

    const signOut = async (): Promise<void> => {
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
            setUser(result.user as AuthUser);
            setUserData(metadata);
            return { userCredential: result, userData: metadata };
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
            await updateProfile(result.user, { displayName });
            const userData = await usersService.createUserIfNotExists(result.user);
            if (!userData) {
                throw new Error('Failed to create or fetch user data');
            }
            const metadata = createUserMetadata(result.user, userData);
            setUser(result.user as AuthUser);
            setUserData(metadata);
            return { userCredential: result, userData: metadata };
        } catch (error: any) {
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
