import Image from "next/image";
import { useEffect, useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, useAnimation, Variants } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { postsService } from '@/app/services/posts';
import { categoriesService } from '@/app/services/categories';
import { Post, Category } from '@/app/types/post';
import Link from 'next/link';
import { ArrowRight, Calendar } from "lucide-react";
import { ContentCard } from "./content-display/ContentCard";

interface TabContentProps {
  posts: Post[];
  category: string;
  emptyMessage?: string;
}

export default function FeaturedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // First get categories to ensure proper mapping
        const fetchedCategories = await categoriesService.getCategories('post');
        // Then get posts
        const fetchedPosts = await postsService.getPublishedPosts();

        // Map the categories properly, ensuring Child Protection and Events are correctly identified
        const mappedCategories = fetchedCategories.map(category => ({
          ...category,
          id: category.id === 'RMglo9PIj6wNdQNSFcuA' ? 'child-protection' : category.id,
          name: category.id === 'RMglo9PIj6wNdQNSFcuA' ? 'Child Protection' : category.name
        }));

        setPosts(fetchedPosts);
        setCategories(mappedCategories);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filterPostsByCategory = (categoryId: string) => {
    return posts.filter(post => {
      const postCategoryId = post.category?.id?.toLowerCase();
      const postCategoryName = post.category?.name?.toLowerCase();

      // Handle Child Protection special case
      if (categoryId === 'child-protection' &&
        (postCategoryId === 'rmglo9pij6wndqnsfcua' ||
          postCategoryName === 'child protection')) {
        return true;
      }

      // Handle Events category variations
      if (categoryId === 'events' &&
        (postCategoryId === 'events' ||
          postCategoryId === 'event' ||
          postCategoryName === 'events')) {
        return true;
      }

      return postCategoryId === categoryId.toLowerCase();
    });
  };

  const categorizedPosts = useMemo(() => {
    const postsByCategory: Record<string, Post[]> = {};
    categories.forEach(category => {
      postsByCategory[category.id] = filterPostsByCategory(category.id);
    });
    return postsByCategory;
  }, [categories, posts]);

  const formatCategoryName = (category: Category): string => {
    // Special case for child protection ID
    if (category.id.toLowerCase() === 'rmglo9pij6wndqnsfcua') {
      return 'Child Protection';
    }
    return category.name;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const TabContent: React.FC<TabContentProps> = ({ posts, category, emptyMessage }) => {
    const controls = useAnimation();
    const [ref, inView] = useInView({
      triggerOnce: false,
      threshold: 0,
      rootMargin: "100px 0px"
    });

    useEffect(() => {
      if (inView) {
        controls.start('visible');
      }
    }, [inView, controls]);

    // Limit posts to 4 items
    const limitedPosts = posts.slice(0, 4);

    return (
      <motion.div
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: {
            opacity: 1,
            transition: {
              when: "beforeChildren",
              staggerChildren: 0.2
            }
          },
          hidden: {
            opacity: 0
          }
        }}
      >
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {limitedPosts.map((post, index) => (
              <ContentCard
                key={post.id}
                title={post.title}
                excerpt={post.excerpt || post.content.slice(0, 100)}
                image={post.images?.[0] || post.coverImage}
                slug={post.slug}
                category={category}
                createdAt={post.createdAt}
                index={index}
                href={`/${category}/${post.slug}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage || `No ${category} available at the moment.`}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <section className="py-16 px-4">
      <motion.h2
        className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Featured Content
      </motion.h2>

      <Tabs defaultValue={categories[0]?.id} className="container mx-auto">
        <div className="overflow-x-auto -mx-4 px-4 pb-3 scrollbar-hide">
          <TabsList className="inline-flex min-w-max w-full gap-2 mb-8 bg-muted/30 rounded-lg p-1 shadow-inner">
            {categories.map((category, index) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={`capitalize text-base font-medium text-center h-auto py-3 px-6 transition-all rounded-md 
                  flex-shrink-0
                  truncate overflow-hidden text-ellipsis
                  data-[state=active]:bg-background 
                  data-[state=active]:text-primary 
                  data-[state=active]:font-semibold 
                  data-[state=active]:shadow-sm 
                  hover:bg-muted/40 
                  focus-visible:outline-none 
                  focus-visible:ring-2 
                  focus-visible:ring-primary/30
                  disabled:opacity-50 
                  disabled:cursor-not-allowed
                  disabled:hover:bg-transparent
                  [&>span]:block
                  [&>span]:truncate
                  touch-pan-x
                  ${index === 0 ? 'min-w-[180px] flex-1' :
                    index === categories.length - 1 ? 'min-w-[180px] flex-1' :
                      'min-w-[140px] max-w-[200px]'}`}
                disabled={!categorizedPosts[category.id]?.length}
              >
                <span title={formatCategoryName(category)}>{formatCategoryName(category)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <TabContent
              posts={categorizedPosts[category.id] || []}
              category={category.id}
              emptyMessage={`No ${formatCategoryName(category)} content available at the moment.`}
            />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
