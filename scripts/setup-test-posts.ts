import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = require('../fsce-2024-firebase-adminsdk-hvhpp-4f942b32f6.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const testPosts = [
  {
    title: 'Test Achievement Post',
    excerpt: 'A test achievement post',
    content: 'This is a test achievement post content',
    status: 'published',
    category: {
      id: 'achievements',
      name: 'Achievements',
      type: 'post',
      slug: 'achievements'
    },
    slug: 'test-achievement-post',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    title: 'Test Child Protection Post',
    excerpt: 'A test child protection post',
    content: 'This is a test child protection post content',
    status: 'published',
    category: {
      id: 'child-protection',
      name: 'Child Protection',
      type: 'post',
      slug: 'child-protection'
    },
    slug: 'test-child-protection-post',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    title: 'Test Advocacy Post',
    excerpt: 'A test advocacy post',
    content: 'This is a test advocacy post content',
    status: 'published',
    category: {
      id: 'advocacy',
      name: 'Advocacy',
      type: 'post', 
      slug: 'advocacy'
    },
    slug: 'test-advocacy-post',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    title: 'Test Event Post',
    excerpt: 'A test event post',
    content: 'This is a test event post content',
    status: 'published',
    category: {
      id: 'events',
      name: 'Events',
      type: 'post',
      slug: 'events'
    },
    slug: 'test-event-post',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  },
  {
    title: 'Test Youth Empowerment Post',
    excerpt: 'A test youth empowerment post',
    content: 'This is a test youth empowerment post content',
    status: 'published',
    category: {
      id: 'youth-empowerment',
      name: 'Youth Empowerment',
      type: 'post',
      slug: 'youth-empowerment'
    },
    slug: 'test-youth-empowerment-post',
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now()
  }
];

async function setupTestPosts() {
  try {
    for (const post of testPosts) {
      await db.collection('posts').add(post);
      console.log(`Created test post: ${post.title}`);
    }
    
    console.log('Test posts setup completed');
  } catch (error) {
    console.error('Error setting up test posts:', error);
  }
}

// Run the setup
setupTestPosts();