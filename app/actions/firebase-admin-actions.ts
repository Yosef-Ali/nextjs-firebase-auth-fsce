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
    const snapshot = await adminDb
      .collection('posts')
      .where('status', 'in', ['published', true]) // Check for both status and published field
      .orderBy('createdAt', 'desc')
      .get();
    
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Ensure category is properly structured
      category: typeof doc.data().category === 'string' 
        ? { id: doc.data().category, name: doc.data().category }
        : doc.data().category
    } as Post));

    console.log('Fetched posts:', posts.length); // Debug log
    return posts;
  } catch (error) {
    console.error('Error fetching published posts:', error);
    throw new Error('Failed to fetch published posts');
  }
}
