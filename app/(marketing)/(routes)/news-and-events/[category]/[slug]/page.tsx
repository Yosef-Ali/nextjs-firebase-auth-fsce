import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, User, Tag } from 'lucide-react';
import { postsService } from '@/app/services/posts';
import { PostCard } from '../../_components/post-card';

interface PostPageProps {
  params: {
    category: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await postsService.getPostBySlug(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} | FSCE`,
    description: post.excerpt || post.content.slice(0, 160),
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await postsService.getPostBySlug(params.slug);
  if (!post) notFound();

  // Fetch related posts
  const relatedPosts = await postsService.getRelatedPosts(post.id, post.category);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src={post.coverImage || '/images/placeholder.jpg'}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div>
            <div className="flex items-center gap-4 mb-6">
              <Badge variant={post.category === 'events' ? 'secondary' : 'default'}>
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </Badge>
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(post.createdAt, 'MMM d, yyyy')}</span>
              </div>
              {post.category === 'events' && post.eventDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{format(post.eventDate, 'h:mm a')}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.authorEmail}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              {post.content}
            </div>
          </div>

          {/* Image Gallery */}
          {post.images && post.images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {post.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Related Posts</h2>
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <PostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
