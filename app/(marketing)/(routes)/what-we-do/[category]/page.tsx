'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/app/types/post';
import { ProgramSearch } from '@/components/program-search';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FSCESkeleton from '@/components/FSCESkeleton';
import { postsService } from '@/app/services/posts';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";

// Helper function to format category name
const formatCategoryName = (category: string) => {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

export default function CategoryPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 12;
  const params = useParams<{ category: string }>();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!params?.category) {
        setLoading(false);
        return;
      }

      try {
        const categoryPosts = await postsService.getPostsByCategory(params.category);
        setPosts(categoryPosts);
        setSearchResults(categoryPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [params?.category]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page on new search
    const filteredPosts = posts.filter((post) =>
      query === '' ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.content.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredPosts);
  };

  if (!params?.category) {
    return <div>Category not found</div>;
  }

  if (loading) {
    return <FSCESkeleton />;
  }

  const categoryName = formatCategoryName(params.category);
  const totalPages = Math.ceil(searchResults.length / postsPerPage);
  const paginatedPosts = searchResults.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            {categoryName} Programs
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Explore our {categoryName.toLowerCase()} programs and initiatives
          </p>
          <ProgramSearch
            onSearch={handleSearch}
            placeholder={`Search ${categoryName.toLowerCase()} programs...`}
            className="mt-10"
          />
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">No Programs Found</h2>
              <p className="text-muted-foreground">
                {searchQuery ?
                  `No programs found matching "${searchQuery}"` :
                  `There are currently no programs in the ${categoryName} category.`
                }
              </p>
            </div>
          ) : (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {paginatedPosts.map((post) => (
                  <motion.div key={post.id} variants={item}>
                    <Link href={`/what-we-do/${params.category}/${post.slug}`}>
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group">
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
                              {categoryName}
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

              {totalPages > 1 && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i + 1}>
                          <PaginationLink
                            href="#"
                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                              e.preventDefault();
                              setPage(i + 1);
                            }}
                            isActive={page === i + 1}
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
                            if (page < totalPages) setPage(page + 1);
                          }}
                          className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
