import { whatWeDoService } from '../app/services/what-we-do';

const resourceCenterPrograms = [
  {
    title: "FSCE Learning Hub",
    excerpt: "A comprehensive learning center providing educational resources and support for children and youth.",
    content: `The FSCE Learning Hub is a state-of-the-art facility designed to support the educational needs of children and youth in our community. Our hub features:

- Modern computer lab with internet access
- Quiet study spaces
- Library with educational materials
- Tutoring and mentoring programs
- Educational workshops and seminars

We believe that education is key to breaking the cycle of poverty and creating sustainable change in our communities. The Learning Hub provides a safe and supportive environment where children can learn, grow, and reach their full potential.

Our dedicated staff and volunteers work tirelessly to ensure that every child has access to quality educational resources and support. Through partnerships with local schools and educational institutions, we offer:

1. Homework assistance programs
2. Computer literacy training
3. Language learning resources
4. STEM education initiatives
5. Creative arts programs`,
    category: "resource-center",
    coverImage: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1422&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1470&auto=format&fit=crop",
    ],
    tags: ["education", "youth development", "technology"],
    author: {
      name: "Sarah Johnson",
      email: "sarah.johnson@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson",
    },
    published: true
  },
  {
    title: "Community Research and Documentation Center",
    excerpt: "A center dedicated to researching and documenting community issues and solutions.",
    content: `The Community Research and Documentation Center serves as a hub for gathering, analyzing, and sharing information about our community's challenges and successes. Our center focuses on:

- Conducting community-based research
- Documenting best practices
- Publishing reports and case studies
- Hosting community forums
- Training community researchers

We believe that good data and documentation are essential for making informed decisions and creating effective programs. Our research helps identify:

1. Community needs and assets
2. Program effectiveness
3. Best practices in child protection
4. Emerging trends and challenges
5. Success stories and lessons learned`,
    category: "resource-center",
    coverImage: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1470&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1470&auto=format&fit=crop",
    ],
    tags: ["research", "documentation", "community development"],
    author: {
      name: "David Chen",
      email: "david.chen@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=David+Chen",
    },
    published: true
  },
  {
    title: "Training and Capacity Building Center",
    excerpt: "A dedicated facility for training community workers and building organizational capacity.",
    content: `The Training and Capacity Building Center is dedicated to strengthening the skills and capabilities of our staff, partners, and community members. We offer:

- Professional development workshops
- Skills training programs
- Leadership development courses
- Certification programs
- Mentoring and coaching

Our training programs cover various areas including:

1. Child protection and rights
2. Community development
3. Project management
4. Counseling and support
5. Monitoring and evaluation

Through our capacity building efforts, we aim to create a strong network of skilled professionals who can effectively serve our community's needs.`,
    category: "resource-center",
    coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1470&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1470&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop",
    ],
    tags: ["training", "capacity building", "professional development"],
    author: {
      name: "Michael Brown",
      email: "michael.brown@fsce.org",
      avatar: "https://ui-avatars.com/api/?name=Michael+Brown",
    },
    published: true
  }
];

async function addResourceCenterPrograms() {
  try {
    for (const program of resourceCenterPrograms) {
      await whatWeDoService.createProgram(program);
      console.log(`Successfully added program: ${program.title}`);
    }
    console.log('All resource center programs added successfully!');
  } catch (error) {
    console.error('Error adding programs:', error);
  }
}

addResourceCenterPrograms();
