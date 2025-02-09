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

async function addAchievementsCategory() {
    try {
        const achievementsCategory = {
            name: 'Achievements',
            slug: 'achievements',
            description: 'Our accomplishments and milestones',
            type: 'post',
            count: 0,
            createdAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now()
        };

        const categoryRef = db.collection('categories').doc('achievements');
        await categoryRef.set(achievementsCategory);
        console.log('Successfully added Achievements category');
    } catch (error) {
        console.error('Error adding Achievements category:', error);
    }
}

addAchievementsCategory();