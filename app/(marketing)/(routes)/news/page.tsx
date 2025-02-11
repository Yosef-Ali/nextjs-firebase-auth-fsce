'use client';

import { useEffect, useState, useRef } from 'react';
import { Post } from '@/app/types/post';
import { getPostsByCategory, getPosts } from '@/app/actions/posts';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ProgramSearch } from '@/components/program-search';
import { ContentCard } from '@/components/content-display/ContentCard';
import { StickyPostsSection } from '@/components/content-display/StickyPostsSection';
import CarouselSection from '@/components/carousel';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';

export default function NewsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [news, setNews] = useState<Post[]>([]);
  const [stickyNews, setStickyNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const postsPerPage = 9; // Changed to 9 for better grid layout

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const newsData = await getPostsByCategory('news');

        // Split news into sticky and regular, prioritizing sticky posts
        const sticky = newsData.filter((post: Post) => post.sticky)
          .sort((a, b) => b.createdAt - a.createdAt);
        const regular = newsData.filter((post: Post) => !post.sticky)
          .sort((a, b) => b.createdAt - a.createdAt);

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
  const filteredNews = [...stickyNews, ...news].filter((newsItem: Post) =>
    searchQuery === '' ||
    newsItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    newsItem.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <CarouselSection />

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Latest News & Updates
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Stay informed about our latest initiatives, success stories, and community impact.
          </p>

          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search news..."
            className="max-w-2xl mx-auto mb-12"
          />
        </div>
      </section>

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

          {/* Sticky News Section with increased spacing */}
          {!searchQuery && stickyNews.length > 0 && (
            <div className="mb-20">
              <StickyPostsSection
                posts={stickyNews.slice(0, 2)} // Limit to 2 posts
                title="Featured News"
                basePath="/news"
              />
            </div>
          )}

          {/* Regular News Grid */}
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

          {/* Pagination */}
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
