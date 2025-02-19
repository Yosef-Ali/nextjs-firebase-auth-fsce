// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Check for required Firebase Admin environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL',
    'NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY'
];

console.log('Current environment variables:');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID);
console.log('CLIENT_EMAIL:', process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL);
console.log('PRIVATE_KEY length:', process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY?.length);

const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missing.forEach(envVar => {
        console.error('\x1b[31m%s\x1b[0m', `  - ${envVar}`);
    });
    console.error('\x1b[33m%s\x1b[0m', '\nPlease add these to your .env.local file:');
    console.error('\x1b[36m%s\x1b[0m', `
NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL=your-service-account-email
NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY=your-private-key
`);
    process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set');