
import React from 'react';
import { api } from '../../convex/_generated/api';
import { useQuery } from 'convex/react';



const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const RecentPosts = () => {
  const recentPosts = useQuery(api.posts.getRecentPosts);

  if (!recentPosts) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight text-center mb-5">Recent Posts</h2>
      <ul>
        {recentPosts.map((post: any) => (
          <li key={post._id} className="">
            <a href={`/news-and-events/${post.slug}`} className="flex">
              <div className="w-1/3">
                <img className="rounded" src={post.image || '/placeholder-image.jpg'} alt={post.title} />
              </div>
              <div className="w-2/3 pl-2">
                <h3 className="text-sm text-muted-foreground mb-2">{post.title}</h3>
                <span className="text-xs text-foreground font-thin block mb-5">{formatDate(post._creationTime)}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentPosts;