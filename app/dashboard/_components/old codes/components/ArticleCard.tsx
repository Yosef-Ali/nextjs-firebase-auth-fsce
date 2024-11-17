import React from 'react';
import Article from './Article';
import { Id } from '../../convex/_generated/dataModel';
import { Separator } from './ui/separator';

interface ArticleCardProps {
  posts: {
    _id: Id<"posts">;
    _creationTime: number;
    image?: string;
    author: {
      id: string;
      name: string;
      image: string;
    };
    title: string;
    slug: string;
    content: any;
    excerpt: string;
    status: "draft" | "published" | "archived";
    category: string;
    updatedAt: number;
  }[];
  title?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ posts, title }) => {
  const limitedPosts = posts.slice(0, 5);
  return (


    <div>

      <h1 className='text-3xl font-bold text-gray-500'> {title}</h1>
      <Separator className="my-4" />

      <div className="max-w-5xl mx-auto py-8 flex flex-wrap">

        {limitedPosts.map((post, index) => {
          if (index === 0) {
            // First article: full width and larger
            return (
              <div key={post._id} className="mb-6">
                <Article
                  imageSrc={post.image || 'default-image.jpg'}
                  imageAlt={post.title}
                  title={post.title}
                  authorAvatar={post.author.image}
                  authorName={post.author.name}
                  date={new Date(post._creationTime).toLocaleDateString()}
                  category={post.category}
                  description={post.excerpt}
                  readMoreLink={`/news-and-events/${post.slug}`}
                />
              </div>
            );
          } else if (index > 0 && index < 5) {
            // Next four articles: smaller and side-by-side
            return (
              <div key={post._id} className={`w-1/2 px-2  ${index % 2 === 0 ? 'mb-6' : ''}`}>
                <Article
                  imageSrc={post.image || '/default-image.jpg'}
                  imageAlt={post.title}
                  title={post.title}
                  authorAvatar={post.author.image}
                  authorName={post.author.name}
                  date={new Date(post._creationTime).toLocaleDateString()}
                  category={post.category}
                  description={post.excerpt}
                  readMoreLink={`/news-and-events/${post.slug}`}
                />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ArticleCard;