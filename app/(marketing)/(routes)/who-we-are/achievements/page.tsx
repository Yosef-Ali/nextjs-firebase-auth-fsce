'use client';

import { useEffect, useState } from 'react';
import { Post } from '@/types';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ContentCard } from '@/components/content-display/ContentCard';
import FSCESkeleton from '@/components/FSCESkeleton';
import { motion } from 'framer-motion';
import { postsService } from '@/app/services/posts';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Post[]>([]);
  const [stickyAchievements, setStickyAchievements] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        console.log('Starting to fetch achievements');
        setLoading(true);

        // Verify Firebase connection
        if (!db) {
          throw new Error('Firebase database connection not available');
        }

        console.log('Firebase connection verified');

        const achievementsQuery = query(
          collection(db, 'posts'),
          where('category.id', '==', 'achievements'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );

        console.log('Executing query for achievements posts');

        const snapshot = await getDocs(achievementsQuery);

        if (snapshot.empty) {
          console.log('No achievements posts found');
          setStickyAchievements([]);
          setAchievements([]);
          return;
        }

        console.log(`Found ${snapshot.docs.length} achievement posts`);

        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Post[];

        console.log('Posts mapping completed');

        const sticky = posts.filter(post => post.sticky);
        const regular = posts.filter(post => !post.sticky);

        console.log(`Filtered posts: ${sticky.length} sticky, ${regular.length} regular`);

        setStickyAchievements(sticky);
        setAchievements(regular);
      } catch (error) {
        console.error('Error fetching achievements:', error);
        // You might want to set some error state here
        setStickyAchievements([]);
        setAchievements([]);
      } finally {
        console.log('Fetch achievements operation completed');
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  if (loading) {
    return <FSCESkeleton />;
  }

  const renderPost = (post: Post, index: number) => (
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
        category={post.category.name}
        createdAt={post.createdAt}
        index={index}
        isFeatured={post.sticky}
        href={`/posts/${post.slug}`}
      />
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {stickyAchievements.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stickyAchievements.map((achievement, index) => renderPost(achievement, index))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-6">All Achievements</h2>
        {achievements.length === 0 ? (
          <p className="text-center text-gray-500">No achievements found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => renderPost(achievement, index))}
          </div>
        )}
      </section>
    </div>
  );
}
