/**
 * Script to remove posts with system@example.com email using Firebase REST API
 * This approach uses direct HTTP requests instead of the Admin SDK
 * which might help bypass some quota limitations
 */

const https = require('https');
const fs = require('fs');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration - FILL THESE VALUES
const PROJECT_ID = ''; // Your Firebase project ID
const API_KEY = '';    // Your Firebase API key (web API key from Project Settings)
const EMAIL = '';      // Your Firebase account email
const PASSWORD = '';   // Your Firebase account password

// Helper function for sleeping
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ statusCode: res.statusCode, data: parsedData });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Get Firebase auth token
async function getAuthToken() {
  const options = {
    hostname: 'identitytoolkit.googleapis.com',
    path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const data = {
    email: EMAIL,
    password: PASSWORD,
    returnSecureToken: true
  };
  
  try {
    const response = await makeRequest(options, data);
    if (response.statusCode !== 200) {
      throw new Error(`Authentication failed: ${JSON.stringify(response.data)}`);
    }
    return response.data.idToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

// Query Firestore for posts
async function queryPosts(token, startAfter = null) {
  const structuredQuery = {
    from: [{ collectionId: 'posts' }],
    where: {
      fieldFilter: {
        field: { fieldPath: 'authorEmail' },
        op: 'EQUAL',
        value: { stringValue: 'system@example.com' }
      }
    },
    limit: 5 // Very small batch size
  };
  
  // Add startAt for pagination if provided
  if (startAfter) {
    structuredQuery.startAt = {
      values: [{ referenceValue: startAfter }]
    };
  }
  
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  try {
    const response = await makeRequest(options, { structuredQuery });
    if (response.statusCode !== 200) {
      throw new Error(`Query failed: ${JSON.stringify(response.data)}`);
    }
    return response.data;
  } catch (error) {
    console.error('Error querying posts:', error);
    throw error;
  }
}

// Delete a document
async function deleteDocument(token, documentPath) {
  const options = {
    hostname: 'firestore.googleapis.com',
    path: `/v1/${documentPath}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
  
  try {
    const response = await makeRequest(options);
    if (response.statusCode !== 200) {
      throw new Error(`Delete failed: ${JSON.stringify(response.data)}`);
    }
    return response.data;
  } catch (error) {
    console.error(`Error deleting document ${documentPath}:`, error);
    throw error;
  }
}

// Main function to find and delete posts
async function findAndDeletePosts() {
  try {
    console.log('Getting authentication token...');
    const token = await getAuthToken();
    
    console.log('Searching for posts with authorEmail: system@example.com...');
    
    let hasMore = true;
    let lastDoc = null;
    let allPosts = [];
    let batchNumber = 0;
    
    // Find posts in batches
    while (hasMore) {
      batchNumber++;
      console.log(`Fetching batch #${batchNumber}...`);
      
      try {
        // Add delay to avoid quota limits
        await sleep(3000);
        
        const results = await queryPosts(token, lastDoc);
        
        // Filter out empty results and extract documents
        const documents = results
          .filter(result => result.document)
          .map(result => ({
            name: result.document.name,
            fields: result.document.fields
          }));
        
        if (documents.length === 0) {
          console.log('No more documents found.');
          hasMore = false;
          continue;
        }
        
        // Save the last document for pagination
        lastDoc = documents[documents.length - 1].name;
        
        // Add to our collection
        allPosts = [...allPosts, ...documents];
        
        console.log(`Retrieved batch of ${documents.length} posts. Total so far: ${allPosts.length}`);
        
        // Add longer delay between batches
        await sleep(5000);
      } catch (error) {
        console.error(`Error in batch #${batchNumber}:`, error);
        
        // Exponential backoff
        const backoffTime = Math.min(30000, 5000 * Math.pow(2, batchNumber % 5));
        console.log(`Backing off for ${backoffTime/1000} seconds before retrying...`);
        await sleep(backoffTime);
        
        // If we've had too many errors, stop
        if (batchNumber >= 10) {
          console.log('Too many errors. Stopping search.');
          hasMore = false;
        }
      }
    }
    
    if (allPosts.length === 0) {
      console.log('No posts found with the specified email.');
      return;
    }
    
    console.log(`Found ${allPosts.length} posts with authorEmail: system@example.com`);
    console.log('\nPosts found:');
    
    // Display first 5 posts
    const displayPosts = allPosts.slice(0, 5);
    displayPosts.forEach((post, index) => {
      console.log(`\n[${index + 1}] Path: ${post.name}`);
      if (post.fields && post.fields.title && post.fields.title.stringValue) {
        console.log(`    Title: ${post.fields.title.stringValue}`);
      }
    });
    
    if (allPosts.length > 5) {
      console.log(`\n... and ${allPosts.length - 5} more posts not shown.`);
    }
    
    // Ask for confirmation
    rl.question('\nDo you want to delete these posts? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\nDeleting posts...');
        
        let totalDeleted = 0;
        
        // Delete posts one by one with delays
        for (const post of allPosts) {
          try {
            await sleep(2000); // Delay between deletions
            await deleteDocument(token, post.name);
            totalDeleted++;
            console.log(`Deleted post ${totalDeleted}/${allPosts.length}: ${post.name}`);
          } catch (error) {
            console.error(`Failed to delete post ${post.name}:`, error);
            // Continue with next post
          }
        }
        
        console.log(`\nCompleted. Successfully deleted ${totalDeleted}/${allPosts.length} posts.`);
      } else {
        console.log('Operation cancelled. No posts were deleted.');
      }
      
      rl.close();
    });
  } catch (error) {
    console.error('Error in main function:', error);
    rl.close();
  }
}

// Run the main function
findAndDeletePosts();
