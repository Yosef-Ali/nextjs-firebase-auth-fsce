'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Post {
  title: string;
  slug: string;
  image: string;
  category: string;
  excerpt: string;
}

interface FeaturedPostsProps {
  posts: Post[];
}

const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ posts }) => {
  return (
    <div>
      {posts.map((post, index) => (
        <React.Fragment key={index}>
          {index % 5 === 0 && (
            <div className="mb-8 w-full w-[640px]">
              <Link href={`/article/${post.slug}`}>
                <Image
                  className="h-full w-full object-cover rounded-sm"
                  src={post.image}
                  alt={post.title}
                  height={300} // Set the height to 350px here
                  width={640} // It's a good practice to set the width as well
                />
                <div className="mt-4">
                  <div className="text-sm font-semibold text-gray-500 uppercase mb-2">
                    {post.category}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="text-sm font-semibold text-blue-500">
                    Read More...
                  </div>
                </div>
              </Link>
            </div>
          )}

          {index % 5 === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {posts.slice(index, index + 4).map((post, idx) => (
                <div key={idx} className="bg-white rounded overflow-hidden ">
                  <Link href={`/article/${post.slug}`}>
                    <Image
                      className="w-full h-64 object-cover"
                      src={post.image}
                      alt={post.title}
                      width={640}
                      height={360}
                    />
                    <div className="p-4">
                      <div className="text-sm font-semibold text-gray-500 uppercase mb-2">
                        {post.category}
                      </div>
                      <h2 className="text-lg font-bold mb-2">{post.title}</h2>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="text-sm font-semibold text-blue-500">
                        Read More...
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default FeaturedPosts;