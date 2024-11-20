'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DetailPageTemplate from '@/components/detail-page/DetailPageTemplate';
import { whatWeDoService } from '@/app/services/what-we-do';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';

export default function DetailPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const category = params.category as string;
  const slug = params.slug as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (slug) {
          const postData = await whatWeDoService.getProgramBySlug(slug);
          setPost(postData);
          
          if (postData) {
            // Get related posts from the same category
            const allPosts = await whatWeDoService.getProgramsByCategory(category);
            const related = allPosts
              .filter(p => p.id !== postData.id)
              .slice(0, 3); // Get up to 3 related posts
            setRelatedPosts(related);
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, slug]);

  if (loading) {
    return <FSCESkeleton />;
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <DetailPageTemplate
      title={post.title}
      excerpt={post.excerpt}
      content={post.content}
      category={post.category}
      coverImage={post.coverImage}
      images={post.images}
      tags={post.tags}
      author={post.author}
      relatedPosts={relatedPosts}
    />
  );
}
