'use server';

import { adminDb } from '@/app/lib/server/firebase-admin';
import { Category } from '@/app/types/category';
import { Post } from '@/app/types/post';

export async function getCategories(): Promise<Category[]> {
  try {
    const snapshot = await adminDb.collection('categories').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Category));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
}

export async function getPublishedPosts(): Promise<Post[]> {
  try {
    // Use a simpler query to avoid complex indexes
    const snapshot = await adminDb
      .collection('posts')
      .where('published', '==', true) // Use only one condition
      .get();

    // Process and sort in memory
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure category is properly structured
      category: typeof doc.data().category === 'string'
        ? { id: doc.data().category, name: doc.data().category }
        : doc.data().category
    } as Post));

    // Sort in memory instead of using orderBy in the query
    posts.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() :
                  a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() :
                  b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return dateB - dateA; // Sort by descending order
    });

    console.log('Fetched posts:', posts.length); // Debug log
    return posts;
  } catch (error) {
    console.error('Error fetching published posts:', error);
    throw new Error('Failed to fetch published posts');
  }
}
