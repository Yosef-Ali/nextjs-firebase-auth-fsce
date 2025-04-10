"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { enableNetwork, disableNetwork } from "firebase/firestore";
import { safeQuery, getPublishedDocuments } from "@/app/utils/firestore-utils";
import { db } from "@/lib/firebase";
import { Category } from "@/app/types/category";
import { Post } from "@/app/types/post";
import { Alert } from "@/components/ui/alert";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ContentCard } from "@/components/content-display/ContentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FeaturedSectionSkeleton } from "./featured-section-skeleton";

interface TabContentProps {
  posts: Post[];
  category: string;
  emptyMessage?: string;
}

export default function FeaturedSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Memoize sorted posts by category
  const postsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      const categoryPosts = posts.filter(
        (post) =>
          (typeof post.category === "string" &&
            post.category === category.id) ||
          (typeof post.category === "object" &&
            post.category?.id === category.id)
      );
      const sortedPosts = [...categoryPosts].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        const getTime = (timestamp: any) => {
          if (typeof timestamp === "number") return timestamp;
          if (typeof timestamp === "string")
            return new Date(timestamp).getTime();
          if (typeof timestamp.toDate === "function")
            return timestamp.toDate().getTime();
          if (timestamp instanceof Date) return timestamp.getTime();
          return 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });
      acc[category.id] = sortedPosts.slice(0, 4);
      return acc;
    }, {} as Record<string, Post[]>);
  }, [categories, posts]);

  // Network status effect
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      enableNetwork(db).catch(console.error);
    };

    const handleOffline = () => {
      setIsOnline(false);
      disableNetwork(db).catch(console.error);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get categories using safe query
        const categoriesResults = await safeQuery("categories");
        setCategories(categoriesResults as Category[]);

        // Get published posts using our utility
        const postsResults = await getPublishedDocuments("posts");
        setPosts(postsResults as Post[]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load content"
        );
        setLoading(false);
      }
    };

    fetchData();

    // No cleanup needed since we're not using listeners
  }, []);

  if (loading) {
    return <FeaturedSectionSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <p>{error}</p>
        {!isOnline && (
          <p>You are currently offline. Some content may not be available.</p>
        )}
      </Alert>
    );
  }

  const TabContent: React.FC<TabContentProps> = ({
    posts,
    category,
    emptyMessage,
  }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
      triggerOnce: false,
      threshold: 0.1,
    });

    useEffect(() => {
      if (inView) {
        controls.start("visible");
      }
    }, [inView, controls]);

    return (
      <motion.div
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
          hidden: {
            opacity: 0,
          },
        }}
      >
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <ContentCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt || post.content?.slice(0, 100) || ""}
                image={
                  post.coverImage ||
                  post.images?.[0] ||
                  "/images/placeholder.svg"
                }
                slug={post.slug}
                category={category}
                createdAt={post.createdAt}
                index={index}
                href={`/${category}/${post.slug}`}
                showDate
                aspectRatio="square"
                isFeatured={post.sticky}
                layout="vertical"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {emptyMessage || `No ${category} available at the moment.`}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold tracking-tighter sm:text-4xl text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Featured Content
        </motion.h2>

        <Tabs defaultValue={categories[0]?.id} className="w-full">
          <div className="overflow-x-auto scrollbar-hide mb-8">
            <TabsList className="inline-flex w-full justify-start gap-2 h-auto p-1 bg-muted/30">
              {categories.map((category) => {
                const hasContent =
                  (postsByCategory[category.id] || []).length > 0;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className={cn(
                      "px-4 py-2 rounded-md",
                      "data-[state=active]:bg-background",
                      "data-[state=active]:text-primary",
                      "data-[state=active]:shadow-sm",
                      !hasContent && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={!hasContent}
                  >
                    {category.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent
              key={category.id}
              value={category.id}
              className="focus-visible:outline-none"
            >
              <TabContent
                posts={postsByCategory[category.id] || []}
                category={category.id}
                emptyMessage={`No featured content available in ${category.name}.`}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
