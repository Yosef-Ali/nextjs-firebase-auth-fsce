import axios from 'axios';
import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import { slug } from 'github-slugger';
import { auth } from '../app/firebase';

interface ScrapedPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  published: boolean;
  authorId: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  slug: string;
}

const FSCE_URL = 'https://www.fsc-e.org';

// We'll update these with actual user info when running the script
const AUTHOR_ID = auth.currentUser?.uid || 'default-author-id';
const AUTHOR_EMAIL = auth.currentUser?.email || 'default@example.com';

async function fetchPage(url: string): Promise<string> {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return '';
  }
}

function cleanContent(content: string): string {
  return content
    .replace(/[\n\r]+/g, '\n') // Replace multiple newlines with single
    .replace(/\s+/g, ' ') // Replace multiple spaces with single
    .trim();
}

function extractContent($: cheerio.CheerioAPI): string {
  // Get main content areas
  const mainContent = $('.main-content, article, .content-area').map((_, el) => {
    const $el = $(el);
    // Remove navigation, footer, and other non-content areas
    $el.find('nav, footer, .navigation, .menu, script, style').remove();
    return $el.text();
  }).get().join('\n');

  return cleanContent(mainContent);
}

async function scrapeFSCE() {
  const posts: ScrapedPost[] = [];
  const html = await fetchPage(FSCE_URL);
  const $ = cheerio.load(html);

  // Main navigation items as categories
  const categories = [
    'who-we-are',
    'what-we-do',
    'our-work',
    'news-and-resources',
    'contact-us'
  ];

  // Scrape each category
  for (const category of categories) {
    const categoryUrl = `${FSCE_URL}/${category}`;
    console.log(`Scraping category: ${category}`);
    
    const categoryHtml = await fetchPage(categoryUrl);
    const $category = cheerio.load(categoryHtml);

    // Extract content
    const content = extractContent($category);
    const title = $category('h1').first().text().trim() || 
                 category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    if (content) {
      const postId = slug(title);
      const post: ScrapedPost = {
        id: postId,
        title,
        content,
        excerpt: content.slice(0, 150) + '...',
        category,
        published: true,
        authorId: AUTHOR_ID,
        authorEmail: AUTHOR_EMAIL,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        slug: slug(category)
      };

      posts.push(post);
      console.log(`Added post: ${title}`);

      // Look for sub-pages
      $category('a[href^="/' + category + '/"]').each(async (_, el) => {
        const subPath = $(el).attr('href');
        if (subPath) {
          const subUrl = `${FSCE_URL}${subPath}`;
          console.log(`Found sub-page: ${subUrl}`);
          
          const subHtml = await fetchPage(subUrl);
          const $sub = cheerio.load(subHtml);
          const subContent = extractContent($sub);
          const subTitle = $sub('h1').first().text().trim() || 
                          subPath.split('/').pop()?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') ||
                          'Untitled';

          if (subContent) {
            const subPostId = slug(subTitle);
            const subPost: ScrapedPost = {
              id: subPostId,
              title: subTitle,
              content: subContent,
              excerpt: subContent.slice(0, 150) + '...',
              category,
              published: true,
              authorId: AUTHOR_ID,
              authorEmail: AUTHOR_EMAIL,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              slug: slug(subTitle)
            };

            posts.push(subPost);
            console.log(`Added sub-page post: ${subTitle}`);
          }
        }
      });
    }
  }

  // Save scraped data
  writeFileSync(
    './scripts/scraped-posts.json',
    JSON.stringify(posts, null, 2)
  );

  console.log(`Scraped ${posts.length} posts`);
  return posts;
}

// Create Firebase seed file
async function createFirebaseSeed(posts: ScrapedPost[]) {
  writeFileSync(
    './scripts/firebase-seed.json',
    JSON.stringify(posts, null, 2)
  );

  console.log('Created Firebase seed file');
}

// Run the scraper
scrapeFSCE()
  .then(createFirebaseSeed)
  .catch(console.error);
