import { db } from '../app/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  query, 
  where,
  DocumentData 
} from 'firebase/firestore';

async function main() {
  try {
    // Define our collections
    const collections = {
      posts: {
        name: 'posts',
        description: 'All blog posts'
      },
      categories: {
        name: 'categories',
        description: 'Content categories'
      }
    };

    // Create categories collection and add categories
    const categoriesCollection = collection(db, 'categories');
    
    const categoryList = [
      {
        id: 'protection',
        name: 'Protection',
        description: 'Content related to child protection and rights',
        slug: 'protection',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'youth',
        name: 'Youth',
        description: 'Content about youth programs and issues',
        slug: 'youth',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'humanitarian',
        name: 'Humanitarian',
        description: 'Content about humanitarian needs and emergency response',
        slug: 'humanitarian',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'values-principles',
        name: 'Values & Principles',
        description: 'Organizational values and guiding principles',
        slug: 'values-principles',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'board-members',
        name: 'Board Members',
        description: 'Information about board members and governance',
        slug: 'board-members',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'partners',
        name: 'Partners',
        description: 'Information about partnerships and stakeholders',
        slug: 'partners',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'merits',
        name: 'Merits',
        description: 'Achievements and successes',
        slug: 'merits',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'prevention-promotion',
        name: 'Prevention & Promotion',
        description: 'Preventive measures and promotional activities',
        slug: 'prevention-promotion',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'rehabilitation',
        name: 'Rehabilitation',
        description: 'Rehabilitation and reintegration programs',
        slug: 'rehabilitation',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'resource-center',
        name: 'Resource Center',
        description: 'Resources and knowledge base',
        slug: 'resource-center',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'situation-analysis',
        name: 'Situation Analysis',
        description: 'Analysis of current situations and contexts',
        slug: 'situation-analysis',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    // Add categories
    console.log('Adding categories...');
    for (const category of categoryList) {
      const docRef = doc(categoriesCollection, category.id);
      await setDoc(docRef, category);
      console.log(`Added category: ${category.name}`);
    }

    // Query posts by category
    console.log('\nQuerying posts by category...');
    const postsCollection = collection(db, 'posts');
    
    for (const category of categoryList) {
      const q = query(postsCollection, where('category', '==', category.id));
      const querySnapshot = await getDocs(q);
      console.log(`${category.name} posts: ${querySnapshot.size}`);
    }

    console.log('\nCollections and documents managed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error managing collections:', error);
    process.exit(1);
  }
}

main();
