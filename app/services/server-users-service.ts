'use server';

import { usersService } from './users';
import { UserRole, UserStatus } from '../types/user';
import type { UserData as User } from '../types/user';
import type { User as FirebaseUser } from 'firebase/auth';

// Server-side wrapper with server-only operations
export const serverUsersService = {
    // Core operations
    createUserIfNotExists: (firebaseUser: FirebaseUser) =>
        usersService.createUserIfNotExists(firebaseUser),

    getUser: (uid: string) =>
        usersService.getUser(uid),

    getAllUsers: () =>
        usersService.getAllUsers(),

    // Admin operations
    updateUser: (uid: string, updates: {
        displayName?: string;
        role?: UserRole;
        status?: UserStatus;
        photoURL?: string | null;
    }) => usersService.updateUser(uid, updates),

    deleteUser: (uid: string) =>
        usersService.deleteUser(uid),

    // Role management  
    updateUserRole: (uid: string, role: UserRole) =>
        usersService.updateUserRole(uid, role),

    updateUserStatus: (uid: string, status: UserStatus) =>
        usersService.updateUserStatus(uid, status),

    // Invitation handling
    inviteUser: (adminEmail: string, targetEmail: string, role: UserRole) =>
        usersService.inviteUser(adminEmail, targetEmail, role),

    resetUserPassword: (email: string) =>
        usersService.resetUserPassword(email)
} as const;