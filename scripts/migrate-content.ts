import puppeteer from 'puppeteer';
import GithubSlugger from 'github-slugger';
import { db } from '../app/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const slugger = new GithubSlugger();

interface ScrapedPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  published: boolean;
  authorId: string;
  authorEmail: string;
  createdAt: number;
  updatedAt: number;
  slug: string;
}

const categories = [
  'who-we-are',
  'what-we-do',
  'our-work',
  'news-and-resources',
  'contact-us'
];

const BASE_URL = 'https://www.fsc-e.org';

async function scrapeContent() {
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set a desktop user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const posts: ScrapedPost[] = [];

  for (const category of categories) {
    console.log(`Scraping category: ${category}`);
    
    try {
      await page.goto(`${BASE_URL}/${category}`, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Wait for any content to load
      await page.waitForSelector('body', { timeout: 10000 });

      // Get main content
      const content = await page.evaluate(() => {
        // Remove unwanted elements
        document.querySelectorAll('nav, footer, script, style, iframe, header').forEach(el => el.remove());
        
        // Try different content selectors
        const contentSelectors = ['main', 'article', '.content', '.page-content', '#content'];
        let content = '';
        
        for (const selector of contentSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.innerHTML;
            break;
          }
        }
        
        // If no content found, get body content
        if (!content) {
          content = document.body.innerHTML;
        }
        
        return content;
      });

      const title = await page.evaluate(() => {
        // Try different title selectors
        const titleSelectors = ['h1', '.page-title', '.title', 'article h1'];
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent) {
            return element.textContent.trim();
          }
        }
        return '';
      });

      if (title && content) {
        const post: ScrapedPost = {
          id: `${category}-${Date.now()}`,
          title,
          content,
          excerpt: content.substring(0, 200).replace(/<[^>]*>/g, ''),
          category,
          published: true,
          authorId: 'default',
          authorEmail: 'admin@fsce.org',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          slug: slugger.slug(title)
        };

        posts.push(post);
        console.log(`Scraped post: ${title}`);
      }

      // Find and scrape sub-pages
      const subPageLinks = await page.evaluate((category) => {
        const links = Array.from(document.querySelectorAll('a[href^="/"]'));
        return links
          .map(link => link.getAttribute('href'))
          .filter(href => href && href.startsWith(`/${category}/`));
      }, category);

      for (const subPageLink of subPageLinks) {
        if (!subPageLink) continue;
        
        console.log(`Scraping sub-page: ${subPageLink}`);
        
        try {
          await page.goto(`${BASE_URL}${subPageLink}`, { 
            waitUntil: 'networkidle0',
            timeout: 30000 
          });
          
          await page.waitForSelector('body', { timeout: 10000 });

          const subContent = await page.evaluate(() => {
            document.querySelectorAll('nav, footer, script, style, iframe, header').forEach(el => el.remove());
            const contentSelectors = ['main', 'article', '.content', '.page-content', '#content'];
            let content = '';
            
            for (const selector of contentSelectors) {
              const element = document.querySelector(selector);
              if (element) {
                content = element.innerHTML;
                break;
              }
            }
            
            if (!content) {
              content = document.body.innerHTML;
            }
            
            return content;
          });

          const subTitle = await page.evaluate(() => {
            const titleSelectors = ['h1', '.page-title', '.title', 'article h1'];
            for (const selector of titleSelectors) {
              const element = document.querySelector(selector);
              if (element && element.textContent) {
                return element.textContent.trim();
              }
            }
            return '';
          });

          if (subTitle && subContent) {
            const post: ScrapedPost = {
              id: `${subPageLink.replace(/\//g, '-')}-${Date.now()}`,
              title: subTitle,
              content: subContent,
              excerpt: subContent.substring(0, 200).replace(/<[^>]*>/g, ''),
              category,
              published: true,
              authorId: 'default',
              authorEmail: 'admin@fsce.org',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              slug: slugger.slug(subTitle)
            };

            posts.push(post);
            console.log(`Scraped sub-page post: ${subTitle}`);
          }
        } catch (error) {
          console.error(`Error scraping sub-page ${subPageLink}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error scraping category ${category}:`, error);
    }
  }

  await browser.close();
  return posts;
}

async function uploadToFirebase(posts: ScrapedPost[]) {
  console.log('Uploading to Firebase...');
  
  for (const post of posts) {
    try {
      const docRef = await addDoc(collection(db, 'posts'), {
        ...post,
        createdAt: Timestamp.fromMillis(post.createdAt),
        updatedAt: Timestamp.fromMillis(post.updatedAt)
      });
      console.log(`Document written with ID: ${docRef.id}`);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }
}

async function main() {
  try {
    const posts = await scrapeContent();
    console.log(`Scraped ${posts.length} posts`);
    await uploadToFirebase(posts);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();
