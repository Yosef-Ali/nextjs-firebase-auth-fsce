import React, { FC } from 'react';
import { Post } from '@/types'; // Adjust this path according to your project structure

interface PostCardProps {
  post: Post;
}

const PostCard: FC<PostCardProps> = ({ post }) => {
  const formattedDate = new Date(post._creationTime).toLocaleDateString();

  return (
    <div>
      {post.image && (
        <img className="w-full h-auto rounded mb-5" src={post.image} alt={post.title} />
      )}
      <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        <a href={`/article/${post.slug}`}>{post.title}</a>
      </h2>
      <span className="text-sm text-muted-foreground">
        By {post.author.name}, {formattedDate}
      </span>
      <p className="leading-7 [&:not(:first-child)]:mt-6">
        {post.excerpt}
      </p>
      <a href={`/article/${post.slug}`} className="inline-block pt-5 text-sm font-medium tracking-wider">
        Read More...
      </a>
    </div>
  );
};

export default PostCard;