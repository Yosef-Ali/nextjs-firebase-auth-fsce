import { db } from '../app/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import slugify from 'slugify';

const demoPosts = [
  {
    title: '[DEMO] Prevention & Early Intervention Programs',
    content: `This is a demo post that will be deleted after development.

Key Prevention Programs:
- Early childhood development initiatives
- Community awareness campaigns
- School-based prevention programs
- Family support services

Our prevention and promotion activities focus on stopping child abuse and exploitation before they occur through education, awareness, and community engagement.`,
    category: 'prevention-promotion',
    isDemo: true
  },
  {
    title: '[DEMO] Youth Violence Prevention Initiative',
    content: `This is a demo post that will be deleted after development.

Prevention Strategy Components:
1. School-based violence prevention
2. Community youth engagement
3. Parent education programs
4. Peer mentoring initiatives

Working with communities to prevent youth violence and promote positive development.`,
    category: 'prevention-promotion',
    isDemo: true
  },
  {
    title: '[DEMO] Child Rehabilitation Center Programs',
    content: `This is a demo post that will be deleted after development.

Rehabilitation Services:
- Trauma-informed counseling
- Educational support
- Life skills training
- Family reunification
- Vocational training

Our rehabilitation programs help children recover and reintegrate into their communities.`,
    category: 'rehabilitation',
    isDemo: true
  },
  {
    title: '[DEMO] Street Children Rehabilitation Project',
    content: `This is a demo post that will be deleted after development.

Program Components:
1. Emergency shelter
2. Medical care
3. Psychological support
4. Education programs
5. Family tracing

Supporting street children in their journey to rehabilitation and family reunification.`,
    category: 'rehabilitation',
    isDemo: true
  }
];

async function seedDemoPosts() {
  try {
    const postsCollection = collection(db, 'posts');
    
    console.log('Adding demo posts...');
    for (const post of demoPosts) {
      const postId = slugify(post.title, { lower: true, strict: true });
      const docRef = doc(postsCollection, postId);
      
      await setDoc(docRef, {
        ...post,
        slug: postId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log(`Added demo post: ${post.title}`);
    }
    
    console.log('\nDemo posts added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding demo posts:', error);
    process.exit(1);
  }
}

seedDemoPosts();
