'use client';

import { useEffect, useState, useRef } from 'react';
import { Post } from '@/types';
import { getPostsByCategory } from '@/app/actions/posts';
import { ProgramSearch } from '@/components/program-search';
import { ContentCard } from '@/components/content-display/ContentCard';
import { StickyPostsSection } from '@/components/content-display/StickyPostsSection';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { ensureCategory } from '@/app/utils/category';
import { compareTimestamps } from '@/app/utils/date';

export default function AchievementsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [achievements, setAchievements] = useState<Post[]>([]);
  const [stickyAchievements, setStickyAchievements] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allPosts = await getPostsByCategory('achievements');
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

        setStickyAchievements(sticky);
        setAchievements(regular);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        setStickyAchievements([]);
        setAchievements([]);
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

  // Filter achievements for search
  const filteredAchievements = [...stickyAchievements, ...achievements].filter(achievement =>
    searchQuery === '' ||
    achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAchievements.length / postsPerPage);
  const paginatedAchievements = filteredAchievements.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  if (loading) {
    return <FSCESkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Our Achievements
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Discover the milestones we've reached and the impact we've made in our journey.
          </p>

          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search achievements..."
            className="max-w-2xl mx-auto mb-12"
          />
        </div>
      </section>

      <section ref={searchResultsRef} className="py-16 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results {filteredAchievements.length > 0 ? `(${filteredAchievements.length})` : ''}
              </h3>
              {filteredAchievements.length === 0 && (
                <p className="text-muted-foreground">No achievements found matching "{searchQuery}"</p>
              )}
            </div>
          )}

          {!searchQuery && stickyAchievements.length > 0 && (
            <div className="mb-20">
              <StickyPostsSection
                posts={stickyAchievements.slice(0, 2)}
                title="Featured Achievements"
                basePath="/who-we-are/achievements"
              />
            </div>
          )}

          {(searchQuery ? paginatedAchievements : achievements).length > 0 && (
            <>
              {!searchQuery && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">All Achievements</h3>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {(searchQuery ? paginatedAchievements : achievements).map((achievement) => (
                  <ContentCard
                    key={achievement.id}
                    title={achievement.title}
                    excerpt={achievement.excerpt}
                    image={achievement.coverImage || "/images/placeholder.svg"}
                    slug={achievement.slug}
                    category="Achievement"
                    createdAt={achievement.createdAt}
                    href={`/who-we-are/achievements/${achievement.slug}`}
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