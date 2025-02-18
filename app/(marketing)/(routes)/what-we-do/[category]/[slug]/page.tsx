'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getCategoryName } from '@/app/utils/category';
import Link from 'next/link';
import Image from 'next/image';

import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatPublishDate, formatDate } from '@/app/utils/date';
import { whatWeDoService } from '@/app/services/what-we-do';

export default function DetailPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ category: string; slug: string }>();

  useEffect(() => {
    const fetchData = async () => {
      if (!params?.category || !params?.slug) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      try {
        const postData = await whatWeDoService.getProgramBySlug(params.slug as string);

        if (!postData) {
          setError('Program not found');
          setLoading(false);
          return;
        }

        setPost(postData);

        // Fetch related programs
        const related = await whatWeDoService.getRelatedPrograms(
          postData.id,
          params.category as string
        );
        setRelatedPosts(related);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load program details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error || 'Program not found'}</h1>
          <Link href="/what-we-do">
            <Button variant="outline" className="inline-flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Programs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Link href="/what-we-do">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Programs
              </Button>
            </Link>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">Programs</Badge>
              <Badge variant="outline" className="text-primary">
                {getCategoryName(post.category) || params?.category}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            {post.createdAt && (
              <p className="text-muted-foreground">
                Published on {formatDate(post.createdAt)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {post.coverImage && (
                <div className="relative w-full pt-[56.25%] mb-8 overflow-hidden rounded-lg">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    unoptimized={post.coverImage.startsWith('data:')}
                  />
                </div>
              )}
              <div className="prose prose-lg max-w-none">
                {post.content && (
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                )}
              </div>
            </div>

            {/* Sidebar with Related Posts */}
            <div>
              {relatedPosts.length > 0 && (
                <div className="sticky top-8">
                  <h2 className="text-2xl font-semibold mb-6">Related Programs</h2>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/what-we-do/${params?.category}/${relatedPost.slug}`}
                        className="block"
                      >
                        <Card className="transition-shadow hover:shadow-md">
                          {relatedPost.coverImage && (
                            <div className="relative w-full pt-[56.25%] overflow-hidden">
                              <Image
                                src={relatedPost.coverImage}
                                alt={relatedPost.title}
                                fill
                                className="object-cover"
                                unoptimized={relatedPost.coverImage.startsWith('data:')}
                              />
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="text-lg">{relatedPost.title}</CardTitle>
                          </CardHeader>
                          {relatedPost.excerpt && (
                            <CardContent>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {relatedPost.excerpt}
                              </p>
                            </CardContent>
                          )}
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
