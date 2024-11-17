import React, { FC } from 'react';
import PostCard from './PostCard';
import { Post } from '@/types';
import { Id } from '../../convex/_generated/dataModel';

const FeaturedPosts: FC = () => {
  const featuredPosts: Post[] = [
    {
      _id: '1' as Id<"posts">,
      _creationTime: new Date('2019-12-02').getTime(),
      updatedAt: new Date('2019-12-02').getTime(),
      title: 'How To Make More Travel By Doing Less',
      slug: 'how-to-make-more-travel-by-doing-less',
      image: 'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=770&q=80',
      content: 'Full content of the post goes here...',
      excerpt: 'Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts. Separated they live in Bookmarksgrove right at the coast...',
      status: 'published',
      category: 'Travel',
      author: {
        id: 'author1',
        name: 'Page',
        imageUrl: 'https://example.com/author1.jpg'
      }
    },
    {
      _id: '2' as Id<"posts">,
      _creationTime: new Date('2019-10-10').getTime(),
      updatedAt: new Date('2019-10-10').getTime(),
      title: 'Do You Make These Simple Mistakes In Travel?',
      slug: 'do-you-make-these-simple-mistakes-in-travel',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=340&q=80',
      content: 'Full content of the post goes here...',
      excerpt: 'Far far away, behind the word mountains, far from the countries...',
      status: 'published',
      category: 'Travel',
      author: {
        id: 'author2',
        name: 'John Doe',
        imageUrl: 'https://example.com/author2.jpg'
      }
    },
    {
      _id: '3' as Id<"posts">,
      _creationTime: new Date('2019-12-15').getTime(),
      updatedAt: new Date('2019-12-15').getTime(),
      title: 'Use Travel To Make Someone Fall In Love With You',
      slug: 'use-travel-to-make-someone-fall-in-love-with-you',
      image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=340&q=80',
      content: 'Full content of the post goes here...',
      excerpt: 'Far far away, behind the word mountains, far from the countries...',
      status: 'published',
      category: 'Travel',
      author: {
        id: 'author3',
        name: 'Jane Smith',
        imageUrl: 'https://example.com/author3.jpg'
      }
    }
  ];

  return (
    <div className="mr-2 md:mr-4 ml-2">
      {featuredPosts.map((post) => (
        <div key={post._id} className="pb-10">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  );
};

export default FeaturedPosts;