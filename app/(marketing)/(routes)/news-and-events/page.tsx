import { Metadata } from 'next';
import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { postsService } from '@/app/services/posts';
import { PostCard } from './_components/post-card';
import { PostsGrid } from './_components/posts-grid';
import { FeaturedPost } from './_components/featured-post';

export const metadata: Metadata = {
  title: 'News & Events | FSCE',
  description: 'Stay updated with the latest news, events, and stories from FSCE.',
};

export const revalidate = 3600; // Revalidate every hour

export default async function NewsAndEventsPage() {
  // Fetch all published posts
  const allPosts = await postsService.getPublishedPosts();
  
  // Split posts by category
  const news = allPosts.filter(post => post.category === 'news');
  const events = allPosts.filter(post => post.category === 'events');
  const stories = allPosts.filter(post => post.category === 'stories');
  
  // Get the most recent post for the featured section
  const featuredPost = allPosts[0];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">News & Events</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay informed about FSCE's latest initiatives, upcoming events, and inspiring success stories
          from our community.
        </p>
      </div>

      {/* Featured Post */}
      {featuredPost && (
        <div className="mb-12">
          <FeaturedPost post={featuredPost} />
        </div>
      )}

      {/* Tabs for different post categories */}
      <Tabs defaultValue="news" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="news">News</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="news">
          <Suspense fallback={<div>Loading news...</div>}>
            <PostsGrid>
              {news.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostsGrid>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="events">
          <Suspense fallback={<div>Loading events...</div>}>
            <PostsGrid>
              {events.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostsGrid>
          </Suspense>
        </TabsContent>
        
        <TabsContent value="stories">
          <Suspense fallback={<div>Loading stories...</div>}>
            <PostsGrid>
              {stories.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </PostsGrid>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
