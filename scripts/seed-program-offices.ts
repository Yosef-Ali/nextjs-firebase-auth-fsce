const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Your web app's Firebase configuration
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

const programOffices = [
  {
    id: 'addis-ababa',
    type: 'Program',
    region: 'Addis Ababa',
    location: 'Addis Ababa',
    address: 'Bole Sub City, Woreda 03, Addis Ababa',
    contact: '+251 116 393 229',
    email: 'info.addis@example.org',
    beneficiaries: 'Serving over 5,000 children and families',
    programs: [
      'Early Years Development',
      'Youth Leadership',
      'Family Support Services',
      'Community Development'
    ]
  },
  {
    id: 'bahir-dar',
    type: 'Program',
    region: 'Amhara',
    location: 'Bahir Dar',
    address: 'Belay Zeleke Kebele, Bahir Dar',
    contact: '+251 582 206 795',
    email: 'info.bahirdar@example.org',
    beneficiaries: 'Supporting 3,000+ vulnerable children',
    programs: [
      'Child Protection Services',
      'Education Access Initiative',
      'Health & Nutrition Program',
      'Vocational Skills Training'
    ]
  },
  {
    id: 'hawassa',
    type: 'Program',
    region: 'SNNPR',
    location: 'Hawassa',
    address: 'Tabor Sub City, Hawassa',
    contact: '+251 462 208 091',
    email: 'info.hawassa@example.org',
    beneficiaries: 'Reaching 4,000+ children and youth',
    programs: [
      'Educational Empowerment',
      'Child Sponsorship Program',
      'Community Outreach Initiative',
      'Youth Development Program'
    ]
  },
  {
    id: 'mekelle',
    type: 'Program',
    region: 'Tigray',
    location: 'Mekelle',
    address: 'Hadnet Sub City, Mekelle',
    contact: '+251 344 409 284',
    email: 'info.mekelle@example.org',
    beneficiaries: 'Assisting 2,500+ families and children',
    programs: [
      'Emergency Response Unit',
      'Child Education Center',
      'Family Support Network',
      'Community Resilience Building'
    ]
  },
  {
    id: 'addis-ababa-ece',
    type: 'Early Childhood Education',
    region: 'Addis Ababa',
    location: 'Addis Ababa',
    address: 'Kirkos Sub City, Woreda 02, Addis Ababa',
    contact: '+251 115 555 555',
    email: 'ece.addis@example.org',
    beneficiaries: 'Focusing on early learning for 300 children',
    programs: [
      'Preschool Education',
      'Early Literacy Program',
      'Nutritional Support',
      'Parenting Workshops'
    ]
  },
  {
    id: 'bahir-dar-ece',
    type: 'Early Childhood Education',
    region: 'Amhara',
    location: 'Bahir Dar',
    address: ' வேறொரு இடம், Bahir Dar',
    contact: '+251 582 207 777',
    email: 'ece.bahirdar@example.org',
    beneficiaries: 'Providing quality care for 250 young learners',
    programs: [
      'Creative Arts Program',
      'Language Development',
      'Social Skills Training',
      'Outdoor Play Activities'
    ]
  }
];

async function seedProgramOffices() {
  try {
    for (const office of programOffices) {
      const docRef = doc(collection(db, 'programOffices'), office.id);
      await setDoc(docRef, {
        ...office,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`Added program office: ${office.location}`);
    }
    console.log('Successfully seeded program offices!');
  } catch (error) {
    console.error('Error seeding program offices:', error);
  }
}

// Run the seeding
seedProgramOffices().then(() => {
  console.log('Seeding complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
