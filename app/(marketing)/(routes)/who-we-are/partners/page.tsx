"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import CarouselSection from "@/components/carousel";

export default function PartnersPage() {
  const [loading, setLoading] = useState(true);
  const [strategicPartners, setStrategicPartners] = useState<Partner[]>([]);
  const [membershipPartners, setMembershipPartners] = useState<Partner[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersRef = collection(db, "partners");
        const partnersQuery = query(partnersRef);
        const snapshot = await getDocs(partnersQuery);
        
        const allPartners = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Partner[];

        // Filter and sort partners after fetching
        const strategic = allPartners
          .filter(p => p.partnerType === "partner")
          .sort((a, b) => (a.order || 0) - (b.order || 0));
          
        const membership = allPartners
          .filter(p => p.partnerType === "membership")
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        setStrategicPartners(strategic);
        setMembershipPartners(membership);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <CarouselSection />
        <div className="py-16">
          <div className="text-center mb-20">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow-md">
                  <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <div className="py-16">
        <div className="text-center mb-20">
          <h1 className="text-4xl font-bold mb-6">Our Partners</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are proud to work with organizations that share our vision for protecting and empowering children.
          </p>
        </div>

        {/* Strategic Partners Section */}
        <div className="container mx-auto px-4 mb-24">
          <h2 className="text-3xl font-semibold mb-12 text-center">Partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {strategicPartners.map((partner) => (
              <div 
                key={partner.id} 
                className="block transition-transform hover:scale-[1.02]"
              >
                <div className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-full bg-white p-4">
                      <div className="w-32 h-32 relative mx-auto">
                        {partner.logoUrl ? (
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                            <span className="text-2xl font-bold text-gray-500">
                              {partner.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-blue-50/50">
                      <h3 className="font-semibold text-lg text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-600/90 font-medium text-center">{partner.description}</p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 text-sm text-center"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Partners Section */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-12 text-center">Membership Partners</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipPartners.map((partner) => (
              <div 
                key={partner.id} 
                className="block transition-transform hover:scale-[1.02]"
              >
                <div className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden h-full">
                  <div className="flex flex-col h-full">
                    <div className="w-full bg-white p-4">
                      <div className="w-32 h-32 relative mx-auto">
                        {partner.logoUrl ? (
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                            <span className="text-2xl font-bold text-gray-500">
                              {partner.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-2 bg-blue-50/50">
                      <h3 className="font-semibold text-lg text-center bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-gray-600/90 font-medium text-center">{partner.description}</p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-600 hover:text-blue-800 text-sm text-center"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}