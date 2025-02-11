import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

async function migrateAddStickyField() {
    try {
        // Initialize Firebase Admin
        const app = initializeApp({
            credential: cert(path.join(process.cwd(), 'fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json'))
        });

        const db = getFirestore(app);
        const postsRef = db.collection('posts');
        const querySnapshot = await postsRef.get();

        console.log(`Found ${querySnapshot.size} posts to update`);

        let updatedCount = 0;

        for (const docSnapshot of querySnapshot.docs) {
            const postData = docSnapshot.data();

            // Only update if sticky field doesn't exist
            if (typeof postData.sticky === 'undefined') {
                await docSnapshot.ref.update({
                    sticky: false // Set default value for existing posts
                });
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} posts`);
        process.exit(0);
    } catch (error) {
        console.error('Error migrating posts:', error);
        process.exit(1);
    }
}

// Run the migration
migrateAddStickyField();