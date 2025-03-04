import { Post } from '@/app/types/post';
import { Timestamp } from 'firebase/firestore';
import { toTimestamp } from './date';
import { ensureCategory } from './category';

export function normalizePost(data: any, id?: string): Post {
    const now = Timestamp.now();
    return {
        id: id || data?.id || '',
        title: data?.title || '',
        slug: data?.slug || '',
        excerpt: data?.excerpt || '',
        content: data?.content || '',
        coverImage: data?.coverImage || '',
        published: Boolean(data?.published),
        sticky: Boolean(data?.sticky),
        section: data?.section || '',
        images: Array.isArray(data?.images) ? data.images : [],
        authorId: data?.authorId || '',
        authorEmail: data?.authorEmail || '',
        date: toTimestamp(data?.date || now),
        category: ensureCategory(data?.category),
        featured: Boolean(data?.featured),
        status: data?.status || 'draft',
        tags: Array.isArray(data?.tags) ? data.tags : [],
        createdAt: toTimestamp(data?.createdAt || now),
        updatedAt: toTimestamp(data?.updatedAt || now)
    } as Post;
}