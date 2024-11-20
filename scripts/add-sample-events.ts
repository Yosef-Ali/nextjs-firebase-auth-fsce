import { postsService } from '../app/services/posts';

const samplePosts = [
  {
    title: "Annual Child Protection Conference 2024",
    excerpt: "Join us for our annual conference focusing on innovative approaches to child protection.",
    content: `The Annual Child Protection Conference 2024 brings together experts, practitioners, and advocates to discuss the latest developments in child protection. This year's theme is "Innovation in Child Protection: Building Safer Communities."

Key Topics:
- Digital safety for children
- Community-based protection mechanisms
- Mental health support for at-risk youth
- Innovative intervention strategies
- Policy advocacy and reform

The conference will feature keynote speakers, panel discussions, workshops, and networking opportunities. Don't miss this chance to learn from and connect with leaders in child protection.`,
    category: "events",
    coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1470&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1544531585-9847b68c8c86?q=80&w=1470&auto=format&fit=crop"
    ],
    date: "2024-06-15",
    time: "9:00 AM - 5:00 PM",
    location: "FSCE Conference Center, Addis Ababa",
    registrationLink: "https://example.com/register",
    tags: ["conference", "child protection", "networking"],
    author: {
      name: "Event Team",
      email: "events@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Event+Team"
    },
    published: true
  },
  {
    title: "Youth Empowerment Workshop Series",
    excerpt: "A series of workshops designed to empower youth with essential life skills and knowledge.",
    content: `Join us for our comprehensive Youth Empowerment Workshop Series, designed to equip young people with the skills and knowledge they need to succeed.

Workshop Topics:
1. Leadership Development
2. Digital Skills Training
3. Financial Literacy
4. Career Planning
5. Communication Skills

Each workshop includes hands-on activities, group discussions, and practical exercises. Participants will receive certificates upon completion.`,
    category: "events",
    coverImage: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1469&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1469&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop"
    ],
    date: "2024-05-01",
    time: "2:00 PM - 5:00 PM",
    location: "FSCE Youth Center",
    registrationLink: "https://example.com/register-workshop",
    tags: ["workshop", "youth empowerment", "training"],
    author: {
      name: "Youth Program Team",
      email: "youth@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Youth+Program"
    },
    published: true
  },
  {
    title: "FSCE Launches New Child Protection Initiative",
    excerpt: "A groundbreaking program to enhance child protection in vulnerable communities.",
    content: `FSCE is proud to announce the launch of our new Child Protection Initiative, aimed at strengthening community-based protection mechanisms for vulnerable children.

The initiative includes:
- Community awareness programs
- Training for local leaders
- Support services for families
- Partnership with local authorities
- Regular monitoring and evaluation

This program represents a significant step forward in our mission to protect and empower children in Ethiopia.`,
    category: "news",
    coverImage: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1470&auto=format&fit=crop",
    tags: ["child protection", "community", "initiative"],
    author: {
      name: "Communications Team",
      email: "communications@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Communications"
    },
    published: true
  },
  {
    title: "FSCE Receives International Recognition",
    excerpt: "Our organization's work in child protection has been recognized by international bodies.",
    content: `FSCE's dedication to child protection and welfare has received international recognition from leading organizations in the field.

Key Achievements:
- Excellence in Program Implementation
- Innovation in Community Engagement
- Sustainable Impact Award
- Best Practices in Child Protection

This recognition validates our approach and motivates us to continue our vital work in protecting and supporting vulnerable children.`,
    category: "news",
    coverImage: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1470&auto=format&fit=crop",
    tags: ["achievement", "recognition", "impact"],
    author: {
      name: "Communications Team",
      email: "communications@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Communications"
    },
    published: true
  }
];

async function addSampleContent() {
  try {
    // Add posts
    for (const post of samplePosts) {
      await postsService.createPost(post);
      console.log(`Successfully added post: ${post.title}`);
    }

    console.log('All sample content added successfully!');
  } catch (error) {
    console.error('Error adding sample content:', error);
  }
}

addSampleContent();
