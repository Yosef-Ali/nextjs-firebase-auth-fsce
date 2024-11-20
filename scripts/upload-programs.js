const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const programContent = require('./program-content');

// Your Firebase configuration
const firebaseConfig = {
  // Add your Firebase config here
  // apiKey: "your-api-key",
  // authDomain: "your-auth-domain",
  // projectId: "your-project-id",
  // storageBucket: "your-storage-bucket",
  // messagingSenderId: "your-messaging-sender-id",
  // appId: "your-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function uploadPrograms() {
  try {
    // Upload Prevention & Promotion programs
    for (const program of programContent.prevention_promotion) {
      await addDoc(collection(db, 'programs'), program);
      console.log(`Uploaded prevention-promotion program: ${program.title}`);
    }

    // Upload Protection programs
    for (const program of programContent.protection) {
      await addDoc(collection(db, 'programs'), program);
      console.log(`Uploaded protection program: ${program.title}`);
    }

    // Upload Rehabilitation programs
    for (const program of programContent.rehabilitation) {
      await addDoc(collection(db, 'programs'), program);
      console.log(`Uploaded rehabilitation program: ${program.title}`);
    }

    console.log('All programs uploaded successfully!');
  } catch (error) {
    console.error('Error uploading programs:', error);
  }
}

// Run the upload
uploadPrograms();
