import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const FIREBASE_PACKAGES = [
    '@firebase/app-types',
    '@firebase/auth-types',
    '@firebase/firestore-types',
    '@firebase/storage-types',
    '@firebase/functions-types',
    '@firebase/analytics-types'
];

async function syncFirebaseTypes() {
    console.log('🔄 Syncing Firebase types...');

    // Create types directory if it doesn't exist
    const typesDir = path.join(process.cwd(), 'app/types/firebase');
    if (!fs.existsSync(typesDir)) {
        fs.mkdirSync(typesDir, { recursive: true });
    }

    // Install Firebase type packages
    console.log('📦 Installing Firebase type packages...');
    try {
        execSync(`pnpm add -D ${FIREBASE_PACKAGES.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ Failed to install Firebase type packages:', error);
        process.exit(1);
    }

    // Create index.ts to re-export all Firebase types
    const indexContent = `// Auto-generated Firebase type definitions
${FIREBASE_PACKAGES.map(pkg => `import '${pkg}';`).join('\n')}

// Re-export types from firebase
export * from '@firebase/app-types';
export * from '@firebase/auth-types';
export * from '@firebase/firestore-types';
export * from '@firebase/storage-types';
export * from '@firebase/functions-types';
export * from '@firebase/analytics-types';

// Explicitly declare commonly used types
declare module 'firebase/app' {
  export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  }
}

// Add any custom type augmentations here
declare module 'firebase/auth' {
  export interface UserInfo {
    role?: string;
    status?: string;
  }
}
`;

    // Write the index.ts file
    const indexPath = path.join(typesDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Firebase types synchronized successfully!');

    // Update tsconfig.json to include the new types
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    if (!tsconfig.compilerOptions.typeRoots) {
        tsconfig.compilerOptions.typeRoots = [];
    }

    if (!tsconfig.compilerOptions.typeRoots.includes('./app/types')) {
        tsconfig.compilerOptions.typeRoots.push('./app/types');
        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log('✅ Updated tsconfig.json with new type roots');
    }
}

// Run the sync script
syncFirebaseTypes().catch(console.error);