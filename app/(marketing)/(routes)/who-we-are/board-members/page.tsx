"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from '@/components/ui/skeleton';
import CarouselSection from "@/components/carousel";

interface BoardMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  status: 'published' | 'draft';
  featured: boolean;
  order: number;
}

interface FoundingGroup {
  image: string;
  description: string;
}

export default function BoardMembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [foundingGroup, setFoundingGroup] = useState<FoundingGroup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch board members
        const membersQuery = query(
          collection(db, "board-members"),
          where("status", "==", "published")
        );
        
        const membersSnapshot = await getDocs(membersQuery);
        const boardMembers = membersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BoardMember[];

        // Fetch founding group data
        try {
          const foundingGroupDoc = await getDoc(doc(db, "founding-group", "main"));
          if (foundingGroupDoc.exists()) {
            const foundingGroupData = foundingGroupDoc.data() as FoundingGroup;
            console.log("Found founding group data:", foundingGroupData);
            setFoundingGroup(foundingGroupData);
          } else {
            console.log("No founding group document found");
          }
        } catch (error) {
          console.error("Error fetching founding group:", error);
        }

        console.log("Board members:", boardMembers);
        setMembers(boardMembers);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort members client-side instead
  const sortedMembers = [...members].sort((a, b) => {
    // First by featured status
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Then by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // Fallback to name if order is not set
    return a.name.localeCompare(b.name);
  });

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

        <div className="mb-20">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div>
                <Skeleton className="w-full h-[400px] rounded-lg mb-8" />
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <>
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden mb-8">
                  <Image 
                    src={foundingGroup?.image || "/images/events/conference.jpg"}
                    alt="FSCE Founding Group"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-bold mb-4">Our Founders</h2>
                  <p className="text-gray-700 mb-6">
                    {foundingGroup?.description || 
                     "The Forum on Sustainable Child Empowerment (FSCE) was established by a dedicated group of professionals and community leaders committed to improving the lives of vulnerable children in Ethiopia. Our founders envisioned an organization that would work tirelessly to protect children's rights, provide educational opportunities, and create sustainable solutions for communities in need."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Current Board Members</h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-lg overflow-hidden"
                >
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                      <h3 className="text-xl font-semibold mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {member.name}
                      </h3>
                      <p className="text-sm text-white/90 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                        {member.position}
                      </p>
                      <p className="text-sm text-white/80 leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 line-clamp-3">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}