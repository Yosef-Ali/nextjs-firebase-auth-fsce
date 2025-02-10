import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin with service account
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = getFirestore();

async function normalizeEventCategories() {
    try {
        const postsRef = db.collection('posts');

        // Query for all variations of event categories
        const query = postsRef.where('category', 'in', [
            'events',
            'event',
            'Events',
            'Event',
            { id: 'events', name: 'events' },
            { id: 'events', name: 'Events' },
            { id: 'event', name: 'event' },
            { id: 'event', name: 'Event' }
        ]);

        const snapshot = await query.get();
        console.log(`Found ${snapshot.size} events to update`);

        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            const normalizedCategory = {
                id: 'Events',
                name: 'Events'
            };

            batch.update(doc.ref, {
                category: normalizedCategory,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            count++;
            console.log(`Queued update for event: ${doc.data().title}`);
        });

        await batch.commit();
        console.log(`Successfully updated ${count} events`);
    } catch (error) {
        console.error('Error normalizing event categories:', error);
    }
}

normalizeEventCategories().then(() => process.exit(0));