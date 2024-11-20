import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const COLLECTION_NAME = 'posts';

// Helper function to create timestamps for future dates
const getFutureDate = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

const sampleEvents = [
  // Featured Events
  {
    title: "Annual Child Protection Conference 2024",
    content: "Join us for FSCE's flagship conference on child protection, featuring international speakers, workshops, and networking opportunities...",
    excerpt: "A two-day conference bringing together experts, practitioners, and stakeholders in child protection.",
    category: "conference",
    slug: "annual-child-protection-conference-2024",
    coverImage: "/images/events/conference.jpg",
    published: true,
    featured: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(30), // One month from now
    location: "Skylight Hotel, Addis Ababa",
    time: "9:00 AM - 5:00 PM",
    tags: ["conference", "child protection", "networking"]
  },
  {
    title: "Youth Leadership Workshop Series",
    content: "A comprehensive series of workshops designed to develop leadership skills among youth...",
    excerpt: "Six-week workshop series focusing on leadership development, communication, and project management.",
    category: "workshop",
    slug: "youth-leadership-workshop-series",
    coverImage: "/images/events/workshop.jpg",
    published: true,
    featured: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(14), // Two weeks from now
    location: "FSCE Youth Center, Addis Ababa",
    time: "2:00 PM - 5:00 PM",
    tags: ["workshop", "youth", "leadership"]
  },

  // Regular Events
  {
    title: "Community Awareness Campaign: Child Rights",
    content: "Join our community awareness campaign focused on child rights and protection...",
    excerpt: "Interactive sessions and discussions about child rights with community leaders and families.",
    category: "campaign",
    slug: "community-awareness-campaign",
    coverImage: "/images/events/campaign.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(7), // One week from now
    location: "Various Community Centers, Addis Ababa",
    time: "10:00 AM - 4:00 PM",
    tags: ["community", "awareness", "child rights"]
  },
  {
    title: "Vocational Skills Training Workshop",
    content: "Practical training workshop teaching valuable vocational skills to youth...",
    excerpt: "Hands-on training in various vocational skills including crafts, technology, and business basics.",
    category: "training",
    slug: "vocational-skills-training",
    coverImage: "/images/events/training.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(10), // Ten days from now
    location: "FSCE Training Center, Dire Dawa",
    time: "9:00 AM - 3:00 PM",
    tags: ["training", "vocational skills", "youth"]
  },
  {
    title: "Parent-Teacher Education Forum",
    content: "A collaborative forum bringing together parents and teachers to discuss children's education...",
    excerpt: "Interactive discussion forum on improving educational support for children at home and school.",
    category: "forum",
    slug: "parent-teacher-education-forum",
    coverImage: "/images/events/forum.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(21), // Three weeks from now
    location: "Local School Hall, Addis Ababa",
    time: "4:00 PM - 6:00 PM",
    tags: ["education", "parents", "teachers"]
  },
  {
    title: "Children's Art Exhibition",
    content: "Showcasing artwork created by children in FSCE programs...",
    excerpt: "A celebration of creativity featuring artwork by children from various FSCE programs.",
    category: "exhibition",
    slug: "childrens-art-exhibition",
    coverImage: "/images/events/exhibition.jpg",
    published: true,
    authorId: "1",
    authorEmail: "admin@fsce.org",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    date: getFutureDate(5), // Five days from now
    location: "FSCE Community Center, Addis Ababa",
    time: "11:00 AM - 6:00 PM",
    tags: ["art", "exhibition", "children"]
  }
];

async function addSampleEvents() {
  try {
    const postsRef = collection(db, COLLECTION_NAME);
    
    for (const event of sampleEvents) {
      await addDoc(postsRef, event);
      console.log(`Added event: ${event.title}`);
    }
    
    console.log('Successfully added all sample events!');
  } catch (error) {
    console.error('Error adding sample events:', error);
  }
}

// Run the function
addSampleEvents();
