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

async function cleanupDuplicateCategories() {
    try {
        // Get all categories
        const categoriesSnapshot = await db.collection('categories').get();
        const categoriesByName = new Map();

        // Group categories by name
        categoriesSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const name = data.name;
            if (!categoriesByName.has(name)) {
                categoriesByName.set(name, []);
            }
            categoriesByName.get(name).push({
                id: doc.id,
                ref: doc.ref,
                ...data
            });
        });

        // Find and remove duplicates
        for (const [name, categories] of categoriesByName.entries()) {
            if (categories.length > 1) {
                console.log(`Found ${categories.length} duplicates for category "${name}"`);

                // Find the one to keep (prefer non-empty ID)
                const toKeep = categories.find(cat => cat.id && cat.id.length > 0) || categories[0];
                const toDelete = categories.filter(cat => cat !== toKeep);

                console.log(`Keeping category with ID "${toKeep.id}"`);

                // Delete duplicates
                for (const cat of toDelete) {
                    await cat.ref.delete();
                    console.log(`Deleted duplicate category with ID "${cat.id}"`);
                }
            }
        }

        console.log('Duplicate cleanup completed successfully!');
    } catch (error) {
        console.error('Error cleaning up duplicates:', error);
    }
}

cleanupDuplicateCategories();