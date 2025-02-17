import { adminDb } from '../lib/firebase-admin';
import { collection, getDocs, doc, deleteDoc, writeBatch, Firestore } from 'firebase/firestore';
import { Category } from '@/app/types/category';

async function main() {
    try {
        // Get all categories
        const categoriesRef = collection(adminDb as unknown as Firestore, 'categories');
        const postsRef = collection(adminDb as unknown as Firestore, 'posts');

        const categoriesSnapshot = await getDocs(categoriesRef);
        const categories = categoriesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as Category[];

        // Group categories by name
        const categoryGroups = categories.reduce((groups, cat) => {
            const key = cat.name.toLowerCase().trim();
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(cat);
            return groups;
        }, {} as Record<string, Category[]>);

        // Find and process duplicates
        const duplicates = Object.entries(categoryGroups)
            .filter(([_, cats]) => cats.length > 1);

        if (duplicates.length === 0) {
            console.log('No duplicate categories found.');
            return;
        }

        console.log(`Found ${duplicates.length} duplicate category groups`);
        const batch = writeBatch(adminDb as unknown as Firestore);

        for (const [name, duplicateCategories] of duplicates) {
            console.log(`\nProcessing duplicate category "${name}"...`);

            // Keep the one with valid ID and most complete data
            const toKeep = duplicateCategories.find((cat: Category) => cat.id && cat.id.length > 0) || duplicateCategories[0];
            const toDelete = duplicateCategories.filter((cat: Category) => cat !== toKeep);

            // Update posts that reference the deleted categories
            const postsSnapshot = await getDocs(postsRef);
            postsSnapshot.docs.forEach(postDoc => {
                const post = postDoc.data();
                if (toDelete.some(cat => cat.id === post.category)) {
                    batch.update(doc(postsRef, postDoc.id), {
                        category: toKeep.id
                    });
                }
            });

            // Delete duplicate categories
            for (const category of toDelete) {
                if (category.id) {
                    batch.delete(doc(categoriesRef, category.id));
                    console.log(`Marking category ${category.id} for deletion`);
                }
            }

            console.log(`Keeping category ${toKeep.id}`);
        }

        // Commit all changes
        await batch.commit();
        console.log('\nSuccessfully cleaned up duplicate categories');

    } catch (error) {
        console.error('Error cleaning up categories:', error);
    }
}

main().catch(console.error);
