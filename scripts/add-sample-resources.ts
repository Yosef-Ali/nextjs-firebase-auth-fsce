import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'resources';

const sampleResources = [
  // Reports
  {
    title: "Annual Impact Report 2023",
    description: "Comprehensive report on FSCE's activities and impact throughout 2023",
    category: "report",
    type: "pdf",
    fileUrl: "/resources/reports/annual-impact-report-2023.pdf",
    fileSize: "2.4 MB",
    downloadCount: 145,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["annual report", "impact", "2023"]
  },
  {
    title: "Child Protection Policy Framework",
    description: "Detailed framework outlining FSCE's approach to child protection",
    category: "report",
    type: "pdf",
    fileUrl: "/resources/reports/child-protection-policy.pdf",
    fileSize: "1.8 MB",
    downloadCount: 89,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["policy", "child protection"]
  },
  
  // Publications
  {
    title: "Best Practices in Child Education",
    description: "Guide for educators and caregivers on effective educational practices",
    category: "publication",
    type: "doc",
    fileUrl: "/resources/publications/best-practices-guide.doc",
    fileSize: "850 KB",
    downloadCount: 234,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["education", "best practices", "guide"]
  },
  {
    title: "Community Engagement Handbook",
    description: "Guidelines for effective community engagement and participation",
    category: "publication",
    type: "pdf",
    fileUrl: "/resources/publications/community-handbook.pdf",
    fileSize: "1.2 MB",
    downloadCount: 167,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["community", "engagement", "handbook"]
  },
  
  // Media Resources
  {
    title: "Children's Success Stories",
    description: "Collection of success stories from FSCE's programs",
    category: "media",
    type: "pdf",
    fileUrl: "/resources/media/success-stories-2023.pdf",
    fileSize: "3.1 MB",
    downloadCount: 312,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["success stories", "impact", "children"]
  },
  {
    title: "FSCE Programs Overview",
    description: "Visual presentation of FSCE's key programs and initiatives",
    category: "media",
    type: "image",
    fileUrl: "/resources/media/programs-overview.jpg",
    fileSize: "4.5 MB",
    downloadCount: 198,
    published: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    tags: ["programs", "overview", "presentation"]
  }
];

async function addSampleResources() {
  try {
    const resourcesRef = collection(db, COLLECTION_NAME);
    
    for (const resource of sampleResources) {
      await addDoc(resourcesRef, resource);
      console.log(`Added resource: ${resource.title}`);
    }
    
    console.log('Successfully added all sample resources!');
  } catch (error) {
    console.error('Error adding sample resources:', error);
  }
}

// Run the function
addSampleResources();
