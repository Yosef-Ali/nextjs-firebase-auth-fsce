import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate environment variables
if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set in .env.local');
}
if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL is not set in .env.local');
}
if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY is not set in .env.local');
}

const serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log('Initializing Firebase with project ID:', serviceAccount.project_id);

// Initialize Firebase Admin
const app = initializeApp({
    credential: cert(serviceAccount as any)
});

const db = getFirestore(app);

async function fixCategoryIds() {
    try {
        // Fix categories
        const categoryMappings = {
            'advocucy': {
                correctId: 'advocacy',
                correctName: 'Advocacy'
            },
            'achements': {
                correctId: 'achievements',
                correctName: 'Achievements'
            }
        };

        // Update categories collection
        for (const [wrongId, correct] of Object.entries(categoryMappings)) {
            // Get the category with wrong ID
            const wrongCategoryRef = db.collection('categories').doc(wrongId);
            const wrongCategoryDoc = await wrongCategoryRef.get();

            if (wrongCategoryDoc.exists) {
                const categoryData = wrongCategoryDoc.data();
                
                // Create new document with correct ID
                const correctCategoryRef = db.collection('categories').doc(correct.correctId);
                await correctCategoryRef.set({
                    ...categoryData,
                    id: correct.correctId,
                    name: correct.correctName,
                    updatedAt: new Date()
                });

                // Delete the old document
                await wrongCategoryRef.delete();
                console.log(`Fixed category: ${wrongId} -> ${correct.correctId}`);
            }
        }

        // Update posts that reference these categories
        const postsRef = db.collection('posts');
        const batch = db.batch();
        let updateCount = 0;

        // Fix posts with wrong category IDs
        for (const [wrongId, correct] of Object.entries(categoryMappings)) {
            const postsSnapshot = await postsRef
                .where('category.id', '==', wrongId)
                .get();

            postsSnapshot.forEach(doc => {
                batch.update(doc.ref, {
                    'category.id': correct.correctId,
                    'category.name': correct.correctName,
                    updatedAt: new Date()
                });
                updateCount++;
            });
        }

        if (updateCount > 0) {
            await batch.commit();
            console.log(`Updated ${updateCount} posts with correct category IDs`);
        }

        console.log('Category ID fix completed successfully');
    } catch (error) {
        console.error('Error fixing category IDs:', error);
    }
}

// Run the fix
fixCategoryIds();
