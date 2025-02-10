'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, ArrowRight, Star, Clock } from 'lucide-react';
import FSCESkeleton from '@/components/FSCESkeleton';
import { Post } from '@/app/types/post';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ProgramSearch } from '@/components/program-search';
import CarouselSection from '@/components/carousel';
import { getPosts } from '@/app/actions/posts';

export default function EventsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Post[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Post[]>([]);
  const [recentNews, setRecentNews] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const eventsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get published posts and recent news in parallel
        const [postsData, newsData] = await Promise.all([
          getPosts({ published: true }),
          getPosts({ category: 'news', limit: 3, published: true })
        ]);

        const eventsData = postsData.filter(post => post.category.id.toLowerCase() === 'events');

        // Sort by date and split into featured/regular
        const sortedEvents = eventsData.sort((a, b) => b.createdAt - a.createdAt);
        const featured = sortedEvents.filter(post => post.featured);
        const regular = sortedEvents.filter(post => !post.featured);

        setFeaturedEvents(featured);
        setEvents(regular);
        setRecentNews(newsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setFeaturedEvents([]);
        setEvents([]);
        setRecentNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset page when searching
    setTimeout(() => {
      searchResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Filter events based on search query
  const filteredEvents = [...featuredEvents, ...events].filter((event: Post) =>
    searchQuery === '' ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get paginated events for current page
  const paginatedEvents = filteredEvents.slice(0, page * eventsPerPage);
  const hasMoreEvents = filteredEvents.length > page * eventsPerPage;

  if (loading) {
    return <FSCESkeleton />;
  }

  console.log('Filtered events:', filteredEvents);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Events & Activities
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Stay updated with our events and programs that make a difference in the community.
          </p>

          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search events..."
            className="max-w-2xl mx-auto mb-12"
          />
        </div>
      </section>

      <section ref={searchResultsRef} className="py-16 bg-white scroll-mt-16">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results {filteredEvents.length > 0 ? `(${filteredEvents.length})` : ''}
              </h3>
              {filteredEvents.length === 0 && (
                <p className="text-muted-foreground">No events found matching "{searchQuery}"</p>
              )}
            </div>
          )}

          {featuredEvents.length > 0 && !searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <h3 className="text-2xl font-bold">Featured Events</h3>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {featuredEvents.map((post: Post) => (
                  <motion.div key={post.id} variants={item}>
                    <Link href={`/events/${post.slug}`} className="block group">
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                        {post.coverImage && (
                          <div className="relative w-full pt-[56.25%] overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">Event</Badge>
                            <Badge variant="secondary" className="bg-yellow-100">Featured</Badge>
                          </div>
                          <CardTitle className="text-2xl group-hover:text-primary transition-colors mb-4">
                            {post.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {events.length > 0 ? (
            <>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {paginatedEvents.map((post: Post) => (
                  <motion.div key={post.id} variants={item}>
                    <Link href={`/events/${post.slug}`} className="block group">
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                        {post.coverImage && (
                          <div className="relative w-full pt-[56.25%] overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">Event</Badge>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 mb-4">
                            {post.title}
                          </CardTitle>
                          <p className="text-muted-foreground line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load More Button */}
              {hasMoreEvents && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    Load More Events
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery ? 'No events found matching your search.' : 'No events available at the moment.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {recentNews.length > 0 && (
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Recent News</h2>
              <Link href="/news">
                <Button variant="ghost" className="group">
                  View All News
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {recentNews.map((post: Post) => (
                <motion.div key={post.id} variants={item}>
                  <Link href={`/news/${post.slug}`} className="block group">
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300">
                      {post.coverImage && (
                        <div className="relative w-full pt-[56.25%] overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">News</Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 mb-4">
                          {post.title}
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-3 mb-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </CardHeader>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
