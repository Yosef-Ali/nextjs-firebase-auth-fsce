#!/usr/bin/env node

// Required environment variables for Firebase
const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
];

// Check each required environment variable
const missingVars = requiredEnvVars.filter(varName => {
    const value = process.env[varName];
    if (!value) {
        console.error(`❌ Missing environment variable: ${varName}`);
        return true;
    }

    // Additional validation for API key
    if (varName === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
        if (!value.startsWith('AIza')) {
            console.error(`❌ Invalid Firebase API key format. Should start with 'AIza'`);
            return true;
        }
    }

    console.log(`✅ Found ${varName}: ${varName === 'NEXT_PUBLIC_FIREBASE_API_KEY' ? value.substring(0, 8) + '...' : 'OK'}`);
    return false;
});

if (missingVars.length > 0) {
    console.error('\n⛔️ Missing or invalid environment variables detected!');
    console.error('Please check your .env.local file and ensure all required variables are set correctly.');
    process.exit(1);
} else {
    console.log('\n✅ All required environment variables are present and valid!');
}
