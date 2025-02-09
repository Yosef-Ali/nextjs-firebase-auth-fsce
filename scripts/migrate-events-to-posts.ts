import { db } from '@/lib/firebase';
import { collection, query, getDocs, addDoc } from 'firebase/firestore';

async function migrateEventsToPosts() {
  try {
    // Get all events from events collection
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    console.log(`Found ${querySnapshot.size} events to migrate`);

    // Move each event to posts collection
    const postsRef = collection(db, 'posts');
    for (const doc of querySnapshot.docs) {
      const eventData = doc.data();
      // Ensure category is properly formatted
      const postData = {
        ...eventData,
        category: {
          id: 'events',
          name: 'Events'
        }
      };
      await addDoc(postsRef, postData);
      console.log(`Migrated event to posts: ${eventData.title}`);
    }

    console.log('Migration to posts completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateEventsToPosts();