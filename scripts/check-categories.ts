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

async function checkCategoriesAndPosts() {
    try {
        // Get all categories
        const categoriesSnapshot = await db.collection('categories').get();
        const categories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('\n=== Available Categories ===');
        categories.forEach(cat => {
            console.log(`ID: ${cat.id}, Name: ${cat.name}, Type: ${cat.type}`);
        });

        // Get all posts
        const postsSnapshot = await db.collection('posts').get();
        const posts = postsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            category: doc.data().category
        }));

        console.log('\n=== Posts Category Distribution ===');
        const categoryDistribution = new Map();
        const invalidCategories = [];

        posts.forEach(post => {
            const categoryId = post.category?.id;
            const categoryName = post.category?.name;

            if (!categoryId || !categoryName) {
                invalidCategories.push({
                    postId: post.id,
                    title: post.title,
                    category: post.category
                });
                return;
            }

            if (!categoryDistribution.has(categoryId)) {
                categoryDistribution.set(categoryId, {
                    name: categoryName,
                    count: 0
                });
            }
            categoryDistribution.get(categoryId).count++;
        });

        categoryDistribution.forEach((value, key) => {
            console.log(`Category "${value.name}" (${key}): ${value.count} posts`);
        });

        if (invalidCategories.length > 0) {
            console.log('\n=== Posts with Invalid Categories ===');
            invalidCategories.forEach(post => {
                console.log(`Post "${post.title}" (${post.id}): Invalid category:`, post.category);
            });
        }

        // Check for posts with non-existent category IDs
        const validCategoryIds = new Set(categories.map(cat => cat.id));
        const postsWithNonExistentCategories = posts.filter(post =>
            post.category?.id && !validCategoryIds.has(post.category.id)
        );

        if (postsWithNonExistentCategories.length > 0) {
            console.log('\n=== Posts with Non-existent Category IDs ===');
            postsWithNonExistentCategories.forEach(post => {
                console.log(`Post "${post.title}" (${post.id}) has category ID "${post.category?.id}" which doesn't exist`);
            });
        }

    } catch (error) {
        console.error('Error checking categories and posts:', error);
    }
}

checkCategoriesAndPosts();