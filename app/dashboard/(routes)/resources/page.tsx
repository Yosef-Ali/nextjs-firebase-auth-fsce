'use client';

import { useEffect, useState } from 'react';
import { ResourcesTable } from '@/app/dashboard/_components/ResourcesTable';
import { useAuth } from '@/lib/hooks/useAuth';
import { resourcesService } from '@/app/services/resources';
import { postsService } from '@/app/services/posts'; 
import { Resource } from '@/app/types/resource';
import { Post } from '@/app/types/post'; 

export default function ResourcesPage() {
  const { user, loading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadInitialResourcesAndPosts = async () => {
      if (!user) return;
      try {
        const allResources = await resourcesService.getAllResources();
        setResources(allResources);
        const allPosts = await postsService.getPublishedPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading resources or posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialResourcesAndPosts();
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view resources</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <ResourcesTable initialResources={resources} />
     
    </div>
  );
}
