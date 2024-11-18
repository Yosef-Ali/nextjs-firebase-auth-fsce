import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import GithubSlugger from 'github-slugger';

const slugger = new GithubSlugger();

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  parentCategory: string;
  published: boolean;
  authorId: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  slug: string;
}

// Define the menu structure to match the website
const categoryMap = {
  'who-we-are': {
    title: 'Who We Are',
    subcategories: {
      'values-principles': 'Values and Principles',
      'board-members': 'Board Members',
      'partners': 'Partners',
      'merits': 'Merits'
    }
  },
  'what-we-do': {
    title: 'What We Do',
    subcategories: {
      'prevention-promotion': 'Prevention and Promotion Program',
      'protection': 'Protection',
      'rehabilitation': 'Rehabilitation and Reintegration',
      'resource-center': 'Child Resource Center'
    }
  },
  'where-we-work': {
    title: 'Where We Work',
    subcategories: {
      'city-offices': 'City Area Program Offices',
      'regional-offices': 'Regional Area Program Offices'
    }
  },
  'resources': {
    title: 'Resources',
    subcategories: {
      'reports': 'Reports and Reviews',
      'publications': 'FSCE Publications',
      'case-stories': 'Case Stories'
    }
  }
};

// Keywords to help identify content for each category
const categoryKeywords = {
  'values-principles': ['values', 'principles', 'mission', 'vision', 'beliefs', 'core values'],
  'partners': ['partners', 'stakeholders', 'collaboration', 'partnership', 'NGOs', 'government bodies'],
  'merits': ['achievements', 'recognition', 'success', 'impact', 'awards'],
  'prevention-promotion': ['prevention', 'awareness', 'community mobilization', 'early intervention'],
  'protection': ['protection', 'child rights', 'safeguarding', 'safety', 'abuse prevention'],
  'rehabilitation': ['rehabilitation', 'reintegration', 'recovery', 'support services'],
  'resource-center': ['resource center', 'facilities', 'education', 'training'],
  'case-stories': ['case', 'story', 'experience', 'child story', 'success story']
};

function findCategory(text: string): { parent: string; sub: string } | null {
  // First try to match based on keywords
  for (const [subKey, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )) {
      // Find the parent category based on the subcategory
      for (const [parentKey, parent] of Object.entries(categoryMap)) {
        if (parent.subcategories[subKey]) {
          return { parent: parentKey, sub: subKey };
        }
      }
    }
  }
  
  // If no keyword match, try matching based on category titles
  for (const [parentKey, parent] of Object.entries(categoryMap)) {
    for (const [subKey, subTitle] of Object.entries(parent.subcategories)) {
      if (
        text.toLowerCase().includes(subTitle.toLowerCase()) ||
        subTitle.toLowerCase().includes(text.toLowerCase())
      ) {
        return { parent: parentKey, sub: subKey };
      }
    }
  }
  
  return null;
}

const content = `Forum on Sustainable Child Empowerment (FSCE)

Strategic Plan (Final Draft)
(2021-2025)

1. INTRODUCTION

1.1 Brief Country Overview
Ethiopia's economy which is largely dependent on exports of the primary sector, though showing growth is challenged by many factors including weak production base, low international prices for agricultural products, the world economic crisis, the sharp increase in negative balance of trade, high rates of inflation and unemployment and in particular youth unemployment. While the government has developed and is implementing economic policies and strategies to improve the economic situations, the challenges have persisted. The poverty situation in Ethiopia is grave. The country, being one of the poorest in the world, has children who are exposed to deprivations of basic economic needs.

1.2 Child Protection Context
Children are the future generation who will be socialized and grown in a good healthy condition because they are the future adults and development in overall the world. Today, child problems like child labor, trafficking, early marriage, female genital mutilation, sexual abuse, rape and so forth are viewed as a grievous issue throughout the world. Particularly in Africa, Asia and Latin America, the problem is very serious. It is a critical human rights problem because it denies the child's time to take part in activities that are useful for the 'normal' growth of the child like time to go to school and time to play (ILO, 2016).

1.3 Situation of Youth in Ethiopia
The economic performance of a country is mainly depending on the labour of youth population. Energetic, courageous and qualified youth can make changes to the social and economic development if they are well utilized and managed. Investing in youth now will lay the groundwork for Ethiopia's future. Ethiopia has experienced unprecedented population growth, with 69.5% of its population being under 29 years of age. Youths between the ages of 15 and 29 years constitute approximately 30% of the population, and this is expected to grow from 35 to 40 million within the next decade.

1.4 Current Humanitarian Need
The primary aim of humanitarianism is to protect those in immediate risk and the prevention of unnecessary suffering. Ethiopia is highly vulnerable to climatic shocks and is one of the most drought-prone countries in the world. Under this HRP, an estimated 13 million people are targeted for humanitarian response in drought affected areas. Women and children are disproportionately affected during times of crisis and make up more than two-thirds of the people in need in 2023 in Ethiopia.

2. STAKEHOLDERS ANALYSIS
FSCE works with various stakeholders including government bodies, community organizations, and international partners to achieve its mission of protecting and empowering children. Key stakeholders include the Ministry of Women and Social Affairs, local community leaders, and other NGOs working in child protection.

3. SWOT ANALYSIS
Strengths:
- Strong community presence and trust
- Experienced staff and proven track record
- Established partnerships with key stakeholders

Weaknesses:
- Limited financial resources
- Geographic coverage constraints
- Need for improved monitoring systems

4. CRITICAL ISSUES
The organization faces several critical issues that need to be addressed:
1. Increasing cases of child trafficking and abuse
2. Limited resources for program expansion
3. Need for improved coordination with stakeholders
4. Challenges in reaching remote areas

5. PROPOSED VISION, MISSION, PROGRAMS AND STRATEGIES

5.1 Vision
To see a society where children are free from abuse, exploitation, and violence, and their rights are fully respected.

5.2 Mission
To work towards the protection and empowerment of vulnerable children through integrated community-based interventions.

5.3 Core Programs
Our core programs include:
1. Child Protection and Rights
2. Youth Empowerment
3. Community Development
4. Emergency Response

5.4 Strategies and Approaches
We employ various strategies including:
- Community mobilization and awareness
- Capacity building of stakeholders
- Direct service provision
- Advocacy and networking

6. THE STRATEGIC PLAN IMPLEMENTATION

6.1 Implementation Process
The implementation will follow a phased approach:
Phase 1: Preparation and planning
Phase 2: Program rollout
Phase 3: Monitoring and adjustment

6.2 Work Plans
Annual work plans will be developed with clear:
- Objectives and targets
- Timeline and milestones
- Resource requirements
- Responsible parties

6.3 Monitoring and Evaluation
Regular monitoring and evaluation will be conducted to:
- Track progress against targets
- Identify challenges and solutions
- Document lessons learned
- Adjust strategies as needed`;

async function extractPosts() {
  // Split content into sections based on headers and clear breaks
  const sections = content.split(/(?=\n\d+\.(?:\d+)?[\s\n]+[A-Z]|\n[A-Z][^a-z\n]+:|\n\n[A-Z][^a-z\n]{2,})/);
  
  const posts: Post[] = [];
  let currentParent = '';
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    if (section.length < 100) continue;
    
    // Get the full text for category matching
    const fullText = section.toLowerCase();
    
    // Try to extract title from the first non-empty line
    const lines = section.split('\n').filter(line => line.trim().length > 0);
    let title = lines[0].trim().replace(/^\d+\.(?:\d+)?\s*/, '');
    
    if (title.length > 100 || title.match(/^[a-z]/)) {
      const potentialTitle = lines.slice(0, 3).find(line => 
        line.length < 100 && line.match(/^[A-Z]/)
      );
      title = potentialTitle || `Section ${i + 1}`;
    }
    
    // Find appropriate category based on content and title
    const categoryMatch = findCategory(title + ' ' + fullText);
    if (!categoryMatch) continue;
    
    // Clean up content
    const content = lines
      .slice(1)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    if (content.length > 100) {
      const timestamp = Date.now();
      posts.push({
        id: `${categoryMatch.sub}-${timestamp}`,
        title: title.replace(/^[^a-zA-Z]+/, '').trim(),
        content,
        excerpt: content.substring(0, 200).trim() + '...',
        category: categoryMatch.sub,
        parentCategory: categoryMatch.parent,
        published: true,
        authorId: 'default',
        authorEmail: 'admin@fsce.org',
        createdAt: timestamp,
        updatedAt: timestamp,
        slug: slugger.slug(title)
      });
    }
  }
  
  return posts;
}

async function uploadToFirebase(posts: Post[]) {
  console.log(`Starting upload of ${posts.length} posts to Firebase...`);
  
  for (const post of posts) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.fromMillis(post.createdAt),
        updatedAt: Timestamp.fromMillis(post.updatedAt)
      });
      console.log(`✓ Document written with ID: ${docRef.id}`);
      console.log(`  Title: ${post.title}`);
      console.log(`  Category: ${post.parentCategory} > ${post.category}`);
      console.log('---');
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }
}

async function main() {
  try {
    const posts = await extractPosts();
    console.log(`Extracted ${posts.length} posts from document`);
    
    if (posts.length === 0) {
      console.error('No posts were extracted. Check the content and parsing logic.');
      process.exit(1);
    }
    
    await uploadToFirebase(posts);
    console.log('Content migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
