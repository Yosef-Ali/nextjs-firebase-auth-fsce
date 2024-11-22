import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

const PartnersGridSkeleton = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto opacity-50">
        {/* Featured Partners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-6">
              <div className="flex flex-col space-y-4">
                <Skeleton className="w-full h-48 rounded-lg bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24 bg-blue-100/30" />
                  <Skeleton className="h-8 w-3/4 bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                  <Skeleton className="h-4 w-full bg-blue-100/20" />
                  <Skeleton className="h-4 w-full bg-blue-100/20" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Other Partners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col">
                <Skeleton className="w-full h-32 bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-blue-100/30" />
                  <Skeleton className="h-4 w-full bg-blue-100/20" />
                  <Skeleton className="h-4 w-2/3 bg-blue-100/20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersGridSkeleton;