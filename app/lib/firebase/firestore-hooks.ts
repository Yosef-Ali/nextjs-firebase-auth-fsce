import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface PartnerDocument {
    id: string;
    exists: boolean;
    name?: string;
    email?: string;
    order?: number;
    phone?: string;
    partnerType?: string;
    description?: string;
    website?: string;
    logo?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export function useFirestoreDocument(collectionName: string, documentId: string) {
    const [document, setDocument] = useState<PartnerDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const docRef = doc(db, collectionName, documentId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDocument({ id: docSnap.id, exists: true, ...docSnap.data() });
                } else {
                    setDocument(null);
                }
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDocument();
    }, [collectionName, documentId]);

    return [document, loading, error];
}

export const updateDocument = async (collectionName: string, documentId: string, data: any) => {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
};
