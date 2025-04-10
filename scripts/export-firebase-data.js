/**
 * Script to export data from Firebase Firestore
 * Works with quota limitations by using small batch sizes and delays
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with environment variables
// You can also use a service account JSON file
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = admin.firestore();

// Helper function for sleeping
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export a collection with pagination to avoid quota issues
async function exportCollection(collectionName) {
  console.log(`Exporting collection: ${collectionName}`);
  
  const outputDir = path.join(__dirname, 'exported-data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputFile = path.join(outputDir, `${collectionName}.json`);
  
  try {
    const BATCH_SIZE = 10; // Small batch size to avoid quota issues
    let lastDoc = null;
    let allDocs = [];
    let hasMore = true;
    let batchNumber = 0;
    
    while (hasMore) {
      batchNumber++;
      console.log(`Fetching batch #${batchNumber} of ${collectionName}...`);
      
      try {
        // Build query with pagination
        let query = db.collection(collectionName).limit(BATCH_SIZE);
        
        // If we have a last document, start after it
        if (lastDoc) {
          query = query.startAfter(lastDoc);
        }
        
        // Execute query
        const querySnapshot = await query.get();
        
        // If no results, we're done
        if (querySnapshot.empty) {
          console.log(`No more documents in ${collectionName}.`);
          hasMore = false;
          continue;
        }
        
        // Get the last document for next pagination
        lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        
        // Add results to our collection
        const batchDocs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        allDocs = [...allDocs, ...batchDocs];
        
        console.log(`Retrieved batch of ${batchDocs.length} docs. Total so far: ${allDocs.length}`);
        
        // If we got fewer results than the batch size, we're done
        if (querySnapshot.docs.length < BATCH_SIZE) {
          hasMore = false;
        }
        
        // Delay to avoid quota limits
        await sleep(3000);
      } catch (error) {
        console.error(`Error fetching batch #${batchNumber} of ${collectionName}:`, error);
        
        // Longer delay after an error
        await sleep(10000);
        
        // If we've had too many errors, stop
        if (batchNumber > 10) {
          console.log(`Too many errors. Stopping export of ${collectionName}.`);
          hasMore = false;
        }
      }
    }
    
    // Write the data to a file
    fs.writeFileSync(outputFile, JSON.stringify(allDocs, null, 2));
    console.log(`Exported ${allDocs.length} documents from ${collectionName} to ${outputFile}`);
    
    return allDocs.length;
  } catch (error) {
    console.error(`Error exporting collection ${collectionName}:`, error);
    return 0;
  }
}

// Get all collections and export them
async function exportAllCollections() {
  try {
    // Get list of collections
    const collections = await db.listCollections();
    console.log(`Found ${collections.length} collections to export.`);
    
    let totalDocuments = 0;
    
    // Export each collection
    for (const collection of collections) {
      const count = await exportCollection(collection.id);
      totalDocuments += count;
      
      // Delay between collections
      await sleep(5000);
    }
    
    console.log(`Export completed. Total documents exported: ${totalDocuments}`);
  } catch (error) {
    console.error('Error exporting collections:', error);
  } finally {
    process.exit(0);
  }
}

// Run the export
exportAllCollections();
