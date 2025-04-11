import { Post } from '@/app/types/post';
import { Timestamp } from 'firebase/firestore';
import { toTimestamp } from './date';
import { ensureCategory } from './category';

export function normalizePost(data: any, id?: string): Post {
    try {
        if (!data) {
            console.warn('Normalizing null or undefined post data');
            throw new Error('Post data is null or undefined');
        }

        const now = Timestamp.now();
        let categoryValue;

        try {
            // Handle category field with extra care
            categoryValue = data.category ? ensureCategory(data.category) : ensureCategory('uncategorized');
        } catch (categoryError) {
            console.error('Error processing category:', categoryError, data.category);
            // Fallback to a string if object processing fails
            categoryValue = typeof data.category === 'string' ? data.category : 'uncategorized';
        }

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
            category: categoryValue,
            featured: Boolean(data?.featured),
            status: data?.status || 'draft',
            tags: Array.isArray(data?.tags) ? data.tags : [],
            createdAt: toTimestamp(data?.createdAt || now),
            updatedAt: toTimestamp(data?.updatedAt || now)
        } as Post;
    } catch (error) {
        console.error('Error normalizing post:', error, data);
        // Return a minimal valid post object with all required fields to match the Post interface
        const now = Timestamp.now();
        return {
            id: id || data?.id || '',
            title: data?.title || 'Untitled',
            slug: data?.slug || '',
            excerpt: data?.excerpt || '',
            content: data?.content || '',
            coverImage: data?.coverImage || '',
            published: Boolean(data?.published) || true,
            sticky: Boolean(data?.sticky) || false,
            section: data?.section || '',
            images: Array.isArray(data?.images) ? data.images : [],
            authorId: data?.authorId || 'system',
            authorEmail: data?.authorEmail || 'system@example.com',
            date: now,
            category: 'uncategorized', // Simplify fallback to just a string
            featured: Boolean(data?.featured) || false,
            tags: Array.isArray(data?.tags) ? data.tags : [],
            status: data?.status || 'draft',
            createdAt: now,
            updatedAt: now
        } as Post;
    }
}