import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

async function addAboutContent() {
  const now = Timestamp.now();
  
  try {
    const postsRef = collection(db, COLLECTION_NAME);

    // Vision Content
    await addDoc(postsRef, {
      title: "Our Vision",
      content: "To see a society where all children and youth are protected, empowered, and thriving.",
      section: 'vision',
      published: true,
      category: 'about',
      excerpt: 'Our vision for the future of Ethiopian children and youth',
      coverImage: '/images/vision.jpg',
      authorId: 'system',
      authorEmail: 'system@fsce.org',
      slug: 'our-vision',
      createdAt: now,
      updatedAt: now
    });

    // Mission Content
    await addDoc(postsRef, {
      title: "Our Mission",
      content: "To protect and empower children and youth through innovative programs, advocacy, and sustainable community development.",
      section: 'mission',
      published: true,
      category: 'about',
      excerpt: 'Our mission to protect and empower',
      coverImage: '/images/mission.jpg',
      authorId: 'system',
      authorEmail: 'system@fsce.org',
      slug: 'our-mission',
      createdAt: now,
      updatedAt: now
    });

    // Goals Content
    await addDoc(postsRef, {
      title: "Our Goals",
      content: `1. Protect children from abuse and exploitation
2. Provide quality education and skills training
3. Strengthen community-based child protection
4. Advocate for children's rights
5. Build sustainable programs`,
      section: 'goals',
      published: true,
      category: 'about',
      excerpt: 'Our strategic goals and objectives',
      coverImage: '/images/goals.jpg',
      authorId: 'system',
      authorEmail: 'system@fsce.org',
      slug: 'our-goals',
      createdAt: now,
      updatedAt: now
    });

    console.log('Successfully added about content!');
  } catch (error) {
    console.error('Error adding about content:', error);
  }
}

addAboutContent();
