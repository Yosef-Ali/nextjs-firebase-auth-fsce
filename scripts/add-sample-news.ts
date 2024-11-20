import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

const sampleNews = [
  // Featured News
  {
    title: "FSCE Launches Major Child Protection Initiative",
    content: "The Foundation for Supporting Children's Education (FSCE) has launched a groundbreaking nationwide initiative aimed at protecting vulnerable children...",
    excerpt: "A comprehensive new program to enhance child protection across Ethiopia, featuring community engagement and innovative support systems.",
    category: "major",
    slug: "fsce-launches-major-child-protection-initiative",
    coverImage: "/images/news/child-protection.jpg",
    published: true,
    featured: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["child protection", "initiative", "community"]
  },
  {
    title: "Partnership with UNICEF Expands Educational Access",
    content: "FSCE and UNICEF have joined forces in a landmark partnership to expand educational access for vulnerable children...",
    excerpt: "New collaboration with UNICEF will provide educational opportunities to thousands more children across Ethiopia.",
    category: "partnership",
    slug: "partnership-with-unicef-expands-educational-access",
    coverImage: "/images/news/unicef-partnership.jpg",
    published: true,
    featured: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["partnership", "education", "UNICEF"]
  },

  // Regular News - Major Updates
  {
    title: "Annual Impact Report Shows Significant Progress",
    content: "Our 2023 Impact Report reveals remarkable progress in child welfare and education...",
    excerpt: "Key achievements and milestones from FSCE's work throughout 2023, showing substantial impact in child welfare.",
    category: "major",
    slug: "annual-impact-report-2023",
    coverImage: "/images/news/impact-report.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["report", "impact", "achievements"]
  },
  {
    title: "New Regional Office Opens in Dire Dawa",
    content: "FSCE expands its presence with a new regional office in Dire Dawa...",
    excerpt: "Expanding our reach to help more children in the Dire Dawa region with a new fully-staffed office.",
    category: "major",
    slug: "new-office-dire-dawa",
    coverImage: "/images/news/dire-dawa-office.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["expansion", "regional office"]
  },

  // Program News
  {
    title: "Summer Education Program Launches",
    content: "FSCE's summer education program kicks off with exciting new curriculum...",
    excerpt: "New summer program offering educational support and enrichment activities for children.",
    category: "program",
    slug: "summer-education-program-2024",
    coverImage: "/images/news/summer-program.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["education", "summer program"]
  },
  {
    title: "Vocational Training Program Expands",
    content: "Our successful vocational training program adds new courses and locations...",
    excerpt: "Expansion of vocational training opportunities with new courses in technology and crafts.",
    category: "program",
    slug: "vocational-training-expansion",
    coverImage: "/images/news/vocational-training.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["vocational training", "education"]
  },

  // Impact Stories
  {
    title: "Success Story: Sarah's Journey to Education",
    content: "Meet Sarah, whose life was transformed through FSCE's educational support...",
    excerpt: "Inspiring story of how FSCE's support helped Sarah overcome challenges and pursue her education.",
    category: "impact",
    slug: "success-story-sarah",
    coverImage: "/images/news/success-story.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["success story", "education", "impact"]
  },
  {
    title: "Community Impact: Addis Ababa Youth Center",
    content: "How our youth center in Addis Ababa is changing lives...",
    excerpt: "The remarkable impact of our youth center in providing safe spaces and opportunities for young people.",
    category: "impact",
    slug: "addis-ababa-youth-center-impact",
    coverImage: "/images/news/youth-center.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["youth center", "community impact"]
  },

  // Partnership News
  {
    title: "Local Businesses Join Child Support Initiative",
    content: "Leading businesses in Ethiopia partner with FSCE for child support...",
    excerpt: "New partnerships with local businesses to provide resources and opportunities for children in need.",
    category: "partnership",
    slug: "local-business-partnerships",
    coverImage: "/images/news/business-partnership.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["partnership", "business", "support"]
  },
  {
    title: "International NGO Collaboration Announced",
    content: "FSCE partners with international NGOs for expanded impact...",
    excerpt: "New international partnerships to bring global best practices and resources to our programs.",
    category: "partnership",
    slug: "international-ngo-collaboration",
    coverImage: "/images/news/ngo-collaboration.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["partnership", "international", "NGO"]
  }
];

async function addSampleNews() {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    
    for (const news of sampleNews) {
      await addDoc(postsRef, news);
      console.log(`Added news: ${news.title}`);
    }
    
    console.log('Successfully added all sample news articles!');
  } catch (error) {
    console.error('Error adding sample news:', error);
  }
}

// Run the function
addSampleNews();
