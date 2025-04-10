/**
 * Script to import Firebase data to Neon PostgreSQL
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Neon connection string
const NEON_CONNECTION_STRING = process.env.NEON_CONNECTION_STRING;

if (!NEON_CONNECTION_STRING) {
  console.error('Missing Neon connection string. Set NEON_CONNECTION_STRING environment variable.');
  process.exit(1);
}

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: NEON_CONNECTION_STRING,
});

// Helper function for sleeping
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to convert Firebase data for PostgreSQL
function convertForPostgres(data) {
  const result = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null) {
      result[key] = null;
    } else if (typeof value === 'object') {
      if (value._seconds !== undefined && value._nanoseconds !== undefined) {
        // Convert Firestore timestamp to PostgreSQL timestamp
        result[key] = new Date(value._seconds * 1000 + value._nanoseconds / 1000000);
      } else if (value._latitude !== undefined && value._longitude !== undefined) {
        // Convert GeoPoint to PostgreSQL point
        result[key] = `(${value._latitude},${value._longitude})`;
      } else if (Array.isArray(value)) {
        // Convert array to JSON
        result[key] = JSON.stringify(value);
      } else {
        // Convert object to JSON
        result[key] = JSON.stringify(value);
      }
    } else {
      // Primitive values
      result[key] = value;
    }
  }
  
  return result;
}

// Create tables from SQL schema
async function createTables() {
  try {
    const schemaPath = path.join(__dirname, 'neon-migration', 'combined_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema file not found: ${schemaPath}`);
      return false;
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema creation
    const client = await pool.connect();
    try {
      await client.query(schema);
      console.log('Successfully created database schema');
      return true;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Import a collection to Neon
async function importCollection(collectionName) {
  console.log(`Importing collection: ${collectionName}`);
  
  const inputDir = path.join(__dirname, 'neon-migration');
  const inputFile = path.join(inputDir, `${collectionName}.json`);
  
  if (!fs.existsSync(inputFile)) {
    console.error(`File not found: ${inputFile}`);
    return 0;
  }
  
  try {
    // Read the exported data
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    console.log(`Loaded ${data.length} documents from ${inputFile}`);
    
    // Import in small batches to avoid rate limits
    const BATCH_SIZE = 20;
    let imported = 0;
    
    const client = await pool.connect();
    
    try {
      for (let i = 0; i < data.length; i += BATCH_SIZE) {
        const batch = data.slice(i, i + BATCH_SIZE);
        console.log(`Importing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(data.length / BATCH_SIZE)}`);
        
        // Start a transaction for this batch
        await client.query('BEGIN');
        
        try {
          for (const doc of batch) {
            const { id, ...docData } = doc;
            const convertedData = convertForPostgres(docData);
            
            // Build the query dynamically
            const fields = ['id', ...Object.keys(convertedData)];
            const placeholders = ['$1', ...fields.slice(1).map((_, idx) => `$${idx + 2}`)];
            const values = [id, ...Object.values(convertedData)];
            
            const query = `
              INSERT INTO ${collectionName} (${fields.join(', ')})
              VALUES (${placeholders.join(', ')})
              ON CONFLICT (id) DO UPDATE
              SET ${fields.slice(1).map((field, idx) => `${field} = $${idx + 2}`).join(', ')}
            `;
            
            await client.query(query, values);
            imported++;
          }
          
          // Commit the transaction
          await client.query('COMMIT');
          console.log(`Imported batch of ${batch.length} documents. Total: ${imported}/${data.length}`);
        } catch (error) {
          // Rollback on error
          await client.query('ROLLBACK');
          console.error(`Error importing batch:`, error);
        }
        
        // Delay to avoid rate limits
        await sleep(1000);
      }
    } finally {
      client.release();
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
    // Create tables first
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('Failed to create tables. Aborting import.');
      process.exit(1);
    }
    
    const inputDir = path.join(__dirname, 'neon-migration');
    
    if (!fs.existsSync(inputDir)) {
      console.error(`Export directory not found: ${inputDir}`);
      process.exit(1);
    }
    
    // Get all JSON files in the export directory (excluding schema files)
    const files = fs.readdirSync(inputDir)
      .filter(file => file.endsWith('.json') && !file.includes('_schema'));
    
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
    await pool.end();
    process.exit(0);
  }
}

// Run the import
importAllCollections();
