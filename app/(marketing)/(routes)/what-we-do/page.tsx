'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ProgramSearch } from '@/components/program-search';
import { ContentCard } from '@/components/content-display/ContentCard';
import { StickyPostsSection } from '@/components/content-display/StickyPostsSection';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { toast } from '@/hooks/use-toast';

interface CategoryItem {
  id: string;
  title: string;
  description: string;
  count: number;
  excerpt: string;
  slug: string;
  category: string;
}

const categories: CategoryItem[] = [
  {
    id: 'child-protection',
    title: 'Child Protection',
    description: 'Comprehensive programs to ensure the safety and well-being of children',
    excerpt: 'Comprehensive programs to ensure the safety and well-being of children',
    count: 0,
    slug: 'child-protection',
    category: 'Programs'
  },
  {
    id: 'youth-empowerment',
    title: 'Youth Empowerment',
    description: 'Programs and initiatives to empower youth for a better future',
    excerpt: 'Programs and initiatives to empower youth for a better future',
    count: 0,
    slug: 'youth-empowerment',
    category: 'Programs'
  },
  {
    id: 'advocacy',
    title: 'Advocacy',
    description: "Speaking up and taking action for children's rights and needs",
    excerpt: "Speaking up and taking action for children's rights and needs",
    count: 0,
    slug: 'advocacy',
    category: 'Programs'
  },
  {
    id: 'humanitarian-response',
    title: 'Humanitarian Response',
    description: 'Providing critical support and assistance in times of crisis',
    excerpt: 'Providing critical support and assistance in times of crisis',
    count: 0,
    slug: 'humanitarian-response',
    category: 'Programs'
  },
];

export default function WhatWeDoPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [categoriesWithCount, setCategoriesWithCount] = useState(categories);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      // Replace getPostsByCategory with getPublishedPosts for the 'what-we-do' category
      const allPosts = await postsService.getPublishedPosts('what-we-do');
      setPosts(allPosts);

      // Update category counts - check both string and object form of category
      const updatedCategories = categories.map(category => ({
        ...category,
        count: allPosts.filter(post => {
          const postCategory = typeof post.category === 'string'
            ? post.category
            : post.category?.id;
          return postCategory === category.id;
        }).length
      }));

      setCategoriesWithCount(updatedCategories);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load content',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  if (loading) {
    return <FSCESkeleton />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="container mx-auto py-24 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">What We Do</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          Discover our comprehensive programs and initiatives designed to create lasting positive impact in communities.
        </p>

        <ProgramSearch
          onSearch={handleSearch}
          placeholder="Search programs and initiatives..."
          className="mt-6"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {categoriesWithCount.map((category) => (
          <Card key={category.id} className="p-6">
            <div className="text-2xl font-bold">{category.count}</div>
            <p className="text-xs text-muted-foreground">{category.title}</p>
          </Card>
        ))}
      </div>

      {/* Categories Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {categoriesWithCount.map((category) => (
          <ContentCard
            key={category.id}
            href={`/what-we-do/${category.id}`}
            title={category.title}
            excerpt={category.description}
            slug={category.id}
            category="Programs"
            layout="horizontal"
          />
        ))}
      </motion.div>

      {/* Featured/Sticky Posts Section */}
      {posts.some(post => post.sticky) && (
        <StickyPostsSection
          posts={posts.filter(post => post.sticky)}
          title="Featured Programs"
          basePath="/what-we-do"
        />
      )}
    </div>
  );
}
