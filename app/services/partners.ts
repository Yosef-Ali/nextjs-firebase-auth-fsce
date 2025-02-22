import { Partner } from '@/app/types/partner';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const getPartners = async (): Promise<Partner[]> => {
  try {
    const partnersRef = collection(db, 'partners');
    const q = query(partnersRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Partner[];
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
};

export const partnersService = {
  async getPartnerById(partnerId: string): Promise<Partner | null> {
    try {
      const partnerRef = doc(db, 'partners', partnerId);
      const partnerSnap = await getDoc(partnerRef);
      
      if (partnerSnap.exists()) {
        return { 
          id: partnerSnap.id, 
          ...partnerSnap.data() 
        } as Partner;
      }
      return null;
    } catch (error) {
      console.error('Error fetching partner:', error);
      return null;
    }
  },

  async getAllPartners(): Promise<Partner[]> {
    try {
      const partnersCollection = collection(db, 'partners');
      const querySnapshot = await getDocs(partnersCollection);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Partner));
    } catch (error) {
      console.error('Error fetching partners:', error);
      return [];
    }
  },

  async createPartner(partnerData: Omit<Partner, 'id'>): Promise<Partner | null> {
    try {
      const partnersCollection = collection(db, 'partners');
      const docRef = await addDoc(partnersCollection, partnerData);
      
      return {
        id: docRef.id,
        ...partnerData
      } as Partner;
    } catch (error) {
      console.error('Error creating partner:', error);
      return null;
    }
  },

  async updatePartner(partnerId: string, partnerData: Partial<Partner>): Promise<Partner | null> {
    try {
      const partnerRef = doc(db, 'partners', partnerId);
      await updateDoc(partnerRef, partnerData);
      
      const updatedPartnerSnap = await getDoc(partnerRef);
      if (updatedPartnerSnap.exists()) {
        return {
          id: updatedPartnerSnap.id,
          ...updatedPartnerSnap.data()
        } as Partner;
      }
      return null;
    } catch (error) {
      console.error('Error updating partner:', error);
      return null;
    }
  },

  async deletePartner(partnerId: string): Promise<boolean> {
    try {
      const partnerRef = doc(db, 'partners', partnerId);
      await deleteDoc(partnerRef);
      return true;
    } catch (error) {
      console.error('Error deleting partner:', error);
      return false;
    }
  },

  async canViewPartner(userId: string, partnerId: string): Promise<boolean> {
    try {
      const partnerRef = doc(db, 'partners', partnerId);
      const partnerSnap = await getDoc(partnerRef);
      
      if (!partnerSnap.exists()) {
        return false; // Partner doesn't exist
      }

      const partnerData = partnerSnap.data();
      
      // Example authorization logic: 
      // 1. If the partner has no specific access restrictions, allow view
      // 2. Check if the user is the owner of the partner
      // 3. Check if the user has a role that allows viewing partners
      
      // You can customize this logic based on your specific requirements
      return true; // Default to allowing view for now
    } catch (error) {
      console.error('Error checking partner view permission:', error);
      return false;
    }
  },

  getPartners
};
