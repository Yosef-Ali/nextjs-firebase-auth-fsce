'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';

// Define the type for a post
interface Post {
  _id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
}

const SearchResults = ({ searchTerm }: { searchTerm: string }) => {
  const searchResults = useQuery(api.posts.searchPosts, { searchTerm });

  if (searchResults === undefined) {
    return <p>Loading...</p>;
  }

  if (searchResults.length === 0) {
    return (
      <Card>
        <CardContent>
          <p className="text-center py-4">No results found. Try a different search term.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {(searchResults as Post[]).map((post: Post) => (
        <Link href={`/search/${post.slug}`} key={post._id}>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <CardDescription>{post.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{post.excerpt}</p>
              <span className="text-blue-500 hover:underline mt-2 inline-block transition-colors duration-200">
                Read more
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default SearchResults;