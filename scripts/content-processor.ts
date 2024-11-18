import { Post } from '../app/types/post';
import { readFileSync } from 'fs';
import slugify from 'slugify';

interface ContentSection {
  title: string;
  content: string;
  category: string;
}

const categories = {
  'values-principles': 'Values & Principles',
  'board-members': 'Board Members',
  'partners': 'Partners',
  'merits': 'Merits',
  'prevention-promotion': 'Prevention & Promotion',
  'protection': 'Protection',
  'rehabilitation': 'Rehabilitation',
  'resource-center': 'Resource Center',
  'situation-analysis': 'Situation Analysis',
  'humanitarian': 'Humanitarian',
  'youth': 'Youth'
} as const;

function determineCategory(title: string, content: string): string {
  const combinedText = (title + ' ' + content).toLowerCase();
  
  // Check for specific category indicators
  if (combinedText.includes('value') || combinedText.includes('principle') || combinedText.includes('core values')) {
    return 'values-principles';
  }
  if (combinedText.includes('board') || combinedText.includes('governance') || combinedText.includes('leadership')) {
    return 'board-members';
  }
  if (combinedText.includes('partner') || combinedText.includes('stakeholder') || combinedText.includes('collaboration')) {
    return 'partners';
  }
  if (combinedText.includes('achievement') || combinedText.includes('success') || combinedText.includes('accomplishment')) {
    return 'merits';
  }
  if (combinedText.includes('prevention') || combinedText.includes('promotion') || combinedText.includes('awareness')) {
    return 'prevention-promotion';
  }
  if (combinedText.includes('protection') || combinedText.includes('child rights') || combinedText.includes('child abuse')) {
    return 'protection';
  }
  if (combinedText.includes('rehabilitation') || combinedText.includes('reintegration') || combinedText.includes('recovery')) {
    return 'rehabilitation';
  }
  if (combinedText.includes('resource') || combinedText.includes('database') || combinedText.includes('knowledge')) {
    return 'resource-center';
  }
  if (combinedText.includes('situation') || combinedText.includes('analysis') || combinedText.includes('assessment')) {
    return 'situation-analysis';
  }
  if (combinedText.includes('humanitarian') || combinedText.includes('emergency') || combinedText.includes('crisis')) {
    return 'humanitarian';
  }
  if (combinedText.includes('youth') || combinedText.includes('young people') || combinedText.includes('adolescent')) {
    return 'youth';
  }
  
  // Default to situation-analysis if no specific matches
  return 'situation-analysis';
}

function extractSections(content: string): ContentSection[] {
  const sections: ContentSection[] = [];
  const lines = content.split('\n');
  let currentSection: ContentSection | null = null;
  
  for (let line of lines) {
    line = line.trim();
    
    if (!line) continue;
    
    // Check if line is a header (starts with number and dot, or is all caps)
    if (line.match(/^\d+\./) || line.match(/^[A-Z\s.]{5,}$/)) {
      if (currentSection) {
        // Set the category based on content before adding to sections
        currentSection.category = determineCategory(currentSection.title, currentSection.content);
        sections.push(currentSection);
      }
      
      currentSection = {
        title: line,
        content: '',
        category: 'situation-analysis' // Default category, will be updated when section is complete
      };
    } else if (currentSection) {
      currentSection.content += line + '\n';
    }
  }
  
  // Add the last section
  if (currentSection) {
    currentSection.category = determineCategory(currentSection.title, currentSection.content);
    sections.push(currentSection);
  }
  
  return sections;
}

function createPost(section: ContentSection): Post {
  const timestamp = Date.now();
  // Create a shorter ID by taking only the first 50 characters of the slugified title
  const shortTitle = section.title.split(' ')[0]; // Take first word
  const id = `${slugify(shortTitle, { lower: true })}-${timestamp}`;
  
  return {
    id,
    title: section.title,
    content: section.content,
    excerpt: section.content.slice(0, 200) + '...',
    category: section.category,
    published: true,
    authorId: 'system',
    authorEmail: 'system@example.com',
    createdAt: timestamp,
    updatedAt: timestamp,
    slug: slugify(section.title, { lower: true }),
    tags: [section.category]
  };
}

function processContent(): Post[] {
  const content = readFileSync('./scripts/extracted-content.txt', 'utf-8');
  const sections = extractSections(content);
  return sections.map(createPost);
}

export { processContent, categories };
