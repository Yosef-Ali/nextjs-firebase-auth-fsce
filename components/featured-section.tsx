import Image from "next/image";
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { newsService } from '@/app/services/news';
import { eventsService } from '@/app/services/events';
import { programsService } from '@/app/services/programs';
import { Post } from '@/app/types/post';
import Link from 'next/link';
import { ArrowRight, Calendar } from "lucide-react";

interface ContentCardProps {
  title: string;
  excerpt: string;
  image?: string;
  slug: string;
  category: string;
  date?: string;
  createdAt?: number;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  title, 
  excerpt, 
  image, 
  slug, 
  category,
  createdAt 
}) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row h-full">
          <div className="relative w-full md:w-2/5 aspect-[4/3] bg-slate-100">
            <Image
              src={image || "/images/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              style={{ objectFit: 'cover' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `<div class="absolute inset-0 flex items-center justify-center p-4">
                  <p class="text-sm text-slate-600 text-center line-clamp-3">${title}</p>
                </div>`;
              }}
            />
          </div>
          
          <div className="w-full md:w-3/5 p-6 bg-slate-50 flex flex-col">
            <div className="flex-grow space-y-4">
              <h2 className="text-2xl font-bold tracking-tight line-clamp-2">
                {title}
              </h2>
              
              <p className="text-base text-muted-foreground line-clamp-4">
                {excerpt}
              </p>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Posted on {formatDate(createdAt)}</span>
              </div>
              
              <Badge variant="secondary" className="w-fit capitalize">
                {category}
              </Badge>
            </div>
            
            <div className="flex justify-end mt-6">
              <Link href={`/${category}/${slug}`}>
                <Button variant="link" className="text-blue-800 font-semibold hover:no-underline p-0">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TabContentProps {
  posts: Post[];
  category: string;
  emptyMessage?: string;
}

const TabContent: React.FC<TabContentProps> = ({ posts, category, emptyMessage }) => {
  // Limit posts to 4 items
  const limitedPosts = posts.slice(0, 4);
  
  return limitedPosts.length > 0 ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {limitedPosts.map((post) => (
        <ContentCard 
          key={post.id}
          title={post.title}
          excerpt={post.excerpt || post.content.slice(0, 100)}
          image={post.images?.[0]}
          slug={post.slug || post.id}
          category={category}
          createdAt={post.createdAt}
        />
      ))}
    </div>
  ) : (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col items-center">
          <div className="w-full aspect-[4/3] relative mb-4">
            <Image
              src="/images/placeholder.svg"
              alt={`No ${category} available`}
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <p className="text-center text-muted-foreground">
            {emptyMessage || `No ${category} available at this time.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function FeaturedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const filterPostsByCategory = (category: string) => 
    posts.filter(post => post.category === category);

  const categories = {
    news: filterPostsByCategory('news'),
    events: filterPostsByCategory('events'),
    prevention: filterPostsByCategory('prevention-promotion'),
    protection: filterPostsByCategory('protection'),
    rehabilitation: filterPostsByCategory('rehabilitation'),
    resource: filterPostsByCategory('resource-center')
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('Fetching posts...');
        const fetchedPosts = await newsService.getAllPosts();
        console.log('Fetched posts:', fetchedPosts);
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="max-w-6xl w-full">
            <h1 className="text-4xl font-bold mb-4 text-center">Featured Content</h1>
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Featured Content</h1>
          <p className="text-xl text-muted-foreground mb-8 text-center">
            Stay updated with our latest news, upcoming events, and ongoing programs.
          </p>
          
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="grid grid-cols-6 w-full mb-6">
              <TabsTrigger value="news">News</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="prevention">Prevention</TabsTrigger>
              <TabsTrigger value="protection">Protection</TabsTrigger>
              <TabsTrigger value="rehabilitation">Rehabilitation</TabsTrigger>
              <TabsTrigger value="resource">Resources</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="news">
                <TabContent posts={categories.news} category="news" />
              </TabsContent>
              
              <TabsContent value="events">
                <TabContent posts={categories.events} category="events" />
              </TabsContent>
              
              <TabsContent value="prevention">
                <TabContent posts={categories.prevention} category="prevention-promotion" />
              </TabsContent>
              
              <TabsContent value="protection">
                <TabContent posts={categories.protection} category="protection" />
              </TabsContent>
              
              <TabsContent value="rehabilitation">
                <TabContent posts={categories.rehabilitation} category="rehabilitation" />
              </TabsContent>
              
              <TabsContent value="resource">
                <TabContent posts={categories.resource} category="resource-center" />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
