"use client";

import React, { useEffect, useState } from 'react';
import CarouselSection from "@/components/carousel";
import BoardMemberGrid from './_components/BoardMemberGrid';
import BoardMemberGridSkeleton from './_components/BoardMemberGridSkeleton';
import Partners from '@/components/partners';
import SectionHeader from '@/components/section-header';
import { boardMemberService } from '@/app/services/board-members';
import { BoardMember } from '@/app/types/board-member';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Sample data for testing
const sampleMembers: BoardMember[] = [
  {
    id: '1',
    name: 'John Smith',
    position: 'Executive Director',
    bio: 'John has over 20 years of experience in nonprofit leadership.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
    featured: true,
    order: 1,
    status: 'published',
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    position: 'Board Chair',
    bio: 'Sarah brings extensive experience in community development.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    featured: true,
    order: 2,
    status: 'published',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export default function BoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useTestData, setUseTestData] = useState(true); // Toggle this for testing

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (useTestData) {
          console.log('Using test data:', sampleMembers);
          setMembers(sampleMembers);
        } else {
          console.log('Fetching board members from Firebase...');
          const data = await boardMemberService.getBoardMembers();
          console.log('Firebase data:', data);
          setMembers(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load board members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [useTestData]);

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <CarouselSection />
        <div className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button
              variant="outline"
              onClick={() => setUseTestData(!useTestData)}
              className="mx-auto"
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Toggle Test Data
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CarouselSection />
        <div className="py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Our Board Members
            </h1>
            <p className="text-xl text-gray-600/90 max-w-3xl mx-auto">
              Meet our dedicated board members who guide our organization's mission and vision.
            </p>
          </div>
          <BoardMemberGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <div className="py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Our Board Members
          </h1>
          <p className="text-xl text-gray-600/90 max-w-3xl mx-auto">
            Meet our dedicated board members who guide our organization's mission and vision.
          </p>
        </div>
        <BoardMemberGrid members={members} />
      </div>
      <Partners />
    </div>
  );
}