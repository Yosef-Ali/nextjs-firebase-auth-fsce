import { db } from "@/lib/firebase";
import { firestoreManager } from "@/lib/firestore-manager";
import { User, UserRole, UserStatus, UserMetadata } from "../../types/user";
import { convertToAppUser } from "../../utils/user-utils";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  DocumentReference,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { deleteUser as deleteAuthUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Admin emails array
const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'dev.yosef@gmail.com',
  'yaredd.degefu@gmail.com',
  'mekdesyared@gmail.com'
].filter(Boolean) as string[];

const USERS_COLLECTION = "users";

function createBaseUser(data: Partial<User>): User {
  const now = Date.now();
  return {
    uid: data.uid || '',
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || null,
    role: data.role || UserRole.USER,
    status: data.status || UserStatus.ACTIVE,
    emailVerified: data.emailVerified || false,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    isAnonymous: false,
    id: data.uid || '',
    metadata: {
      lastLogin: data.metadata?.lastLogin || now,
      createdAt: data.metadata?.createdAt || now,
      role: data.role || UserRole.USER,
      status: data.status || UserStatus.ACTIVE,
      displayName: data.displayName || '',
      email: data.email || '',
      photoURL: data.photoURL || null,
      uid: data.uid || '',
      emailVerified: data.emailVerified || false,
      providerData: data.providerData || [],
      refreshToken: data.refreshToken,
      phoneNumber: data.phoneNumber || null,
      tenantId: data.tenantId || null
    },
    providerData: [],
    refreshToken: data.refreshToken,
    tenantId: data.tenantId || null,
    phoneNumber: data.phoneNumber || null,
    invitedBy: data.invitedBy || null,
    invitationToken: data.invitationToken || null
  };
}

class UserCoreService {
  readonly usersRef = collection(db, USERS_COLLECTION);

  private getUserRef(uid: string): DocumentReference {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }
    return doc(this.usersRef, uid);
  }

  async getUser(uid: string): Promise<User | null> {
    if (!uid?.trim()) {
      console.warn("Invalid user ID provided to getUser");
      return null;
    }

    try {
      const userDoc = await getDoc(this.getUserRef(uid));
      if (!userDoc.exists()) return null;

      const data = userDoc.data();
      const user = convertToAppUser({ ...data, uid: userDoc.id });
      return user as User;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  async createOrUpdateUser(
    uid: string,
    userData: Partial<User>
  ): Promise<void> {
    if (!uid?.trim()) {
      throw new Error("Valid User ID is required");
    }

    try {
      const now = Date.now();
      const existingUser = await this.getUser(uid);
      const userRef = this.getUserRef(uid);

      const metadata: UserMetadata = {
        lastLogin: userData.metadata?.lastLogin || now,
        createdAt: existingUser?.metadata?.createdAt || now,
        role: userData.role || existingUser?.role || UserRole.USER,
        status: userData.status || existingUser?.status || UserStatus.ACTIVE,
        displayName: userData.displayName || existingUser?.displayName || '',
        email: userData.email || existingUser?.email || '',
        photoURL: userData.photoURL || existingUser?.photoURL || null,
        uid: uid,
        emailVerified: userData.emailVerified || existingUser?.emailVerified || false,
        providerData: userData.providerData || existingUser?.providerData || [],
        refreshToken: userData.refreshToken || existingUser?.refreshToken,
        phoneNumber: userData.phoneNumber || existingUser?.phoneNumber || null,
        tenantId: userData.tenantId || existingUser?.tenantId || null
      };

      const updatedData = {
        ...userData,
        uid,
        updatedAt: now,
        createdAt: existingUser?.createdAt || userData.createdAt || now,
        role: userData.role || existingUser?.role || UserRole.USER,
        status: userData.status || existingUser?.status || UserStatus.ACTIVE,
        metadata
      };

      await setDoc(userRef, updatedData, { merge: true });
    } catch (error) {
      console.error("Error creating/updating user:", error);
      throw error;
    }
  }

  async getCurrentUser(firebaseUser: FirebaseUser | null): Promise<User | null> {
    if (!firebaseUser?.uid) return null;

    try {
      const userRef = this.getUserRef(firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const now = Date.now();
        const newUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          photoURL: firebaseUser.photoURL || null,
          emailVerified: firebaseUser.emailVerified,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          isAnonymous: false,
          id: firebaseUser.uid,
          createdAt: now,
          updatedAt: now,
          invitedBy: null,
          invitationToken: null,
          metadata: {
            lastLogin: now,
            createdAt: now,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            displayName: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || null,
            uid: firebaseUser.uid,
            emailVerified: firebaseUser.emailVerified,
            providerData: firebaseUser.providerData || [],
            refreshToken: firebaseUser.refreshToken || '',
            phoneNumber: firebaseUser.phoneNumber || null,
            tenantId: firebaseUser.tenantId || null
          }
        };
        await setDoc(userRef, newUser);
        return newUser;
      }

      return userDoc.data() as User;
    } catch (error) {
      console.error("Error getting current user:", error);
      throw error;
    }
  }

  async updateUserStatus(uid: string, status: UserStatus): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!uid?.trim()) {
      return {
        success: false,
        error: "Valid User ID is required",
        details: { uid }
      };
    }
    try {
      const userRef = this.getUserRef(uid);
      const existingUser = await this.getUser(uid);
      if (!existingUser) {
        return {
          success: false,
          error: `User with ID ${uid} not found`,
          details: { uid }
        };
      }

      const now = Date.now();
      const metadata: UserMetadata = {
        ...existingUser.metadata,
        lastLogin: existingUser.metadata?.lastLogin || now,
        createdAt: existingUser.metadata?.createdAt || now,
        role: existingUser.role,
        status,
        displayName: existingUser.displayName,
        email: existingUser.email,
        photoURL: existingUser.photoURL,
        uid: existingUser.uid,
        emailVerified: existingUser.emailVerified,
        providerData: existingUser.providerData || [],
        refreshToken: existingUser.refreshToken,
        phoneNumber: existingUser.phoneNumber,
        tenantId: existingUser.tenantId
      };

      await updateDoc(userRef, {
        status,
        updatedAt: now,
        metadata
      });

      return {
        success: true,
        details: {
          uid,
          previousStatus: existingUser.status,
          newStatus: status
        }
      };
    } catch (error) {
      console.error("Error updating user status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update user status",
        details: { uid, status }
      };
    }
  }

  async getAllUsers(): Promise<{ success: boolean; data?: User[]; error?: string }> {
    try {
      const snapshot = await getDocs(this.usersRef);
      const users = snapshot.docs
        .map((doc) => {
          try {
            return convertToAppUser({ ...doc.data(), uid: doc.id }) as User;
          } catch (error) {
            console.error(`Error mapping user document ${doc.id}:`, error);
            return null;
          }
        })
        .filter((user): user is User => user !== null);

      return { success: true, data: users };
    } catch (error) {
      console.error("Error getting all users:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users"
      };
    }
  }

  async updateUserRole(uid: string, newRole: UserRole): Promise<void> {
    if (!uid) throw new Error("Valid user ID required");

    try {
      const userRef = this.getUserRef(uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error(`User with ID ${uid} not found`);
      }

      const currentData = userDoc.data() as User;

      // Prevent downgrading SUPER_ADMIN
      if (currentData.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
        throw new Error("Cannot modify SUPER_ADMIN role");
      }

      await setDoc(userRef, {
        ...currentData,
        role: newRole,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating user role:", error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<{ success: boolean; error?: string; details?: any }> {
    if (!uid?.trim()) {
      return {
        success: false,
        error: "Valid User ID is required",
        details: { uid }
      };
    }

    try {
      const userRef = this.getUserRef(uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          error: `User document not found for ID: ${uid}`,
          details: { uid }
        };
      }

      // Delete from Firestore first
      await deleteDoc(userRef);

      return { success: true };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete user",
        details: { uid }
      };
    }
  }

  async createUserIfNotExists(firebaseUser: FirebaseUser): Promise<User | null> {
    if (!firebaseUser?.uid) {
      console.warn("No user ID provided to createUserIfNotExists");
      return null;
    }

    try {
      // Reset Firestore connection to clear any existing target IDs before making queries
      await firestoreManager.resetConnection();

      const userRef = this.getUserRef(firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      const now = Date.now();

      // Check if user already exists
      if (userDoc.exists()) {
        const existingData = userDoc.data() as User;

        // Update role if email is in admin list
        if (firebaseUser.email &&
          ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase()) &&
          existingData.role !== UserRole.SUPER_ADMIN &&
          existingData.role !== UserRole.ADMIN) {
          const updatedData: User = {
            ...existingData,
            role: UserRole.ADMIN,
            updatedAt: now,
            metadata: {
              ...existingData.metadata,
              lastLogin: now,
              role: UserRole.ADMIN,
              status: existingData.status,
              displayName: existingData.displayName || '',
              email: existingData.email || '',
              photoURL: existingData.photoURL || null,
              uid: existingData.uid,
              emailVerified: existingData.emailVerified,
              providerData: existingData.providerData || [],
              refreshToken: existingData.refreshToken || '',
              phoneNumber: existingData.phoneNumber || null,
              tenantId: existingData.tenantId || null
            }
          };
          await setDoc(userRef, updatedData, { merge: true });
          return updatedData;
        }

        return existingData;
      }

      // Create new user
      const userData: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        photoURL: firebaseUser.photoURL || null,
        emailVerified: firebaseUser.emailVerified,
        role: firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
          ? UserRole.ADMIN
          : UserRole.USER,
        status: UserStatus.ACTIVE,
        isAnonymous: false,
        id: firebaseUser.uid,
        createdAt: now,
        updatedAt: now,
        invitedBy: null,
        invitationToken: null,
        metadata: {
          lastLogin: now,
          createdAt: now,
          role: firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase())
            ? UserRole.ADMIN
            : UserRole.USER,
          status: UserStatus.ACTIVE,
          displayName: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || null,
          uid: firebaseUser.uid,
          emailVerified: firebaseUser.emailVerified,
          providerData: firebaseUser.providerData,
          refreshToken: firebaseUser.refreshToken,
          phoneNumber: firebaseUser.phoneNumber,
          tenantId: firebaseUser.tenantId
        }
      };

      await setDoc(userRef, userData);
      return userData;
    } catch (error) {
      console.error('Error in createUserIfNotExists:', error);
      throw error;
    }
  }
}

export const userCoreService = new UserCoreService();

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', id));
    if (!userDoc.exists()) return null;
    const data = userDoc.data();
    return createBaseUser({ ...data, uid: userDoc.id });
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return createBaseUser({ ...doc.data(), uid: doc.id });
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

export async function createNewUser(email: string, role: UserRole = UserRole.USER): Promise<User> {
  const now = Date.now();
  const displayName = email.split('@')[0];

  const userData: User = createBaseUser({
    uid: '',
    email,
    displayName,
    photoURL: null,
    emailVerified: false,
    role,
    status: UserStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
    metadata: {
      lastLogin: now,
      createdAt: now,
      role,
      status: UserStatus.ACTIVE,
      displayName,
      email,
      photoURL: null,
      uid: '',
      emailVerified: false,
      providerData: [],
      refreshToken: '',
      phoneNumber: null,
      tenantId: null
    }
  });
  return userData;
}