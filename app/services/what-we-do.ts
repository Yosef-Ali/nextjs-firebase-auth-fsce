import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
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

    async getRelatedPrograms(currentId: string, category: string, maxLimit = 3): Promise<Post[]> {
        try {
            const postsRef = collection(db, POSTS_COLLECTION);

            // Create a simpler query without filters that might cause errors
            const q = query(
                postsRef,
                where('published', '==', true),
                limit(maxLimit * 3) // Fetch more to ensure we have enough after filtering
            );

            const snapshot = await getDocs(q);

            // Process the results in memory instead of in the query
            return snapshot.docs
                .map(doc => normalizePost(doc.data(), doc.id))
                .filter(post => post.id !== currentId) // Filter out current post
                .slice(0, maxLimit);
        } catch (error) {
            console.error('Error fetching related programs:', error);
            return [];
        }
    }
}

export const whatWeDoService = new WhatWeDoService();