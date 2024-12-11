import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { CreateUserData, UpdateUserData, UserOperationResult, UserRole } from './types';

const db = admin.firestore();
const auth = admin.auth();

export async function createUser(data: CreateUserData): Promise<UserOperationResult> {
  try {
    const userDoc = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(data.uid).set(userDoc);
    return { success: true, data: { userId: data.uid } };
  } catch (error) {
    console.error('Error creating user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function updateUser(
  uid: string, 
  data: UpdateUserData
): Promise<UserOperationResult> {
  try {
    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('users').doc(uid).update(updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function deleteUser(uid: string): Promise<UserOperationResult> {
  try {
    // Delete from Authentication
    await auth.deleteUser(uid);
    // Delete from Firestore
    await db.collection('users').doc(uid).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function updateUserRole(
  uid: string, 
  role: UserRole
): Promise<UserOperationResult> {
  return updateUser(uid, { role });
}

export async function getUserById(uid: string): Promise<UserOperationResult> {
  try {
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return { 
        success: false, 
        error: 'User not found' 
      };
    }
    return { 
      success: true, 
      data: { id: userDoc.id, ...userDoc.data() } 
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
