'use client';

import { useEffect, useState, useRef } from 'react';
import { Post } from '@/types';
import { postsService } from '@/app/services/posts';
import { ProgramSearch } from '@/components/program-search';
import { ContentCard } from '@/components/content-display/ContentCard';
import { StickyPostsSection } from '@/components/content-display/StickyPostsSection';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ensureCategory } from '@/app/utils/category';
import { compareTimestamps } from '@/app/utils/date';

export default function NewsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [news, setNews] = useState<Post[]>([]);
  const [stickyNews, setStickyNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allPosts = await postsService.getPostsByCategory('news');
        // Ensure posts have proper Category objects
        const postsWithCategories = allPosts.map(post => ({
          ...post,
          category: ensureCategory(post.category)
        }));
        const [sticky, regular] = postsWithCategories.reduce<[Post[], Post[]]>(
          ([s, r], post: Post) => post.sticky ? [[...s, post], r] : [s, [...r, post]],
          [[], []]
        );

        sticky.sort((a: Post, b: Post) => compareTimestamps(a.createdAt, b.createdAt));
        regular.sort((a: Post, b: Post) => compareTimestamps(a.createdAt, b.createdAt));

        setStickyNews(sticky);
        setNews(regular);
      } catch (error) {
        console.error('Error fetching news:', error);
        setStickyNews([]);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setTimeout(() => {
      searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Filter news for search
  const filteredNews = [...stickyNews, ...news].filter((item: Post) =>
    searchQuery === '' ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNews.length / postsPerPage);
  const paginatedNews = filteredNews.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  if (loading) {
    return <FSCESkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <section ref={searchResultsRef} className="py-16 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results {filteredNews.length > 0 ? `(${filteredNews.length})` : ''}
              </h3>
              {filteredNews.length === 0 && (
                <p className="text-muted-foreground">No news found matching "{searchQuery}"</p>
              )}
            </div>
          )}

          {!searchQuery && stickyNews.length > 0 && (
            <div className="mb-20">
              <StickyPostsSection
                posts={stickyNews.slice(0, 2)}
                title="Featured News"
                basePath="/news"
              />
            </div>
          )}

          {(searchQuery ? paginatedNews : news).length > 0 && (
            <>
              {!searchQuery && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">Latest News</h3>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {(searchQuery ? paginatedNews : news).map((post: Post) => (
                  <ContentCard
                    key={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.coverImage || "/images/placeholder.svg"}
                    slug={post.slug}
                    category="News"
                    createdAt={post.createdAt}
                    href={`/news/${post.slug}`}
                  />
                ))}
              </motion.div>
            </>
          )}

          {totalPages > 1 && searchQuery && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
