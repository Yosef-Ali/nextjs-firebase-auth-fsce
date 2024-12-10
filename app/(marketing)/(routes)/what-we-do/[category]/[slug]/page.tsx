'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { whatWeDoService } from '@/app/services/what-we-do';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';

export default function DetailPage() {
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  
  useEffect(() => {
    const fetchData = async () => {
      if (!params || !params.category || !params.slug) {
        setLoading(false);
        return;
      }
      
      try {
        const postData = await whatWeDoService.getProgramBySlug(params.slug as string);
        setPost(postData);
        
        if (postData) {
          const related = await whatWeDoService.getRelatedPrograms(
            postData.id,
            postData.category
          );
          setRelatedPosts(related);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (!params || !params.category || !params.slug) {
    return <div>Error: Invalid parameters</div>;
  }

  if (loading) {
    return <FSCESkeleton />;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      post={post}
      relatedPosts={relatedPosts}
      type="programs"
    </div>
  );
}
