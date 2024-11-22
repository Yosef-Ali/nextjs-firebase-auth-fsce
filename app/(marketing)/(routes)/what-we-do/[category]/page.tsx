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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="flex flex-col h-full">
                  {post.coverImage && (
                    <div className="relative w-full pt-[56.25%]">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-4">
                      {post.excerpt}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-4">
                        <ul className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <li key={tag}>
                              <Badge variant="secondary">
                                {tag}
                              </Badge>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-auto">
                      <Link href={`/what-we-do/${category}/${post.slug}`}>
                        <Button className="w-full">
                          Learn More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
    <Partners />
    </>
  );
}
