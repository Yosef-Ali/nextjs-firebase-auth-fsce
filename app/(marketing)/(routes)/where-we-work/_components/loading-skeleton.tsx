import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LoadingSkeleton = () => {
  return (
    <div className="w-full animate-pulse">
      <div className="w-full py-20 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-200 rounded-lg max-w-md mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded-lg max-w-lg mx-auto" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="p-4 bg-gray-100 rounded-lg">
                      <div className="h-6 bg-gray-200 rounded mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const CarouselSkeleton = () => {
  return (
    <div className="w-full h-[500px] bg-gray-200 animate-pulse" />
  );
};

const PartnersSkeleton = () => {
  return (
    <div className="w-full py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export { LoadingSkeleton, CarouselSkeleton, PartnersSkeleton };
