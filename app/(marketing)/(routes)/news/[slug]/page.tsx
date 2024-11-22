'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Post | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = typeof params.slug === 'string' ? params.slug : '';
        const [articleData, relatedData] = await Promise.all([
          postsService.getPostBySlug(slug),
          postsService.getRelatedPosts(slug, 'news', 3)
        ]);
        setArticle(articleData);
        setRelatedArticles(relatedData);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/news">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6 hover:bg-transparent hover:text-primary"
              asChild
            >
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Link>
            </Button>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">News</Badge>
              {article.category && (
                <Badge variant="outline" className="text-primary">
                  {article.category}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{article.title}</h1>
            {article.createdAt && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {article.coverImage && (
              <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                <Image
                  src={article.coverImage}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {relatedArticles.map((article) => (
                <motion.div
                  key={article.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                >
                  <Link href={`/news/${article.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {article.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={article.coverImage}
                            alt={article.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">News</Badge>
                          {article.category && (
                            <Badge variant="outline" className="text-primary">
                              {article.category}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
