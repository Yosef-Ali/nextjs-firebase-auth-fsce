/**
 * Script to import data from Firebase export to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_KEY environment variables.');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper function for sleeping
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to convert Firebase Timestamp to ISO string
function convertTimestamps(obj) {
  if (!obj) return obj;
  
  const newObj = { ...obj };
  
  for (const [key, value] of Object.entries(newObj)) {
    // Handle nested objects recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (value._seconds !== undefined && value._nanoseconds !== undefined) {
        // This is a Firestore Timestamp
        newObj[key] = new Date(value._seconds * 1000).toISOString();
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

// Import a collection to Supabase
async function importCollection(collectionName) {
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
    
    // Convert Firebase timestamps to ISO strings
    const convertedData = data.map(doc => convertTimestamps(doc));
    
    // Import in small batches to avoid rate limits
    const BATCH_SIZE = 20;
    let imported = 0;
    
    for (let i = 0; i < convertedData.length; i += BATCH_SIZE) {
      const batch = convertedData.slice(i, i + BATCH_SIZE);
      console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(convertedData.length / BATCH_SIZE)}`);
      
      try {
        // Insert data into Supabase
        const { data: insertedData, error } = await supabase
          .from(collectionName)
          .insert(batch);
        
        if (error) {
          console.error(`Error importing batch:`, error);
        } else {
          imported += batch.length;
          console.log(`Imported ${batch.length} documents. Total: ${imported}/${convertedData.length}`);
        }
      } catch (error) {
        console.error(`Error importing batch:`, error);
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
  try {
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
      const count = await importCollection(collectionName);
      totalDocuments += count;
      
      // Delay between collections
      await sleep(3000);
    }
    
    console.log(`Import completed. Total documents imported: ${totalDocuments}`);
  } catch (error) {
    console.error('Error importing collections:', error);
  } finally {
    process.exit(0);
  }
}

// Run the import
importAllCollections();
