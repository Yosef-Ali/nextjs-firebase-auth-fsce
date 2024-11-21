import { db } from '@/lib/firebase';
import { collection, doc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc, getDoc, Timestamp, FirestoreError } from 'firebase/firestore';
import { BoardMember, BoardMemberFormData } from '../types/board-member';

const COLLECTION = 'board-members';

class BoardMemberService {
  async getBoardMembers(includeUnpublished = false): Promise<BoardMember[]> {
    try {
      console.log('Fetching board members...');
      let q = query(
        collection(db, COLLECTION),
        orderBy('order')  // Single ordering by 'order' field only
      );

      if (!includeUnpublished) {
        // Apply status filter after getting the results to avoid composite index
        const snapshot = await getDocs(q);
        return snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || '',
              position: data.position || '',
              bio: data.bio || '',
              image: data.image || '',
              featured: data.featured || false,
              order: data.order || 0,
              status: data.status || 'draft',
              createdAt: data.createdAt?.toMillis() || Date.now(),
              updatedAt: data.updatedAt?.toMillis() || Date.now(),
            } as BoardMember;
          })
          .filter(member => member.status === 'published');
      }

      const snapshot = await getDocs(q);
      console.log(`Found ${snapshot.docs.length} board members`);

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          position: data.position || '',
          bio: data.bio || '',
          image: data.image || '',
          featured: data.featured || false,
          order: data.order || 0,
          status: data.status || 'draft',
          createdAt: data.createdAt?.toMillis() || Date.now(),
          updatedAt: data.updatedAt?.toMillis() || Date.now(),
        } as BoardMember;
      });
    } catch (error) {
      console.error('Error fetching board members:', error);
      if (error instanceof FirestoreError) {
        console.error('Firestore error code:', error.code);
        console.error('Firestore error message:', error.message);
      }
      throw error;
    }
  }

  async getBoardMember(id: string): Promise<BoardMember | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || '',
        position: data.position || '',
        bio: data.bio || '',
        image: data.image || '',
        featured: data.featured || false,
        order: data.order || 0,
        status: data.status || 'draft',
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as BoardMember;
    } catch (error) {
      console.error('Error fetching board member:', error);
      if (error instanceof FirestoreError) {
        console.error('Firestore error code:', error.code);
        console.error('Firestore error message:', error.message);
      }
      throw error;
    }
  }

  async createBoardMember(data: BoardMemberFormData): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating board member:', error);
      if (error instanceof FirestoreError) {
        console.error('Firestore error code:', error.code);
        console.error('Firestore error message:', error.message);
      }
      throw error;
    }
  }

  async updateBoardMember(id: string, data: Partial<BoardMemberFormData>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating board member:', error);
      if (error instanceof FirestoreError) {
        console.error('Firestore error code:', error.code);
        console.error('Firestore error message:', error.message);
      }
      throw error;
    }
  }

  async deleteBoardMember(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting board member:', error);
      if (error instanceof FirestoreError) {
        console.error('Firestore error code:', error.code);
        console.error('Firestore error message:', error.message);
      }
      throw error;
    }
  }
}

export const boardMemberService = new BoardMemberService();
