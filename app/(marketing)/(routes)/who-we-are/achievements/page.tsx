"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ProgramSearch } from "@/components/program-search";
import { Post } from "@/app/types/post";
import { postsService } from "@/app/services/posts";
import { formatDate } from "@/app/utils/date";
import Image from "next/image";
import { PinIcon } from "lucide-react";
import { ContentCard } from "@/components/content-display/ContentCard";
import { HorizontalPostCard } from "@/components/content-display/HorizontalPostCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";

export default function AchievementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const postsPerPage = 12;
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await postsService.getPublishedPosts(
          "achievements"
        );
        setPosts(fetchedPosts);
        setSearchResults(fetchedPosts);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        toast({
          title: "Error",
          description:
            "Failed to load achievements. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    const filtered = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const stickyPosts = searchResults
    .filter((post) => post.sticky)
    .sort((a, b) => {
      // Sort by createdAt timestamp (newest first)
      const aTime =
        typeof a.createdAt === "number"
          ? a.createdAt
          : a.createdAt?.toMillis
          ? a.createdAt.toMillis()
          : new Date(a.createdAt as any).getTime();
      const bTime =
        typeof b.createdAt === "number"
          ? b.createdAt
          : b.createdAt?.toMillis
          ? b.createdAt.toMillis()
          : new Date(b.createdAt as any).getTime();
      return bTime - aTime; // Newest first
    });
  const regularPosts = searchResults.filter((post) => !post.sticky);
  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const paginatedPosts = regularPosts.slice(
    (page - 1) * postsPerPage,
    page * postsPerPage
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Our Achievements
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Discover our milestones and the impact we've made in empowering
            children and communities.
          </p>
          <ProgramSearch
            onSearch={handleSearch}
            placeholder="Search achievements..."
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results{" "}
                {searchResults.length > 0 ? `(${searchResults.length})` : ""}
              </h3>
              {searchResults.length === 0 && (
                <p className="text-muted-foreground">
                  No achievements found matching "{searchQuery}"
                </p>
              )}
            </div>
          )}

          {stickyPosts.length > 0 && !searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <PinIcon className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Featured Achievements</h3>
              </div>
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              >
                {stickyPosts.slice(0, 2).map((post) => (
                  <HorizontalPostCard
                    key={post.id}
                    post={post}
                    href={`/who-we-are/achievements/${post.slug}`}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {paginatedPosts.length > 0 && (
            <>
              {!searchQuery && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">All Achievements</h3>
                </div>
              )}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {paginatedPosts.map((post) => (
                  <ContentCard
                    key={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.coverImage || "/images/placeholder.svg"}
                    slug={post.slug}
                    category="Achievements"
                    createdAt={post.createdAt}
                    href={`/who-we-are/achievements/${post.slug}`}
                  />
                ))}
              </motion.div>
            </>
          )}

          {totalPages > 1 && !searchQuery && (
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
