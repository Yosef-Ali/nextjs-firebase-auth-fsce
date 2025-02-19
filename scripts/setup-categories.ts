import * as admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const categories = [
    {
        id: 'achievements',
        name: 'Achievements',
        description: 'Our accomplishments and milestones',
        type: 'post',
        featured: false,
        slug: 'achievements',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    },
    {
        id: 'child-protection',
        name: 'Child Protection',
        description: 'Programs and initiatives for child protection',
        type: 'post',
        featured: false,
        slug: 'child-protection',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    },
    {
        id: 'advocacy',
        name: 'Advocacy',
        description: 'Speaking up for children\'s rights',
        type: 'post',
        featured: false,
        slug: 'advocacy',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    },
    {
        id: 'events',
        name: 'Events',
        description: 'Upcoming and past events',
        type: 'post',
        featured: false,
        slug: 'events',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    },
    {
        id: 'youth-empowerment',
        name: 'Youth Empowerment',
        description: 'Programs focused on youth development',
        type: 'post',
        featured: false,
        slug: 'youth-empowerment',
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now()
    }
];

async function setupCategories() {
    try {
        for (const category of categories) {
            await db.collection('categories').doc(category.id).set(category);
            console.log(`Created/updated category: ${category.name}`);
        }

        console.log('Categories setup completed');
    } catch (error) {
        console.error('Error setting up categories:', error);
    }
}

// Run the setup
setupCategories();