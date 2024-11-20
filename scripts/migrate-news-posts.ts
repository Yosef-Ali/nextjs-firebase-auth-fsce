import { db } from '@/app/firebase';
import { collection, getDocs, query, where, addDoc, Timestamp } from 'firebase/firestore';

async function migrateNewsPosts() {
  try {
    // Get all news posts from the old collection
    const oldCollection = collection(db, 'posts');
    const q = query(
      oldCollection,
      where('tags', 'array-contains', 'news')
    );

    const querySnapshot = await getDocs(q);
    const newsCollection = collection(db, 'news');

    console.log(`Found ${querySnapshot.size} news posts to migrate...`);

    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Add to new collection
      await addDoc(newsCollection, {
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        published: data.published || true
      });

      console.log(`Migrated news post: ${data.title}`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrateNewsPosts();
