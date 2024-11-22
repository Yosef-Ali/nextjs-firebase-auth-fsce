import { CarouselSkeleton, LoadingSkeleton, PartnersSkeleton } from "./_components/loading-skeleton";

export default function Loading() {
  return (
    <>
      <CarouselSkeleton />
      <LoadingSkeleton />
      <PartnersSkeleton />
    </>
  );
}
