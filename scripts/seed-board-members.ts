import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const boardMembers = [
  {
    name: "Dr. Sarah Johnson",
    position: "Board Chair",
    bio: "Dr. Sarah Johnson is a distinguished pediatrician with over 20 years of experience in child healthcare. She has dedicated her career to improving healthcare access for underprivileged children and has been instrumental in developing several community health programs.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
    featured: true,
    order: 1,
    status: "published"
  },
  {
    name: "Michael Chen",
    position: "Vice Chair",
    bio: "Michael Chen brings 15 years of experience in nonprofit management and strategic planning. His expertise in sustainable development has helped numerous organizations achieve their mission-driven goals while maintaining financial stability.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
    featured: true,
    order: 2,
    status: "published"
  },
  {
    name: "Dr. Emily Rodriguez",
    position: "Secretary",
    bio: "Dr. Emily Rodriguez is an education policy expert with a Ph.D. in Early Childhood Development. She has published extensively on innovative approaches to early childhood education and has advised various governmental bodies on education reform.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop",
    featured: false,
    order: 3,
    status: "published"
  },
  {
    name: "David Okonjo",
    position: "Treasurer",
    bio: "David Okonjo is a certified public accountant with extensive experience in nonprofit financial management. He has helped numerous organizations optimize their financial operations and ensure compliance with regulatory requirements.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
    featured: false,
    order: 4,
    status: "published"
  },
  {
    name: "Dr. Lisa Zhang",
    position: "Board Member",
    bio: "Dr. Lisa Zhang is a child psychologist specializing in trauma-informed care. Her research and practical experience have been vital in developing mental health support programs for children in crisis situations.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1888&auto=format&fit=crop",
    featured: false,
    order: 5,
    status: "published"
  }
];

const seedBoardMembers = async () => {
  try {
    const promises = boardMembers.map(member => 
      addDoc(collection(db, "board-members"), {
        ...member,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    );
    
    await Promise.all(promises);
    console.log("Successfully seeded board members");
  } catch (error) {
    console.error("Error seeding board members:", error);
  }
};

// Run the seed function
seedBoardMembers();
