import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

async function fixEventCategories() {
    try {
        const postsRef = collection(db, 'posts');

        // First get all posts with string category 'events'
        let q = query(postsRef, where('category', 'in', ['events', 'event', 'Events', 'Event']));
        let querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.size} posts with string category format`);

        // Update each post to use the correct category format
        for (const docSnapshot of querySnapshot.docs) {
            await updateDoc(doc(postsRef, docSnapshot.id), {
                category: {
                    id: 'Events',
                    name: 'Events'
                }
            });
            console.log(`Updated post: ${docSnapshot.data().title}`);
        }

        // Check for object format with wrong casing
        q = query(postsRef, where('category.id', 'in', ['events', 'event']));
        querySnapshot = await getDocs(q);

        console.log(`Found ${querySnapshot.size} posts with incorrect object category casing`);

        for (const docSnapshot of querySnapshot.docs) {
            await updateDoc(doc(postsRef, docSnapshot.id), {
                category: {
                    id: 'Events',
                    name: 'Events'
                }
            });
            console.log(`Updated post: ${docSnapshot.data().title}`);
        }

        console.log('Migration completed successfully');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Run the migration
fixEventCategories();