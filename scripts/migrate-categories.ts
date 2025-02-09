import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';

async function migrateCategoriesToObjects() {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(postsRef);
    
    console.log(`Found ${querySnapshot.size} posts to check`);
    let migratedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      if (typeof data.category === 'string') {
        // Convert string category to object format
        await updateDoc(doc(postsRef, docSnapshot.id), {
          category: {
            id: data.category,
            name: data.category
          }
        });
        migratedCount++;
        console.log(`Migrated post: ${data.title}`);
      }
    }

    console.log(`Migration completed. ${migratedCount} posts updated.`);
  } catch (error) {
    console.error('Error during category migration:', error);
  }
}

// Run the migration
migrateCategoriesToObjects();