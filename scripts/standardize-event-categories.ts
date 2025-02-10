import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function standardizeEventCategories() {
    try {
        const postsRef = db.collection('posts');
        const querySnapshot = await postsRef.get();

        console.log(`Found ${querySnapshot.size} posts to check`);
        let updatedCount = 0;

        for (const doc of querySnapshot.docs) {
            const data = doc.data();
            const category = data.category;

            // Check if this is an event post with non-standard category format
            if (
                category === 'events' ||
                category === 'Events' ||
                category?.id?.toLowerCase() === 'events' ||
                (category?.name === 'Events' && category?.id !== 'Events')
            ) {
                // Standardize to the correct format
                await doc.ref.update({
                    category: {
                        id: 'Events',
                        name: 'Events'
                    }
                });
                updatedCount++;
                console.log(`Standardized event category for post: ${data.title}`);
            }
        }

        console.log(`Standardization completed. ${updatedCount} posts updated.`);
    } catch (error) {
        console.error('Error during category standardization:', error);
    }
}

// Run the standardization and exit when done
standardizeEventCategories().then(() => process.exit(0));