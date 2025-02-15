import { postsService } from '../app/services/posts';

async function testPostsQuery() {
  console.log('Testing getPublishedPosts with no category...');
  const allPosts = await postsService.getPublishedPosts();
  console.log(`Total published posts: ${allPosts.length}\n`);

  const categories = [
    'achievements',
    'advocacy',
    'child-protection',
    'events',
    'humanitarian-response',
    'news',
    'youth-empowerment'
  ];

  for (const category of categories) {
    console.log(`Testing getPublishedPosts with category: ${category}`);
    const posts = await postsService.getPublishedPosts(category);
    console.log(`Found ${posts.length} posts`);
    
    if (posts.length > 0) {
      console.log('Sample post categories:');
      posts.slice(0, 2).forEach(post => {
        console.log('Category:', JSON.stringify(post.category, null, 2));
      });
    }
    console.log('-------------------\n');
  }
}

// Execute the test
testPostsQuery().catch(console.error);