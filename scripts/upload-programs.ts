import { db } from '../app/firebase';
import { collection, addDoc } from 'firebase/firestore';
import programContent from './program-content';

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
