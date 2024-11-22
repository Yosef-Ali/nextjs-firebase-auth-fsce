import Image from "next/image";
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";

import { postsService } from '@/app/services/posts';
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
  index: number;
}

const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    transition: {
      duration: 0.3
    }
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const ContentCard: React.FC<ContentCardProps> = ({ 
  title, 
  excerpt, 
  image, 
  slug, 
  category,
  createdAt,
  index 
}) => {
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      className="h-full"
    >
      <Card className="overflow-hidden h-full">
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
    </motion.div>
  );
};

interface TabContentProps {
  posts: Post[];
  category: string;
  emptyMessage?: string;
}

const TabContent: React.FC<TabContentProps> = ({ posts, category, emptyMessage }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0,
    rootMargin: "100px 0px"
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [controls, inView]);

  // Limit posts to 4 items
  const limitedPosts = posts.slice(0, 4);
  
  return (
    <motion.div 
      ref={ref}
      initial="hidden"
      animate={controls}
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
    >
      {limitedPosts.length > 0 ? (
        limitedPosts.map((post, index) => (
          <ContentCard 
            key={post.id}
            title={post.title}
            excerpt={post.excerpt || post.content.slice(0, 100)}
            image={post.images?.[0]}
            slug={post.slug || post.id}
            category={category}
            createdAt={post.createdAt}
            index={index}
          />
        ))
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { delay: 0.2 }
            }
          }}
          className="col-span-full text-center py-8 text-gray-500"
        >
          {emptyMessage || `No ${category} available at the moment.`}
        </motion.div>
      )}
    </motion.div>
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
        const fetchedPosts = await postsService.getPublishedPosts();
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
      <section className="py-16 px-4">
        <motion.h2 
          className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Content
        </motion.h2>
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="max-w-6xl w-full">
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
          <motion.h2 
            className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Featured Content
          </motion.h2>
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
