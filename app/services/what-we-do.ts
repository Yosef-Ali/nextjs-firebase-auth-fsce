import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, getDoc, orderBy } from 'firebase/firestore';
import { Post } from '@/app/types/post';
import { normalizePost } from '../utils/post';

const POSTS_COLLECTION = 'posts';

class WhatWeDoService {
    async getProgramBySlug(slug: string): Promise<Post | null> {
        try {
            const postsRef = collection(db, POSTS_COLLECTION);
            const q = query(postsRef, where('slug', '==', slug));
            const snapshot = await getDocs(q);

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return normalizePost(doc.data(), doc.id);
        } catch (error) {
            console.error('Error fetching program by slug:', error);
            return null;
        }
    }

    async getRelatedPrograms(currentId: string, category: string, limit = 3): Promise<Post[]> {
        try {
            const postsRef = collection(db, POSTS_COLLECTION);
            const q = query(
                postsRef,
                where('category.id', '==', category),
                where('published', '==', true),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            return snapshot.docs
                .map(doc => normalizePost(doc.data(), doc.id))
                .filter(post => post.id !== currentId)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching related programs:', error);
            return [];
        }
    }
}

export const whatWeDoService = new WhatWeDoService();