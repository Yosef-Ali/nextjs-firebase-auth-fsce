'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContentCard } from '@/components/content-display/ContentCard';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';

export default function AdvocacyPage() {
  const [advocacyPosts, setAdvocacyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvocacy = async () => {
      try {
        setLoading(true);
        const advocacyQuery = query(
          collection(db, 'posts'),
          where('category', '==', 'advocacy'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(advocacyQuery);
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];

        setAdvocacyPosts(posts);
      } catch (error) {
        console.error('Error fetching advocacy posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocacy();
  }, []);

  if (loading) {
    return <FSCESkeleton />;
  }

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-8 text-3xl font-bold">Our Advocacy</h1>
      
      {advocacyPosts.length === 0 ? (
        <p className="text-center text-gray-500">No advocacy posts found</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {advocacyPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ContentCard
                title={post.title}
                excerpt={post.excerpt}
                image={post.coverImage}
                slug={post.slug}
                category={typeof post.category === 'string' ? post.category : post.category.name}
                createdAt={post.createdAt}
                index={index}
                href={`/posts/${post.slug}`}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
