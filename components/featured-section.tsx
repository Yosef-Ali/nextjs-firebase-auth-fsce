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
      <Card className="group overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={image || "/images/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/images/placeholder.svg";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white">
              <Badge variant="secondary" className="mb-2 capitalize">
                {category}
              </Badge>
            </div>
          </div>
        </div>
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formatDate(createdAt)}</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
            {title}
          </h2>

          <p className="text-muted-foreground text-sm line-clamp-3">
            {excerpt}
          </p>
          <div className="pt-4 border-t mt-4">
            <Link href={`/${category}/${slug}`} className="group/link">
              <Button
                variant="ghost"
                className="w-full justify-between px-0 hover:bg-transparent text-muted-foreground hover:text-primary"
              >
                <span className="group-hover/link:underline">Read More</span>
                <ArrowRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
    }
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: {
          opacity: 1,
          transition: {
            when: "beforeChildren",
            staggerChildren: 0.3
          }
        },
        hidden: {
          opacity: 0
        }
      }}
    >
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <ContentCard
              key={post.id}
              title={post.title}
              excerpt={post.excerpt || post.content.slice(0, 100)}
              image={post.images?.[0]}
              slug={post.slug}
              category={category}
              createdAt={post.createdAt}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage || `No ${category} available at the moment.`}
        </div>
      )}
    </motion.div>
  );
};

export default function FeaturedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const filterPostsByCategory = (categoryId: string) =>
    posts.filter(post => post.category?.id === categoryId);

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

      {loading ? (
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="max-w-6xl w-full">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="news" className="container mx-auto">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            {Object.keys(categories).map((category) => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(categories).map(([category, categoryPosts]) => (
            <TabsContent key={category} value={category}>
              <TabContent
                posts={categoryPosts}
                category={category}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </section>
  );
}
