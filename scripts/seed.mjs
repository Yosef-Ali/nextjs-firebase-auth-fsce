import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

const partners = [
  {
    name: "Kinder Not Hilfe",
    email: "info@kindernothilfe.org",
    phone: "+49 203 7789-0",
    website: "https://www.kindernothilfe.org/",
    description: "Kinder Not Hilfe supports childrens education and well-being globally, bringing over 20 years of expertise.",
    logoUrl: "/images/Logo-Kindernothilfe.svg.png",
    position: "Strategic Partner"
  },
  {
    name: "International Organization for Migration (IOM)",
    email: "info@iom.int",
    phone: "+41 22 717 9111",
    website: "https://www.iom.int/",
    description: "The International Organization for Migration (IOM) supports migration and humanitarian efforts worldwide, providing assistance to vulnerable populations and fostering safe migration practices.",
    logoUrl: "/images/iom.jpg",
    position: "Strategic Partner"
  },
  {
    name: "Defence for Children International (DCI)",
    email: "info@defenceforchildren.org",
    phone: "+41 22 734 0558",
    website: "https://defenceforchildren.org/",
    description: "Partner Three manages the financial aspects of the company and ensures fiscal responsibility.",
    logoUrl: "/images/usaid.png",
    position: "Strategic Partner"
  },
  {
    name: "ECPAT International",
    email: "info@ecpat.org",
    phone: "+66 2 215 3388",
    website: "https://ecpat.org",
    description: "A global network dedicated to ending the sexual exploitation of children, advocating for better policies and protective measures worldwide.",
    logoUrl: "/images/ECPAT_logo.png",
    position: "Supporting Partner"
  },
  {
    name: "Ethiopiaid",
    email: "info@ethiopiaid.org",
    phone: "+44 1225 476 385",
    website: "https://ethiopiaid.org",
    description: "Dedicated to helping the poorest people in Ethiopia, providing essential aid and support to uplift communities.",
    logoUrl: "/images/ethiopiaid-logo-with-stapline.jpg",
    position: "Supporting Partner"
  },
  {
    name: "German Cooperation with Ethiopia",
    email: "info@giz.de",
    phone: "+49 228 44 60-0",
    website: "https://www.giz.de/en/worldwide/336.html",
    description: "A partnership between Germany and Ethiopia, working together to foster development and support mutual growth.",
    logoUrl: "/images/EW1ousPXYAAI_L4.jpg",
    position: "Supporting Partner"
  },
  {
    name: "Family for Every Child",
    email: "info@familyforeverychild.org",
    phone: "+44 20 7250 8300",
    website: "https://www.familyforeverychild.org",
    description: "A global network working to ensure every child grows up in a safe, caring family environment, free from violence and neglect.",
    logoUrl: "/images/family-for-every-child-logo.png",
    position: "Supporting Partner"
  },
  {
    name: "Kinderpostzegels",
    email: "info@kinderpostzegels.nl",
    phone: "+31 71 525 9800",
    website: "https://www.kinderpostzegels.nl",
    description: "An initiative dedicated to supporting children's welfare, driven by children for children, and fostering a sense of community and care.",
    logoUrl: "/images/kinderpostzegels.png",
    position: "Supporting Partner"
  },
  {
    name: "Ministry of Labour and Social Affairs(MoLSA)",
    email: "info@molsa.gov.et",
    phone: "+251 11 551 7080",
    website: "http://www.molsa.gov.et",
    description: "A government body dedicated to improving social welfare and labor conditions, ensuring a better quality of life for all citizens.",
    logoUrl: "/images/Logo-of-Ethiopian-Ministry-of-Labor-and-Social-Affairs.jpg",
    position: "Supporting Partner"
  },
  {
    name: "American Speech-Language-Hearing Association (ASHA)",
    email: "actioncenter@asha.org",
    phone: "+1 800-498-2071",
    website: "https://www.asha.org",
    description: "A professional organization committed to empowering and supporting audiologists and speech-language pathologists to provide the best care.",
    logoUrl: "/images/oak_correct.png",
    position: "Supporting Partner"
  }
];

async function seedPartners() {
  try {
    console.log("🌱 Starting to seed partners...");
    
    for (const partner of partners) {
      await addDoc(collection(db, "partners"), {
        ...partner,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Added partner: ${partner.name}`);
    }
    
    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding partners:", error);
  }
}

// Run the seed function
seedPartners();
