import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const sampleEvents = [
    {
        title: "Annual Community Gathering 2024",
        excerpt: "Join us for our annual community gathering featuring keynote speakers, workshops, and community activities.",
        content: "Full description of the annual community gathering...",
        slug: "annual-community-gathering-2024",
        category: {
            id: "Events",
            name: "Events"
        },
        published: true,
        authorId: "system",
        authorEmail: "system@fsce.org",
        date: new Date().toISOString(),
        featured: true,
        coverImage: "https://picsum.photos/800/400"
    },
    {
        title: "Youth Development Workshop",
        excerpt: "A workshop focused on empowering youth through skill development and leadership training.",
        content: "Detailed description of the youth development workshop...",
        slug: "youth-development-workshop",
        category: {
            id: "Events",
            name: "Events"
        },
        published: true,
        authorId: "system",
        authorEmail: "system@fsce.org",
        date: new Date().toISOString(),
        coverImage: "https://picsum.photos/800/400"
    },
    {
        title: "Child Protection Seminar",
        excerpt: "Educational seminar on child protection strategies and best practices.",
        content: "In-depth information about the child protection seminar...",
        slug: "child-protection-seminar",
        category: {
            id: "Events",
            name: "Events"
        },
        published: true,
        authorId: "system",
        authorEmail: "system@fsce.org",
        date: new Date().toISOString(),
        coverImage: "https://picsum.photos/800/400"
    }
];

async function seedEvents() {
    try {
        const postsRef = collection(db, 'posts');

        for (const event of sampleEvents) {
            const eventData = {
                ...event,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(postsRef, eventData);
            console.log(`Created event: ${event.title}`);
        }

        console.log('Successfully seeded events');
    } catch (error) {
        console.error('Error seeding events:', error);
    }
}

// Run the seeding
seedEvents();