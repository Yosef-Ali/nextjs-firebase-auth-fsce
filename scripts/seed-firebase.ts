import { db } from '../app/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { processContent } from './content-processor';
import { Post } from '../app/types/post';

async function seedFirebase() {
  try {
    // Get the user ID from command line argument
    const userId = process.argv[2];
    if (!userId) {
      console.error('Please provide a user ID as an argument');
      process.exit(1);
    }

    // Process the content into posts
    const posts = processContent().map(post => ({
      ...post,
      authorId: userId
    }));

    console.log(`Found ${posts.length} posts to seed`);

    // Upload each post to Firebase
    const postsCollection = collection(db, 'posts');
    
    for (const post of posts) {
      const docRef = doc(postsCollection, post.id);
      await setDoc(docRef, post);
      console.log(`Uploaded post: ${post.title}`);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Firebase:', error);
    process.exit(1);
  }
}

seedFirebase();
