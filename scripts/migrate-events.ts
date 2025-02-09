import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

async function migrateEventsData() {
  try {
    // Get all events from posts collection
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('category.id', '==', 'events'));
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} events to migrate`);

    // Migrate each event to new collection
    const eventsRef = collection(db, 'events');
    for (const doc of querySnapshot.docs) {
      const eventData = doc.data();
      await addDoc(eventsRef, eventData);
      console.log(`Migrated event: ${eventData.title}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateEventsData();