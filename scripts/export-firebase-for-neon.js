/**
 * Script to export Firebase data for Neon PostgreSQL migration
 * Handles quota limitations with small batch sizes and delays
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin (use environment variables or service account)
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
  
  const outputDir = path.join(__dirname, 'neon-migration');
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
    
    // Also collect schema information
    let schemaFields = new Set();
    let fieldTypes = {};
    
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
        
        // Process documents
        const batchDocs = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Collect schema information
          Object.keys(data).forEach(field => {
            schemaFields.add(field);
            
            // Determine field type
            const value = data[field];
            let type = typeof value;
            
            if (value === null) {
              type = 'null';
            } else if (value instanceof admin.firestore.Timestamp) {
              type = 'timestamp';
            } else if (Array.isArray(value)) {
              type = 'array';
            } else if (type === 'object') {
              if (value._latitude !== undefined && value._longitude !== undefined) {
                type = 'geopoint';
              }
            }
            
            // Store field type information
            if (!fieldTypes[field]) {
              fieldTypes[field] = new Set();
            }
            fieldTypes[field].add(type);
          });
          
          return {
            id: doc.id,
            ...data
          };
        });
        
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
    
    // Convert field types from Set to Array for JSON serialization
    Object.keys(fieldTypes).forEach(field => {
      fieldTypes[field] = Array.from(fieldTypes[field]);
    });
    
    // Write the data to a file
    fs.writeFileSync(outputFile, JSON.stringify(allDocs, null, 2));
    console.log(`Exported ${allDocs.length} documents from ${collectionName} to ${outputFile}`);
    
    // Write schema information
    const schemaFile = path.join(outputDir, `${collectionName}_schema.json`);
    fs.writeFileSync(schemaFile, JSON.stringify({
      fields: Array.from(schemaFields),
      fieldTypes: fieldTypes
    }, null, 2));
    console.log(`Exported schema information for ${collectionName} to ${schemaFile}`);
    
    return allDocs.length;
  } catch (error) {
    console.error(`Error exporting collection ${collectionName}:`, error);
    return 0;
  }
}

// Generate SQL schema based on collection schema
function generateSqlSchema(collectionName, schemaPath) {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const fields = schema.fields;
    const fieldTypes = schema.fieldTypes;
    
    let sqlSchema = `CREATE TABLE ${collectionName} (\n`;
    sqlSchema += '  id TEXT PRIMARY KEY,\n';
    
    const sqlFields = fields.map(field => {
      const types = fieldTypes[field];
      
      // Determine PostgreSQL type based on Firebase types
      let sqlType = 'TEXT';
      
      if (types.includes('timestamp')) {
        sqlType = 'TIMESTAMP';
      } else if (types.includes('number') && !types.includes('string')) {
        sqlType = 'NUMERIC';
      } else if (types.includes('boolean') && !types.includes('string')) {
        sqlType = 'BOOLEAN';
      } else if (types.includes('array') || types.includes('object')) {
        sqlType = 'JSONB';
      } else if (types.includes('geopoint')) {
        sqlType = 'POINT';
      }
      
      // Handle nullable fields
      const nullable = types.includes('null') ? '' : ' NOT NULL';
      
      return `  ${field} ${sqlType}${nullable}`;
    });
    
    sqlSchema += sqlFields.join(',\n');
    sqlSchema += '\n);\n';
    
    const sqlPath = path.join(path.dirname(schemaPath), `${collectionName}_schema.sql`);
    fs.writeFileSync(sqlPath, sqlSchema);
    console.log(`Generated SQL schema for ${collectionName} at ${sqlPath}`);
    
    return sqlSchema;
  } catch (error) {
    console.error(`Error generating SQL schema for ${collectionName}:`, error);
    return null;
  }
}

// Get all collections and export them
async function exportAllCollections() {
  try {
    // Get list of collections
    const collections = await db.listCollections();
    console.log(`Found ${collections.length} collections to export.`);
    
    let totalDocuments = 0;
    let allSchemas = '';
    
    // Export each collection
    for (const collection of collections) {
      const collectionName = collection.id;
      const count = await exportCollection(collectionName);
      totalDocuments += count;
      
      // Generate SQL schema
      const schemaPath = path.join(__dirname, 'neon-migration', `${collectionName}_schema.json`);
      const sqlSchema = generateSqlSchema(collectionName, schemaPath);
      if (sqlSchema) {
        allSchemas += sqlSchema + '\n';
      }
      
      // Delay between collections
      await sleep(5000);
    }
    
    // Write combined schema file
    const combinedSchemaPath = path.join(__dirname, 'neon-migration', 'combined_schema.sql');
    fs.writeFileSync(combinedSchemaPath, allSchemas);
    console.log(`Combined SQL schema written to ${combinedSchemaPath}`);
    
    console.log(`Export completed. Total documents exported: ${totalDocuments}`);
  } catch (error) {
    console.error('Error exporting collections:', error);
  } finally {
    process.exit(0);
  }
}

// Run the export
exportAllCollections();
