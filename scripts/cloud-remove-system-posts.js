/**
 * Script to remove posts with system@example.com email
 * Designed to run in a cloud environment (Cloud Functions, Cloud Run)
 * with fewer quota restrictions
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin with application default credentials
// This will use the environment's credentials when run in a cloud environment
admin.initializeApp({
  // When deployed to Google Cloud, this will use the default credentials
  // No need to specify credentials explicitly
});

const db = admin.firestore();
const EMAIL_TO_FIND = 'system@example.com';

/**
 * Deletes posts in small batches to avoid quota issues
 */
async function deleteSystemPosts() {
  console.log(`Starting deletion of posts with authorEmail: ${EMAIL_TO_FIND}`);
  
  try {
    // Use a small batch size
    const BATCH_SIZE = 10;
    let deleted = 0;
    let hasMore = true;
    let lastDoc = null;
    
    while (hasMore) {
      // Build query
      let query = db.collection('posts')
        .where('authorEmail', '==', EMAIL_TO_FIND)
        .limit(BATCH_SIZE);
      
      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }
      
      // Get batch of posts
      const snapshot = await query.get();
      
      if (snapshot.empty) {
        hasMore = false;
        console.log('No more posts found.');
        break;
      }
      
      // Save last document for pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      // Delete each post individually to avoid batch write limits
      for (const doc of snapshot.docs) {
        await doc.ref.delete();
        deleted++;
        console.log(`Deleted post ${doc.id} (${deleted} total)`);
        
        // Small delay between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`Deleted batch of ${snapshot.docs.length} posts. Total: ${deleted}`);
      
      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // If we got fewer results than the batch size, we're done
      if (snapshot.docs.length < BATCH_SIZE) {
        hasMore = false;
      }
    }
    
    console.log(`Completed. Total posts deleted: ${deleted}`);
    return { success: true, deleted };
  } catch (error) {
    console.error('Error deleting posts:', error);
    return { success: false, error: error.message };
  }
}

// For Cloud Functions
exports.removeSystemPosts = async (req, res) => {
  try {
    const result = await deleteSystemPosts();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// For direct execution (e.g., in Cloud Run)
if (require.main === module) {
  deleteSystemPosts()
    .then(result => {
      console.log('Execution result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Execution failed:', error);
      process.exit(1);
    });
}
