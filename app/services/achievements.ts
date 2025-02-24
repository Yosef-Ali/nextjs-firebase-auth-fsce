import { Timestamp } from 'firebase/firestore';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toTimestamp } from '@/app/utils/date';

// Define Achievement type
export interface Achievement {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    category: {
        id: string;
        name: string;
    };
    published: boolean;
    authorId?: string;
    authorEmail?: string;
    date: Timestamp;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    coverImage?: string;
    images?: string[];
    featured?: boolean;
}

function normalizeTimestamps(data: any): any {
    if (!data) return data;

    const now = Timestamp.now();
    const result = { ...data };

    // Convert date fields to Timestamps if they exist
    if (data.createdAt) result.createdAt = toTimestamp(data.createdAt);
    if (data.updatedAt) result.updatedAt = toTimestamp(data.updatedAt);
    if (data.date) result.date = toTimestamp(data.date);

    // Set default timestamps if they don't exist
    if (!result.createdAt) result.createdAt = now;
    if (!result.updatedAt) result.updatedAt = now;
    if (!result.date) result.date = now;

    return result;
}

const COLLECTION_NAME = 'posts';

export const achievementsService = {
    async getAchievements(): Promise<Achievement[]> {
        try {
            const achievementsRef = collection(db, COLLECTION_NAME);
            const q = query(
                achievementsRef,
                where('category.id', '==', 'achievements'),
                where('published', '==', true)
            );

            const querySnapshot = await getDocs(q);
            const achievements = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return normalizeTimestamps({
                    id: doc.id,
                    title: data.title || '',
                    content: data.content || '',
                    excerpt: data.excerpt || '',
                    slug: data.slug || doc.id,
                    category: typeof data.category === 'string'
                        ? { id: data.category, name: data.category }
                        : data.category || { id: 'achievements', name: 'Achievements' },
                    published: Boolean(data.published),
                    authorId: data.authorId || '',
                    authorEmail: data.authorEmail || '',
                    date: toTimestamp(data.date),
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    coverImage: data.coverImage || '',
                    images: Array.isArray(data.images) ? data.images : [],
                    featured: Boolean(data.featured)
                }) as Achievement;
            });

            return achievements;
        } catch (error) {
            console.error('Error getting achievements:', error);
            return [];
        }
    }
};
