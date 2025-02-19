import { db } from '../lib/firebase';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';

async function normalizeAdvocacyPosts() {
    try {
        const postsRef = collection(db, 'posts');
        const queries = [
            query(postsRef, where('category', 'in', ['advocacy', 'Advocacy'])),
            query(postsRef, where('category.id', 'in', ['advocacy', 'Advocacy'])),
            query(postsRef, where('category.name', 'in', ['advocacy', 'Advocacy']))
        ];

        let updatedCount = 0;

        for (const q of queries) {
            const snapshot = await getDocs(q);
            for (const docSnapshot of snapshot.docs) {
                await updateDoc(doc(postsRef, docSnapshot.id), {
                    category: {
                        id: 'advocacy',
                        name: 'Advocacy'
                    }
                });
                updatedCount++;
                console.log(`Updated post: ${docSnapshot.data().title}`);
            }
        }

        console.log(`Normalized ${updatedCount} advocacy posts`);
    } catch (error) {
        console.error('Error normalizing advocacy posts:', error);
    }
}

// Run the normalization
normalizeAdvocacyPosts();