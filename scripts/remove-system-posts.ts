import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin using environment variables
try {
  if (!admin.apps.length) {
    // Check if required environment variables are set
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin environment variables.');
      console.log('Make sure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set in .env.local');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();
const EMAIL_TO_FIND = 'dev.yosefali@gmail.com';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function for exponential backoff
async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
async function retryOperation(operation: () => Promise<any>, maxRetries = 5, initialDelay = 1000) {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (retries >= maxRetries) {
        throw error;
      }

      const delay = initialDelay * Math.pow(2, retries);
      console.log(`Operation failed. Retrying in ${delay}ms... (${retries + 1}/${maxRetries})`);
      await sleep(delay);
      retries++;
    }
  }
}

async function findSystemPosts() {
  try {
    console.log(`Searching for posts with no authorEmail...`);

    // Query posts collection for documents with the specified email
    const postsRef = db.collection('posts');

    // Use pagination to avoid quota limits
    const BATCH_SIZE = 10; // Reduced batch size
    let lastDoc = null;
    let allPosts = [];
    let hasMore = true;
    let batchNumber = 0;

    while (hasMore) {
      batchNumber++;
      console.log(`Fetching batch #${batchNumber}...`);

      try {
        // Build query with pagination - get all posts and filter for those without authorEmail
        let query = postsRef.limit(BATCH_SIZE);

        // If we have a last document, start after it
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }

        // Execute query with retry logic
        const querySnapshot = await retryOperation(
          async () => await query.get(),
          3, // Max retries
          2000 // Initial delay in ms
        );

        // If no results, we're done
        if (querySnapshot.empty) {
          console.log('No more results found.');
          hasMore = false;
          continue;
        }

        // Get the last document for next pagination
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        // Add results to our collection
        const batchPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter for posts without authorEmail
        const filteredPosts = batchPosts.filter(post => {
          return !post.authorEmail || post.authorEmail === '' || post.authorEmail === null || post.authorEmail === undefined;
        });

        allPosts = [...allPosts, ...filteredPosts];

        console.log(`Retrieved batch of ${batchPosts.length} posts, filtered ${filteredPosts.length} with no email. Total so far: ${allPosts.length}`);

        // If we got fewer results than the batch size, we're done
        if (querySnapshot.docs.length < BATCH_SIZE) {
          console.log('Reached end of results.');
          hasMore = false;
        }

        // Longer delay to avoid hitting rate limits
        console.log('Waiting before next batch...');
        await sleep(5000);
      } catch (error) {
        console.error(`Error fetching batch #${batchNumber}:`, error);
        console.log('Waiting longer before retrying...');
        await sleep(10000); // 10 second delay after error

        // If we've had multiple errors, maybe stop
        if (batchNumber > 5 && allPosts.length === 0) {
          console.log('Multiple errors encountered and no posts found. Stopping search.');
          hasMore = false;
        }
      }
    }

    if (allPosts.length === 0) {
      console.log('No posts found with the specified email.');
      rl.close();
      return [];
    }

    console.log(`Found ${allPosts.length} posts with authorEmail: ${EMAIL_TO_FIND}`);
    console.log('\nPosts found:');

    // Only show first 20 posts to avoid console overflow
    const displayPosts = allPosts.slice(0, 20);
    displayPosts.forEach((post, index) => {
      console.log(`\n[${index + 1}] ID: ${post.id}`);
      console.log(`    Title: ${post.title || 'No title'}`);
      // Handle different formats of createdAt (Timestamp, Date, string, etc.)
      let createdAtStr = 'Unknown';
      if (post.createdAt) {
        try {
          if (post.createdAt.toDate && typeof post.createdAt.toDate === 'function') {
            // Firestore Timestamp
            createdAtStr = new Date(post.createdAt.toDate()).toISOString();
          } else if (post.createdAt instanceof Date) {
            // JavaScript Date
            createdAtStr = post.createdAt.toISOString();
          } else if (typeof post.createdAt === 'string') {
            // String date
            createdAtStr = post.createdAt;
          } else if (typeof post.createdAt === 'number') {
            // Timestamp in milliseconds
            createdAtStr = new Date(post.createdAt).toISOString();
          }
        } catch (e) {
          createdAtStr = `Present (format: ${typeof post.createdAt})`;
        }
      }
      console.log(`    Created: ${createdAtStr}`);
      console.log(`    Category: ${typeof post.category === 'object' ? post.category.name : post.category || 'Unknown'}`);
    });

    if (allPosts.length > 20) {
      console.log(`\n... and ${allPosts.length - 20} more posts not shown.`);
    }

    return allPosts;
  } catch (error) {
    console.error('Error finding posts:', error);
    rl.close();
    return [];
  }
}

async function deleteSystemPosts(posts: any[]) {
  return new Promise<void>((resolve) => {
    if (posts.length === 0) {
      resolve();
      return;
    }

    rl.question('\nDo you want to delete these posts? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\nDeleting posts...');

        // Process in smaller batches to avoid quota issues
        const MAX_BATCH_SIZE = 20; // Very small batch size to avoid quota issues
        let totalDeleted = 0;

        // Process posts in chunks
        for (let i = 0; i < posts.length; i += MAX_BATCH_SIZE) {
          const chunk = posts.slice(i, i + MAX_BATCH_SIZE);
          console.log(`Processing chunk ${Math.floor(i / MAX_BATCH_SIZE) + 1} of ${Math.ceil(posts.length / MAX_BATCH_SIZE)} (${chunk.length} posts)`);

          // Create a new batch for each chunk
          const batch = db.batch();

          // Add delete operations to batch
          for (const post of chunk) {
            const docRef = db.collection('posts').doc(post.id);
            batch.delete(docRef);
          }

          // Commit the batch with retry logic
          try {
            await retryOperation(
              async () => await batch.commit(),
              3, // Max retries
              3000 // Initial delay in ms
            );

            totalDeleted += chunk.length;
            console.log(`Deleted ${chunk.length} posts. Total: ${totalDeleted}/${posts.length}`);

            // Add a small delay to avoid rate limits
            if (i + MAX_BATCH_SIZE < posts.length) {
              console.log('Pausing briefly to avoid rate limits...');
              await sleep(5000); // Longer pause between batches
            }
          } catch (error) {
            console.error(`Error deleting batch after retries: ${error}`);
            console.log('Continuing with next batch...');

            // Longer pause after an error
            await sleep(10000);
          }
        }

        console.log(`Successfully deleted ${totalDeleted}/${posts.length} posts.`);
      } else {
        console.log('Operation cancelled. No posts were deleted.');
      }

      resolve();
    });
  });
}

async function main() {
  try {
    const posts = await findSystemPosts();
    await deleteSystemPosts(posts);
    rl.close();
  } catch (error) {
    console.error('Error in main function:', error);
    rl.close();
  }
}

// Handle readline close
rl.on('close', () => {
  console.log('\nScript execution completed.');
  process.exit(0);
});

// Run the main function
main();
