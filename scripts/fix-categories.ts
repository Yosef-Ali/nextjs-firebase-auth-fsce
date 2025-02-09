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

async function fixCategories() {
    try {
        // Fix categories based on content types only
        const categoryMappings = {
            // What We Do section
            'child-protection': {
                name: 'Child Protection',
                description: 'Ensuring safety and well-being of children',
                type: 'post',
                menuPath: '/what-we-do/child-protection'
            },
            'youth-empowerment': {
                name: 'Youth Empowerment',
                description: 'Empowering youth for a better future',
                type: 'post',
                menuPath: '/what-we-do/youth-empowerment'
            },
            'advocacy': {
                name: 'Advocacy',
                description: 'Speaking up for children\'s rights and needs',
                type: 'post',
                menuPath: '/what-we-do/advocacy'
            },
            'humanitarian-response': {
                name: 'Humanitarian Response',
                description: 'Providing critical support in times of need',
                type: 'post',
                menuPath: '/what-we-do/humanitarian-response'
            },

            // News and Events section
            'news': {
                name: 'News',
                description: 'Latest news and updates',
                type: 'post',
                menuPath: '/news'
            },
            'events': {
                name: 'Events',
                description: 'Upcoming and past events',
                type: 'post',
                menuPath: '/events'
            },

            // Achievements section
            'achievements': {
                name: 'Achievements',
                description: 'Our accomplishments and milestones',
                type: 'post',
                menuPath: '/achievements'
            }
        };

        // Create or update categories
        for (const [id, data] of Object.entries(categoryMappings)) {
            const categoryRef = db.collection('categories').doc(id);
            await categoryRef.set({
                ...data,
                slug: id,
                count: 0,
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            }, { merge: true });
            console.log(`Updated category: ${data.name} with ID: ${id}`);
        }

        // Get posts with invalid categories
        const postsSnapshot = await db.collection('posts').get();
        let updateCount = 0;

        for (const postDoc of postsSnapshot.docs) {
            const post = postDoc.data();
            const category = post.category;
            let needsUpdate = false;
            let newCategory = null;

            // Check for invalid category ID
            if (!category || !category.id || category.id === 'uncategorized' || category.id === 'MmYNURrxYmLcbn9caSJ6') {
                const title = post.title?.toLowerCase() || '';
                const content = post.content?.toLowerCase() || '';

                // Map content to appropriate category based on content type
                if (title.includes('child') || title.includes('protection') || content.includes('child protection')) {
                    newCategory = { id: 'child-protection', name: 'Child Protection' };
                } else if (title.includes('youth') || title.includes('empowerment') || content.includes('youth empowerment')) {
                    newCategory = { id: 'youth-empowerment', name: 'Youth Empowerment' };
                } else if (title.includes('advocacy') || content.includes('rights') || content.includes('advocate')) {
                    newCategory = { id: 'advocacy', name: 'Advocacy' };
                } else if (title.includes('humanitarian') || title.includes('emergency') || title.includes('response')) {
                    newCategory = { id: 'humanitarian-response', name: 'Humanitarian Response' };
                } else if (title.includes('achievement') || content.includes('award') || content.includes('milestone')) {
                    newCategory = { id: 'achievements', name: 'Achievements' };
                } else if (title.includes('event') || content.includes('workshop') || content.includes('conference')) {
                    newCategory = { id: 'events', name: 'Events' };
                } else {
                    newCategory = { id: 'news', name: 'News' }; // Default to news
                }
                needsUpdate = true;
            }

            if (needsUpdate && newCategory) {
                await postDoc.ref.update({
                    category: newCategory,
                    menuPath: categoryMappings[newCategory.id].menuPath
                });
                updateCount++;
                console.log(`Updated post "${post.title}" with category: ${newCategory.name}`);
            }
        }

        console.log(`\nCompleted updates:`);
        console.log(`Updated ${updateCount} posts with proper categories`);

    } catch (error) {
        console.error('Error fixing categories:', error);
    }
}

fixCategories();