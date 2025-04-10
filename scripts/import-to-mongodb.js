/**
 * Script to import data from Firebase export to MongoDB Atlas
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB Atlas connection string
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MongoDB connection string. Set MONGODB_URI environment variable.');
  process.exit(1);
}

// Helper function for sleeping
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to convert Firebase Timestamp to Date
function convertTimestamps(obj) {
  if (!obj) return obj;
  
  const newObj = { ...obj };
  
  for (const [key, value] of Object.entries(newObj)) {
    // Handle nested objects recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value._seconds !== undefined && value._nanoseconds !== undefined) {
        // This is a Firestore Timestamp
        newObj[key] = new Date(value._seconds * 1000);
      } else {
        newObj[key] = convertTimestamps(value);
      }
    } else if (Array.isArray(value)) {
      // Handle arrays
      newObj[key] = value.map(item => 
        typeof item === 'object' ? convertTimestamps(item) : item
      );
    }
  }
  
  return newObj;
}

// Import a collection to MongoDB
async function importCollection(client, collectionName) {
  console.log(`Importing collection: ${collectionName}`);
  
  const inputDir = path.join(__dirname, 'exported-data');
  const inputFile = path.join(inputDir, `${collectionName}.json`);
  
  if (!fs.existsSync(inputFile)) {
    console.error(`File not found: ${inputFile}`);
    return 0;
  }
  
  try {
    // Read the exported data
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Loaded ${data.length} documents from ${inputFile}`);
    
    // Convert Firebase timestamps to MongoDB Date objects
    const convertedData = data.map(doc => {
      // Extract the ID and use it as MongoDB _id
      const { id, ...docData } = doc;
      return { 
        _id: id, 
        ...convertTimestamps(docData) 
      };
    });
    
    // Get the database and collection
    const db = client.db('firebase-migration');
    const collection = db.collection(collectionName);
    
    // Import in small batches to avoid rate limits
    const BATCH_SIZE = 20;
    let imported = 0;
    
    for (let i = 0; i < convertedData.length; i += BATCH_SIZE) {
      const batch = convertedData.slice(i, i + BATCH_SIZE);
      console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(convertedData.length / BATCH_SIZE)}`);
      
      try {
        // Insert data into MongoDB
        const result = await collection.insertMany(batch, { ordered: false });
        imported += result.insertedCount;
        console.log(`Imported ${result.insertedCount} documents. Total: ${imported}/${convertedData.length}`);
      } catch (error) {
        if (error.writeErrors) {
          // Some documents might have been inserted despite errors
          const insertedCount = error.result.nInserted;
          imported += insertedCount;
          console.log(`Partially imported batch (${insertedCount} documents). Total: ${imported}/${convertedData.length}`);
          console.error(`Errors: ${error.writeErrors.length}`);
        } else {
          console.error(`Error importing batch:`, error);
        }
      }
      
      // Delay to avoid rate limits
      await sleep(1000);
    }
    
    console.log(`Imported ${imported} documents to ${collectionName}`);
    return imported;
  } catch (error) {
    console.error(`Error importing collection ${collectionName}:`, error);
    return 0;
  }
}

// Import all collections
async function importAllCollections() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const inputDir = path.join(__dirname, 'exported-data');
    
    if (!fs.existsSync(inputDir)) {
      console.error(`Export directory not found: ${inputDir}`);
      process.exit(1);
    }
    
    // Get all JSON files in the export directory
    const files = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} collections to import.`);
    
    let totalDocuments = 0;
    
    // Import each collection
    for (const file of files) {
      const collectionName = file.replace('.json', '');
      const count = await importCollection(client, collectionName);
      totalDocuments += count;
      
      // Delay between collections
      await sleep(3000);
    }
    
    console.log(`Import completed. Total documents imported: ${totalDocuments}`);
  } catch (error) {
    console.error('Error importing collections:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
    process.exit(0);
  }
}

// Run the import
importAllCollections();
