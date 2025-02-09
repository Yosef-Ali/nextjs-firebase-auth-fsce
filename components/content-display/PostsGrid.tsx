import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight, Star } from 'lucide-react';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PostsGridProps {
  posts: Post[];
  category: string;
  featuredPosts?: Post[];
}

export function PostsGrid({ posts, category, featuredPosts = [] }: PostsGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <>
      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              <h2 className="text-3xl font-bold">Featured Posts</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/${category}/${post.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      <div className="grid md:grid-cols-2 gap-4">
                        {post.coverImage && (
                          <div className="relative w-full pt-[75%] md:pt-[100%] overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-yellow-100">Featured</Badge>
                            <Badge variant="outline" className="text-primary">
                              {typeof post.category === 'string' ? post.category : post.category?.name || category}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                            {post.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-auto">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {posts.map((post) => (
              <motion.div key={post.id} variants={item}>
                <Link href={`/${category}/${post.slug}`} className="block group">
                  <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                    {post.coverImage && (
                      <div className="relative w-full pt-[56.25%] overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">
                          {typeof post.category === 'string' ? post.category : post.category?.name || category}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-primary font-medium group-hover:text-primary/80 transition-colors">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}