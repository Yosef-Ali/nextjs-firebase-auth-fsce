'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { postsService } from '@/app/services/posts';
import { Post } from '@/app/types/post';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CalendarDays } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import Partners from '@/components/partners';
import CarouselSection from '@/components/carousel';
import { ProgramSearch } from '@/components/program-search';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { StickyPostsSection } from '@/components/content-display/StickyPostsSection';

const categories = [
  {
    id: 'child-protection',
    title: 'Child Protection',
    description: 'Comprehensive programs to ensure the safety and well-being of children',
  },
  {
    id: 'youth-empowerment',
    title: 'Youth Empowerment',
    description: 'Programs and initiatives to empower youth for a better future',
  },
  {
    id: 'advocacy',
    title: 'Advocacy',
    description: "Speaking up and taking action for children's rights and needs",
  },
  {
    id: 'humanitarian-response',
    title: 'Humanitarian Response',
    description: 'Providing critical support and assistance in times of crisis',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WhatWeDoPage() {
  const [categoryPosts, setCategoryPosts] = useState<Record<string, Post[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('child-protection');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<Record<string, number>>({});
  const [stickyPosts, setStickyPosts] = useState<Post[]>([]);
  const postsPerPage = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts: Record<string, Post[]> = {};
        await Promise.all(
          categories.map(async (category) => {
            const data = await postsService.getPostsByCategory(category.id);
            posts[category.id] = data;
            // Collect sticky posts from all categories
            const sticky = data.filter(post => post.sticky);
            setStickyPosts(prev => [...prev, ...sticky]);
          })
        );
        setCategoryPosts(posts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
    const initialPages = categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: 1
    }), {});
    setCurrentPage(initialPages);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset all category pages to 1 when searching
    const resetPages = categories.reduce((acc, category) => ({
      ...acc,
      [category.id]: 1
    }), {});
    setCurrentPage(resetPages);
  };

  // Reset page when changing categories
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(prev => ({
      ...prev,
      [categoryId]: 1
    }));
  };

  const getFilteredPosts = (categoryId: string) => {
    const posts = categoryPosts[categoryId] || [];
    if (!searchQuery) return posts;

    return posts.filter((post) =>
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const getPaginatedPosts = (categoryId: string) => {
    const filtered = getFilteredPosts(categoryId);
    // Filter out sticky posts
    const regularPosts = filtered.filter(post => !post.sticky);
    const page = currentPage[categoryId] || 1;
    return regularPosts.slice((page - 1) * postsPerPage, page * postsPerPage);
  };

  const getStickyPosts = (categoryId: string) => {
    const filtered = getFilteredPosts(categoryId);
    return filtered.filter(post => post.sticky).slice(0, 2); // Show max 2 sticky posts
  };

  const getTotalPages = (categoryId: string) => {
    return Math.ceil(getFilteredPosts(categoryId).length / postsPerPage);
  };

  const getCategoryTitle = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.title || categoryId;
  };

  if (loading) {
    return <FSCESkeleton />;
  }

  return (
    <>
      <CarouselSection />
      <div className="min-h-screen bg-background">
        {/* Section 1: Hero and Featured Programs */}
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Our Programs
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
              Discover how we're making a difference in children's lives through our comprehensive programs and initiatives.
            </p>
            {/* {!searchQuery && stickyPosts.length > 0 && (
              <div className="mt-12 w-full">
                <StickyPostsSection
                  posts={stickyPosts.slice(0, 2)}
                  title="Featured Programs"
                  basePath={`/what-we-do/${activeCategory}`}
                />
              </div>
            )} */}
          </div>
        </section>

        {/* Section 2: Program Categories and Search */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-center">Explore Our Programs</h2>
              <ProgramSearch
                onSearch={handleSearch}
                className="mb-10"
              />
            </div>

            <Tabs defaultValue={activeCategory} onValueChange={handleCategoryChange}>
              <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="w-full"
                  >
                    {category.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id}>
                  <div className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">{category.title}</h3>
                        <p className="text-muted-foreground">{category.description}</p>
                      </div>
                      <Link href={`/what-we-do/${category.id}`}>
                        <Button variant="outline" className="hidden md:flex">
                          View All {category.title} Programs
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Regular Posts Grid */}
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {getPaginatedPosts(category.id).map((post) => (
                      <motion.div key={post.id} variants={item}>
                        <Link href={`/what-we-do/${category.id}/${post.slug}`} className="block group">
                          <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                            {post.coverImage && (
                              <div className="relative w-full pt-[56.25%] overflow-hidden">
                                <Image
                                  src={post.coverImage}
                                  alt={post.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  unoptimized={post.coverImage.startsWith('data:')}
                                />
                              </div>
                            )}
                            <CardHeader>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge variant="secondary">Programs</Badge>
                                <Badge variant="outline" className="text-primary">
                                  {category.title}
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {post.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <CalendarDays className="h-4 w-4" />
                                <span>
                                  {post.createdAt ?
                                    new Date(post.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    }) : 'Ongoing'
                                  }
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-muted-foreground line-clamp-2 mb-4">
                                {post.excerpt || post.content?.substring(0, 150)}
                              </p>
                              <div className="flex items-center text-primary font-medium">
                                Read More
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  {getTotalPages(category.id) > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault();
                                if ((currentPage[category.id] || 1) > 1) {
                                  setCurrentPage({
                                    ...currentPage,
                                    [category.id]: (currentPage[category.id] || 1) - 1
                                  });
                                }
                              }}
                              className={(currentPage[category.id] || 1) <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>

                          {[...Array(getTotalPages(category.id))].map((_, i) => (
                            <PaginationItem key={i + 1}>
                              <PaginationLink
                                href="#"
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                  e.preventDefault();
                                  setCurrentPage({
                                    ...currentPage,
                                    [category.id]: i + 1
                                  });
                                }}
                                isActive={(currentPage[category.id] || 1) === i + 1}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault();
                                if ((currentPage[category.id] || 1) < getTotalPages(category.id)) {
                                  setCurrentPage({
                                    ...currentPage,
                                    [category.id]: (currentPage[category.id] || 1) + 1
                                  });
                                }
                              }}
                              className={(currentPage[category.id] || 1) >= getTotalPages(category.id) ? "pointer-events-none opacity-50" : ""}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  <div className="mt-8 text-center md:hidden">
                    <Link href={`/what-we-do/${category.id}`}>
                      <Button variant="outline">
                        View All {category.title} Programs
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </div>
      <Partners />
    </>
  );
}
