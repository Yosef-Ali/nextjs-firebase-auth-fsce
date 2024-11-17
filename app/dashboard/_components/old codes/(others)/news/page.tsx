'use client';

import { siteConfig } from "@/config/site";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import FeaturedPosts from "@/components/FeaturedPosts";
import PostCard from "@/components/PostCard";
import { Post } from '@/types'; // Adjust this path according to your project structure
import { useQuery } from "convex/react";

import FSCESkeleton from "@/components/FSCESkeleton";
import ArticleCard from "@/components/ArticleCard";
import NewsFeedSkeleton from "@/components/NewsFeedSkeleton";
import { api } from "../../../../convex/_generated/api";

export default function NewsAndEventsPage() {

  const newsPosts = useQuery(api.posts.getNews);
  const eventsPosts = useQuery(api.posts.getEvents);


  if (newsPosts === undefined) {
    return <NewsFeedSkeleton />;
  }

  if (newsPosts.length === 0) {
    return <div className="text-center py-8">{`No programs content available. Please check the database for posts with category 'programs' and status 'published'.`}</div>;
  }

  if (eventsPosts === undefined) {
    return <NewsFeedSkeleton />;
  }

  if (eventsPosts.length === 0) {
    return <div className="text-center py-8">{`No events content available. Please check the database for posts with category 'events' and status 'published'.`}</div>;
  }

  return (

    <>
      <ArticleCard posts={newsPosts} title="News" />
      <ArticleCard posts={eventsPosts} title="Events" />
    </>

  )
}








