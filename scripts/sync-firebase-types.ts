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

// Import specific types from firebase/firestore
import type { Timestamp as FirestoreTimestamp } from 'firebase/firestore';

// Import specific types from firebase/storage
import type {
  FirebaseStorage,
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
} from 'firebase/storage';

export {
  FirebaseStorage,
  StorageReference,
  UploadMetadata,
  UploadTask,
  UploadTaskSnapshot
};

// Export Timestamp type
export type Timestamp = FirestoreTimestamp;

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

// Common data types used throughout the application
export interface BaseDocument {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface Category extends BaseDocument {
  name: string;
  slug: string;
  description?: string;
  type: 'post' | 'resource' | 'award' | 'recognition' | 'event';
  count?: number;
}

export interface Post extends BaseDocument {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  category?: Category | string;
  author?: string;
  authorId?: string;
  image?: string;
  published?: boolean;
  sticky?: boolean;
  featured?: boolean;
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
