import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, DocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type DocumentState = DocumentSnapshot<DocumentData> | null;

export function useFirestoreDocument(collectionName: string, documentId: string) {
    const [document, setDocument] = useState<DocumentState>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const docRef = doc(db, collectionName, documentId);
                const docSnap = await getDoc(docRef);
                setDocument(docSnap);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch document'));
            } finally {
                setLoading(false);
            }
        };

        if (documentId) {
            fetchDocument();
        }
    }, [collectionName, documentId]);

    return [document, loading, error] as const;
}

export async function updateDocument(collectionName: string, documentId: string, data: any) {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
}
