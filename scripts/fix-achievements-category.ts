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

async function fixAchievementsCategory() {
    try {
        const postsRef = db.collection('posts');

        // First get all posts with any variation of achievements category
        const variations = [
            'achievements',
            'Achievements',
            'achievement',
            'Achievement',
            { id: 'achievements' },
            { id: 'Achievements' },
            { name: 'Achievements' },
            { name: 'achievements' }
        ];

        const snapshot = await postsRef.where('category', 'in', variations).get();
        console.log(`Found ${snapshot.size} achievements posts to update`);

        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            const normalizedCategory = {
                id: 'achievements',
                name: 'Achievements',
                type: 'post',
                featured: false,
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };

            batch.update(doc.ref, {
                category: normalizedCategory,
                updatedAt: admin.firestore.Timestamp.now()
            });

            count++;
            console.log(`Queued update for achievement: ${doc.data().title}`);
        });

        await batch.commit();
        console.log(`Successfully updated ${count} achievements`);
    } catch (error) {
        console.error('Error fixing achievements category:', error);
    }
}

fixAchievementsCategory();

