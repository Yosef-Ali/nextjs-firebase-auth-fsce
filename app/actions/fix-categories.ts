'use server';

import { collection, query, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function fixCategories() {
    try {
        // First ensure the categories exist
        const categories = {
            'advocacy': {
                id: 'advocacy',
                name: 'Advocacy',
                description: "Speaking up for children's rights and needs",
                type: 'post',
                slug: 'advocacy',
                count: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            'achievements': {
                id: 'achievements',
                name: 'Achievements',
                description: 'Our accomplishments and milestones',
                type: 'post',
                slug: 'achievements',
                count: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        };

        // Add or update categories
        for (const [id, data] of Object.entries(categories)) {
            await setDoc(doc(db, 'categories', id), data, { merge: true });
        }

        // Fix posts that reference these categories
        const postsRef = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsRef);

        for (const postDoc of postsSnapshot.docs) {
            const post = postDoc.data();
            const category = post.category;

            // Check if category needs fixing
            if (category) {
                let needsUpdate = false;
                let newCategory = null;

                // Fix advocacy category
                if (
                    (typeof category === 'string' && category.toLowerCase() === 'advocacy') ||
                    (category.id && category.id.toLowerCase() === 'advocacy') ||
                    (category.name && category.name.toLowerCase() === 'advocacy')
                ) {
                    newCategory = categories.advocacy;
                    needsUpdate = true;
                }
                // Fix achievements category
                else if (
                    (typeof category === 'string' && category.toLowerCase() === 'achievements') ||
                    (category.id && category.id.toLowerCase() === 'achievements') ||
                    (category.name && category.name.toLowerCase() === 'achievements')
                ) {
                    newCategory = categories.achievements;
                    needsUpdate = true;
                }

                if (needsUpdate && newCategory) {
                    await updateDoc(doc(postsRef, postDoc.id), {
                        category: newCategory
                    });
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error fixing categories:', error);
        return { success: false, error: 'Failed to fix categories' };
    }
}