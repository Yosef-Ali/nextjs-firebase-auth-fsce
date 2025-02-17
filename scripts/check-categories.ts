import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Category } from '@/app/types/category';

interface PostWithError {
    id: string;
    title: string;
    category: string;
    error: string;
}

async function main() {
    const categoriesRef = collection(db, 'categories');
    const postsRef = collection(db, 'posts');

    console.log('Checking categories and posts...');

    try {
        // Get all categories
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

        // Find duplicate categories
        const duplicates = Object.entries(categoryGroups)
            .filter(([_, cats]) => cats.length > 1)
            .map(([name, cats]) => ({
                name,
                categories: cats
            }));

        if (duplicates.length > 0) {
            console.log('\nFound duplicate categories:');
            duplicates.forEach(({ name, categories }) => {
                console.log(`\nDuplicate category "${name}":`);
                categories.forEach(cat => {
                    console.log(`ID: ${cat.id}, Name: ${(cat as Category).name}, Type: ${(cat as Category).type}`);
                });
            });
        }

        // Check posts for invalid categories
        const postsSnapshot = await getDocs(postsRef);
        const invalidPosts: PostWithError[] = [];

        postsSnapshot.docs.forEach(doc => {
            const post = doc.data();
            if (!post.category) {
                invalidPosts.push({
                    id: doc.id,
                    title: post.title,
                    category: 'missing',
                    error: 'Missing category'
                });
                return;
            }

            const categoryExists = categories.some(cat =>
                cat.id === post.category ||
                cat.name.toLowerCase() === post.category.toLowerCase()
            );

            if (!categoryExists) {
                invalidPosts.push({
                    id: doc.id,
                    title: post.title,
                    category: post.category,
                    error: 'Invalid category'
                });
            }
        });

        if (invalidPosts.length > 0) {
            console.log('\nFound posts with invalid categories:');
            invalidPosts.forEach(post => {
                console.log(`Post "${post.title}" (${post.id}): ${post.error}: ${post.category}`);
            });
        }

        if (duplicates.length === 0 && invalidPosts.length === 0) {
            console.log('No issues found!');
        }

    } catch (error) {
        console.error('Error checking categories:', error);
    }
}

main().catch(console.error);
