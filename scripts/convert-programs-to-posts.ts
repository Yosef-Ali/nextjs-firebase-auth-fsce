import { db } from '../app/firebase';
import { collection, addDoc } from 'firebase/firestore';
import programContent from './program-content';
import { Post } from '../app/types/post';

// Convert a program to post format
function convertProgramToPost(program: any): Partial<Post> {
  // Convert the rich text content array to a string
  const contentString = program.content
    .map((block: any) => block.children.map((child: any) => child.text).join('\n'))
    .join('\n\n');

  // Create a slug from the title
  const slug = program.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  // Convert objectives to a formatted string
  const objectivesString = program.objectives 
    ? '\n\nObjectives:\n' + program.objectives.map((obj: string) => `• ${obj}`).join('\n')
    : '';

  return {
    id: program.id,
    title: program.title,
    content: contentString + objectivesString,
    excerpt: program.excerpt,
    category: program.category,  // Use the program category directly
    coverImage: program.coverImage,
    published: program.published,
    authorId: process.env.ADMIN_USER_ID || 'admin',  // You'll need to set this
    authorEmail: process.env.ADMIN_EMAIL || 'admin@fsce.org',  // You'll need to set this
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['programs'],
    slug: slug
  };
}

async function uploadProgramsAsPosts() {
  try {
    const postsCollection = collection(db, 'posts');
    
    // Convert and upload Prevention & Promotion programs
    for (const program of programContent.prevention_promotion) {
      const post = convertProgramToPost(program);
      await addDoc(postsCollection, post);
      console.log(`Uploaded prevention-promotion post: ${program.title}`);
    }

    // Convert and upload Protection programs
    for (const program of programContent.protection) {
      const post = convertProgramToPost(program);
      await addDoc(postsCollection, post);
      console.log(`Uploaded protection post: ${program.title}`);
    }

    // Convert and upload Rehabilitation programs
    for (const program of programContent.rehabilitation) {
      const post = convertProgramToPost(program);
      await addDoc(postsCollection, post);
      console.log(`Uploaded rehabilitation post: ${program.title}`);
    }

    console.log('All programs converted and uploaded as posts successfully!');
  } catch (error) {
    console.error('Error uploading programs as posts:', error);
  }
}

// Run the upload
uploadProgramsAsPosts();
