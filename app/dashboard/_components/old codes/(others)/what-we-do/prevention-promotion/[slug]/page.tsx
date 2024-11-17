"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../../convex/_generated/api';
import { useQuery } from 'convex/react';
import RenderedContent from '@/components/render-content';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SinglePageSkeleton from '@/components/singlePageCardSkeleton';
import { Button } from '@/components/ui/button'; // Assuming you have a button component in shadcn ui
import { ChevronLeft } from 'lucide-react';

const PostDetailPage = () => {
  const slug = useParams<{ slug: string }>().slug;
  const post = useQuery(api.posts.getPostBySlug, { slug: slug });
  const router = useRouter();

  if (!post) {
    return <SinglePageSkeleton />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl mx-auto ">
        <Button onClick={() => router.back()} className="mb-4 flex items-center space-x-1 bg-blue-900 hover:bg-blue-950 text-white">
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <div className="mb-8">
          <img
            src={post.image}
            alt="AI visualization"
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="flex items-center space-x-4 mb-4">
          <Avatar>
            <AvatarImage src={post.author.image} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <h3 className="text-sm font-medium leading-none">{post.author.name}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(post._creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>

          <p className="text-sm font-medium mr-2 px-2.5 py-0.5 rounded bg-gray-100 text-gray-800">{post.category}</p>
        </div>
        <div>
          <h2 className="text-gray-600 text-2xl font-semibold mb-2">{post.title}</h2>
          <RenderedContent content={post.content} />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;