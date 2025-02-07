import { adminAuth, adminDb } from "../lib/firebase-admin"
import { type User, UserRole, UserStatus } from "../types/user"
import { emailService } from "./email"

export class UsersService {
  private usersCollection = adminDb.collection("users")

  async createUserIfNotExists(user: User): Promise<User | null> {
    try {
      const userRef = this.usersCollection.doc(user.uid)
      const userDoc = await userRef.get()

      if (!userDoc.exists) {
        const userData = {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        await userRef.set(userData)
        return this.mapUser({ id: user.uid, ...userData })
      }

      return this.mapUser({ id: user.uid, ...userDoc.data() })
    } catch (error) {
      console.error("Error in createUserIfNotExists:", error)
      return null
    }
  }

  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await this.usersCollection.doc(uid).get()
      if (!userDoc.exists) return null
      return this.mapUser({ id: uid, ...userDoc.data() })
    } catch (error) {
      console.error("Error getting user:", error)
      return null
    }
  }

  async updateUserRole(uid: string, role: UserRole): Promise<void> {
    try {
      await this.usersCollection.doc(uid).update({
        role,
        updatedAt: new Date().toISOString(),
      })
      await adminAuth.setCustomUserClaims(uid, { role })
    } catch (error) {
      console.error("Error updating user role:", error)
      throw error
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      await adminAuth.deleteUser(uid)
      await this.usersCollection.doc(uid).delete()
    } catch (error) {
      console.error("Error in deleteUser:", error)
      throw error
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const snapshot = await this.usersCollection.get()
      return snapshot.docs.map((doc) => this.mapUser({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error("Error getting all users:", error)
      return []
    }
  }

  async inviteUser(
    adminEmail: string,
    targetEmail: string,
    role: UserRole,
  ): Promise<{ success: boolean; existingUser?: { email: string; role: string } }> {
    try {
      const existingUserQuery = await this.usersCollection.where("email", "==", targetEmail).get()

      if (!existingUserQuery.empty) {
        const existingUserDoc = existingUserQuery.docs[0]
        const existingUserData = existingUserDoc.data()
        return {
          success: false,
          existingUser: {
            email: existingUserData.email,
            role: existingUserData.role,
          },
        }
      }

      const invitationToken = Math.random().toString(36).substring(2, 15)

      const newUserData = {
        email: targetEmail,
        role,
        status: UserStatus.INVITED,
        invitedBy: adminEmail,
        invitationToken,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const newUserRef = await this.usersCollection.add(newUserData)

      const emailSent = await emailService.sendInvitationEmail(targetEmail, role)
      if (!emailSent) {
        await newUserRef.delete()
        throw new Error("Failed to send invitation email")
      }

      return { success: true }
    } catch (error) {
      console.error("Error inviting user:", error)
      throw error
    }
  }

  private mapUser(data: any): User {
    return {
      uid: data.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      role: data.role,
      status: data.status,
      createdAt: new Date(data.createdAt).getTime(),
      updatedAt: new Date(data.updatedAt).getTime(),
      invitedBy: data.invitedBy,
      invitationToken: data.invitationToken,
      emailVerified: data.emailVerified ?? false,
      metadata: data.metadata ?? {},
    }
  }
}

export const usersService = new UsersService()

