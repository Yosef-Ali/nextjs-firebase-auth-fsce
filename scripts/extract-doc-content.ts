import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import GithubSlugger from 'github-slugger';
import textract from 'textract';
import { promisify } from 'util';

const extractFromFile = promisify(textract.fromFileWithPath);
const slugger = new GithubSlugger();

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  published: boolean;
  authorId: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  slug: string;
}

async function extractContent() {
  const docPath = './app/dashboard/_components/docs/SPM  FSCE 2021-2025 Final Draft.doc';
  
  try {
    // Extract text from the doc file
    const text = await extractFromFile(docPath);
    
    // Split content into sections based on line breaks and potential headers
    const sections = text.split(/\n{2,}|\r\n{2,}/);
    
    const posts: Post[] = [];
    let currentTitle = '';
    let currentContent = [];
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      
      if (lines.length === 0) continue;
      
      // Check if this section starts with what looks like a title
      // (all caps, or shorter than 100 chars and ends with period)
      const potentialTitle = lines[0].trim();
      if (potentialTitle.toUpperCase() === potentialTitle || 
          (potentialTitle.length < 100 && !potentialTitle.endsWith('.'))) {
        
        // If we have accumulated content, create a post
        if (currentTitle && currentContent.length > 0) {
          const content = currentContent.join('\n\n');
          if (content.length > 50) { // Only create posts for substantial content
            posts.push({
              id: `doc-section-${posts.length + 1}-${Date.now()}`,
              title: currentTitle,
              content,
              excerpt: content.substring(0, 200) + '...',
              category: 'strategic-plan',
              published: true,
              authorId: 'default',
              authorEmail: 'admin@fsce.org',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              slug: slugger.slug(currentTitle)
            });
          }
        }
        
        // Start new section
        currentTitle = potentialTitle;
        currentContent = [];
      } else {
        // Add to current content
        currentContent.push(section.trim());
      }
    }
    
    // Don't forget to add the last section
    if (currentTitle && currentContent.length > 0) {
      const content = currentContent.join('\n\n');
      if (content.length > 50) {
        posts.push({
          id: `doc-section-${posts.length + 1}-${Date.now()}`,
          title: currentTitle,
          content,
          excerpt: content.substring(0, 200) + '...',
          category: 'strategic-plan',
          published: true,
          authorId: 'default',
          authorEmail: 'admin@fsce.org',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          slug: slugger.slug(currentTitle)
        });
      }
    }
    
    return posts;
  } catch (error) {
    console.error('Error extracting content:', error);
    throw error;
  }
}

async function uploadToFirebase(posts: Post[]) {
  console.log('Uploading to Firebase...');
  
  for (const post of posts) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.fromMillis(post.createdAt),
        updatedAt: Timestamp.fromMillis(post.updatedAt)
      });
      console.log(`Document written with ID: ${docRef.id}`);
      console.log(`Title: ${post.title}`);
      console.log(`Excerpt: ${post.excerpt}`);
      console.log('---');
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }
}

async function main() {
  try {
    const posts = await extractContent();
    console.log(`Extracted ${posts.length} posts from document`);
    await uploadToFirebase(posts);
    console.log('Content migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
