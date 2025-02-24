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

const achievements = [
    {
        title: "National Excellence Award 2023",
        slug: "national-excellence-award-2023",
        content: "Recognized for outstanding contribution to youth development and community service.",
        excerpt: "Awarded the prestigious National Excellence Award for our impact on youth development.",
        coverImage: "/images/achievements/national-award.jpg",
        category: "achievements",
        published: true,
        sticky: true, // This marks it as featured
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        authorId: "admin",
        authorEmail: "admin@fsce.org",
        tags: ["awards", "recognition", "featured"]
    },
    {
        title: "Community Impact Recognition",
        slug: "community-impact-recognition-2023",
        content: "Honored for creating lasting positive change in local communities through innovative programs.",
        excerpt: "Received recognition for transformative community development initiatives.",
        coverImage: "/images/achievements/community-impact.jpg",
        category: "achievements",
        published: true,
        sticky: true, // This marks it as featured
        createdAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
        authorId: "admin",
        authorEmail: "admin@fsce.org",
        tags: ["community", "impact", "featured"]
    }
];

async function seedAchievements() {
    try {
        const batch = db.batch();
        
        for (const achievement of achievements) {
            const docRef = db.collection('posts').doc();
            batch.set(docRef, achievement);
        }

        await batch.commit();
        console.log('Successfully seeded achievements');
    } catch (error) {
        console.error('Error seeding achievements:', error);
    } finally {
        process.exit();
    }
}

seedAchievements();