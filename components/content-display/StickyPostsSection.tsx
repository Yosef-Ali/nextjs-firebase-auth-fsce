import { Post } from "@/app/types/post";
import { motion } from "framer-motion";
import { PinIcon } from "lucide-react";
import { HorizontalPostCard } from "./HorizontalPostCard";

interface StickyPostsSectionProps {
  posts: Post[];
  title?: string;
  basePath: string;
  useCategory?: boolean;
}

export function StickyPostsSection({
  posts,
  title = "Pinned Posts",
  basePath,
  useCategory = false,
}: StickyPostsSectionProps) {
  if (posts.length === 0) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const getPostHref = (post: Post) => {
    if (useCategory) {
      // Extract category from post
      const category =
        typeof post.category === "string" ? post.category : post.category?.id;

      return `${basePath}/${category}/${post.slug}`;
    }

    return `${basePath}/${post.slug}`;
  };

  return (
    <div className="mb-16">
      <div className="flex items-center gap-2 mb-8">
        <PinIcon className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {posts.map((post) => (
          <HorizontalPostCard
            key={post.id}
            post={post}
            href={getPostHref(post)}
          />
        ))}
      </motion.div>
    </div>
  );
}
