'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Post } from '@/app/types/post';
import { postsService } from '@/app/services/posts';
import { ProgramSearch } from '@/components/program-search';
import { ContentCard } from '@/components/content-display/ContentCard';
import { HorizontalPostCard } from '@/components/content-display/HorizontalPostCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';
import { PinIcon } from 'lucide-react';

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
        const categoryPosts = await postsService.getPublishedPosts(params.category);
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
    setPage(1);
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
  const stickyPosts = searchResults.filter(post => post.sticky);
  const regularPosts = searchResults.filter(post => !post.sticky);
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
      {/* Hero Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            {categoryName}
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-8">
            Learn about our initiatives and impact in {categoryName.toLowerCase()}.
          </p>
          <ProgramSearch
            onSearch={handleSearch}
            placeholder={`Search in ${categoryName}...`}
            className="max-w-2xl mx-auto"
          />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          {searchQuery && (
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-2">
                Search Results {searchResults.length > 0 ? `(${searchResults.length})` : ''}
              </h3>
              {searchResults.length === 0 && (
                <p className="text-muted-foreground">No posts found matching "{searchQuery}"</p>
              )}
            </div>
          )}

          {stickyPosts.length > 0 && !searchQuery && (
            <div className="mb-16">
              <div className="flex items-center gap-2 mb-8">
                <PinIcon className="h-6 w-6 text-primary" />
                <h3 className="text-2xl font-bold">Pinned Posts</h3>
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
                    href={`/${params.category}/${post.slug}`}
                  />
                ))}
              </motion.div>
            </div>
          )}

          {paginatedPosts.length > 0 && (
            <>
              {!searchQuery && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">All Posts</h3>
                </div>
              )}
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
              >
                {paginatedPosts.map((post, index) => (
                  <ContentCard
                    key={post.id}
                    title={post.title}
                    excerpt={post.excerpt}
                    image={post.coverImage || "/images/placeholder.svg"}
                    slug={post.slug}
                    category={categoryName}
                    createdAt={post.createdAt}
                    href={`/${params.category}/${post.slug}`}
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

function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
