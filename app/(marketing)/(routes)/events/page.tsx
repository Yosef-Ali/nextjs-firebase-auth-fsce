"use client";

import { useEffect, useState, useRef } from "react";
import { Post } from "@/app/types/post";
import { postsService } from "@/app/services/posts";
import { ProgramSearch } from "@/components/program-search";
import { ContentCard } from "@/components/content-display/ContentCard";
import { StickyPostsSection } from "@/components/content-display/StickyPostsSection";
import FSCESkeleton from "@/components/FSCESkeleton";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ensureCategory } from "@/app/utils/category";
import { compareTimestamps } from "@/app/utils/date";

export default function EventsPage() {
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Post[]>([]);
  const [stickyEvents, setStickyEvents] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const postsPerPage = 9;

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        // Replace getPostsByCategory with getPublishedPosts with category parameter
        const allPosts = await postsService.getPublishedPosts("events");

        // Ensure posts have proper Category objects
        const postsWithCategories = allPosts.map((post) => ({
          ...post,
          category: ensureCategory(post.category),
        }));

        // Split posts into sticky and regular arrays without using destructuring
        const stickyPosts: Post[] = [];
        const regularPosts: Post[] = [];

        postsWithCategories.forEach((post: Post) => {
          if (post.sticky) {
            stickyPosts.push(post);
          } else {
            regularPosts.push(post);
          }
        });

        // Sort using compareTimestamps helper with proper types - newest first
        // compareTimestamps already sorts newest first (b - a)
        setStickyEvents(
          [...stickyPosts].sort((a, b) =>
            compareTimestamps(a.createdAt, b.createdAt)
          )
        );
        setEvents(
          [...regularPosts].sort((a, b) =>
            compareTimestamps(a.createdAt, b.createdAt)
          )
        );
      } catch (error) {
        console.error("Error loading events:", error);
        setStickyEvents([]);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    setTimeout(() => {
      searchResultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Filter events for search
  const filteredEvents = [...stickyEvents, ...events].filter(
    (event: Post) =>
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEvents.length / postsPerPage);
  const paginatedEvents = filteredEvents.slice(
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
            Events & Activities
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Join us in making a difference through our various events and
            activities.
          </p>

          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search events..."
            className="max-w-2xl mx-auto mb-12"
          />
        </div>
      </section>

      <section ref={searchResultsRef} className="py-16 bg-white scroll-mt-16">
        <div className="container mx-auto px-4 max-w-7xl">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results{" "}
                {filteredEvents.length > 0 ? `(${filteredEvents.length})` : ""}
              </h3>
              {filteredEvents.length === 0 && (
                <p className="text-muted-foreground">
                  No events found matching "{searchQuery}"
                </p>
              )}
            </div>
          )}

          {!searchQuery && stickyEvents.length > 0 && (
            <div className="mb-20">
              <StickyPostsSection
                posts={stickyEvents.slice(0, 2)}
                title="Featured Events"
                basePath="/events"
              />
            </div>
          )}

          {(searchQuery ? paginatedEvents : events).length > 0 && (
            <>
              {!searchQuery && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">Upcoming Events</h3>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {(searchQuery ? paginatedEvents : events).map((event: Post) => (
                  <ContentCard
                    key={event.id}
                    title={event.title}
                    excerpt={event.excerpt}
                    image={event.coverImage || "/images/placeholder.svg"}
                    slug={event.slug}
                    category="Event"
                    createdAt={event.createdAt}
                    href={`/events/${event.slug}`}
                    showDate={true}
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
