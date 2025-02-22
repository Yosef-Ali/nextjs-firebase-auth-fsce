import { User as FirebaseUser, IdTokenResult } from 'firebase/auth';

export const useFirebaseUser = (firebaseUser: FirebaseUser | null) => {
    const getIdToken = async (forceRefresh = false): Promise<string> => {
        if (!firebaseUser) throw new Error('No firebase user');
        return firebaseUser.getIdToken(forceRefresh);
    };

    const getIdTokenResult = async (forceRefresh = false): Promise<IdTokenResult> => {
        if (!firebaseUser) throw new Error('No firebase user');
        return firebaseUser.getIdTokenResult(forceRefresh);
    };

    const reload = async (): Promise<void> => {
        if (!firebaseUser) throw new Error('No firebase user');
        return firebaseUser.reload();
    };

    const deleteUser = async (): Promise<void> => {
        if (!firebaseUser) throw new Error('No firebase user');
        return firebaseUser.delete();
    };

    const toJSON = (): object => {
        if (!firebaseUser) throw new Error('No firebase user');
        return firebaseUser.toJSON() as object;
    };

    return {
        getIdToken,
        getIdTokenResult,
        reload,
        delete: deleteUser,
        toJSON,
    } as const;
};