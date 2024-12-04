import React from 'react';
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

const BoardMemberGridSkeleton = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto opacity-50">
        {/* Board Members */}
        <div className="space-y-8 mb-16">
          <Skeleton className="h-10 w-64 mx-auto bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-blue-50/40 hover:bg-blue-50/50 transition-colors rounded-xl shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <Skeleton className="w-48 h-48 rounded-lg bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                  <div className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32 bg-blue-100/30" />
                      <Skeleton className="h-8 w-full bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                      <Skeleton className="h-4 w-3/4 bg-blue-100/20" />
                    </div>
                    <Skeleton className="h-20 w-full bg-blue-100/20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Board Members */}
        <div className="space-y-8">
          <Skeleton className="h-8 w-48 mx-auto bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-blue-50/30 hover:bg-blue-50/40 transition-colors rounded-xl shadow-sm p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="w-40 h-40 rounded-lg bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-6 w-28 mx-auto bg-blue-100/30" />
                    <Skeleton className="h-8 w-3/4 mx-auto bg-gradient-to-r from-blue-100/40 to-blue-50/40" />
                    <Skeleton className="h-4 w-1/2 mx-auto bg-blue-100/20" />
                    <Skeleton className="h-16 w-full bg-blue-100/20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardMemberGridSkeleton;
