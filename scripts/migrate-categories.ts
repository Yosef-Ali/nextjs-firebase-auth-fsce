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

async function migrateCategories() {
    try {
        // Get all categories from the categories collection
        const categoriesSnapshot = await db.collection('categories').where('type', '==', 'post').get();
        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log('Found categories:', categories.length);

        // Get all posts
        const postsSnapshot = await db.collection('posts').get();
        console.log('Found posts:', postsSnapshot.docs.length);

        // Update each post
        for (const postDoc of postsSnapshot.docs) {
            const post = postDoc.data();
            const oldCategory = post.category;

            // Skip if category is already in correct format
            if (oldCategory && typeof oldCategory === 'object' && oldCategory.id && oldCategory.name) {
                console.log('Skipping post:', postDoc.id, '- category already in correct format');
                continue;
            }

            // Find matching category
            let matchingCategory = categories.find(cat =>
                cat.slug === String(oldCategory).toLowerCase() ||
                cat.name.toLowerCase() === String(oldCategory).toLowerCase()
            );

            // Default to 'uncategorized' if no match found
            if (!matchingCategory) {
                console.log('No matching category found for post:', postDoc.id, '- using uncategorized');
                matchingCategory = {
                    id: 'uncategorized',
                    name: 'Uncategorized',
                    slug: 'uncategorized'
                };
            }

            // Update post with new category format
            await db.collection('posts').doc(postDoc.id).update({
                category: {
                    id: matchingCategory.id,
                    name: matchingCategory.name
                }
            });

            console.log('Updated post:', postDoc.id, 'with category:', matchingCategory.name);
        }

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

migrateCategories();