'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { whatWeDoService } from '@/app/services/what-we-do';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import CarouselSection from '@/components/carousel';
import Partners from '@/components/partners';
import { motion } from 'framer-motion';
import { CalendarDays, Image as ImageIcon } from 'lucide-react';

// Helper function to format category name
const formatCategoryName = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function CategoryPage() {
  const params = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const category = params.category as string;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (category) {
          const data = await whatWeDoService.getProgramsByCategory(category);
          console.log('Post data:', data[0]); // Temporary log to check data structure
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  if (loading) {
    return <FSCESkeleton />;
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
    <CarouselSection/>
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl  font-bold mb-6">
            {formatCategoryName(category)}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our {formatCategoryName(category)} programs and initiatives
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Programs Found</h2>
              <p className="text-muted-foreground">
                There are currently no programs in this category.
              </p>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={item}>
              {posts.map((post) => (
                <motion.div key={post.id} variants={item}>
                  <Link href={`/what-we-do/${category}/${post.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {post.coverImage ? (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            unoptimized={post.coverImage.startsWith('data:')}
                          />
                        </div>
                      ) : (
                        <div className="relative w-full pt-[56.25%] bg-gray-100">
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                            <ImageIcon className="h-12 w-12" />
                          </div>
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">Programs</Badge>
                          <Badge variant="outline" className="text-primary">
                            {category}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          }) : 'Ongoing'}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-2 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-primary font-medium">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
    <Partners />
    </>
  );
}
