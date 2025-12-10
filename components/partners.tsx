"use client";

import { useEffect, useState } from "react";
import { CarouselItem, CarouselContent, CarouselPrevious, CarouselNext, Carousel } from "@/components/ui/carousel";
import Image from "next/image";
import { partnersService } from "@/app/services/partners";
import { Partner } from "@/app/types/partner";

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const data = await partnersService.getAllPartners();
        // Filter out partners without logos
        const partnersWithLogos = data.filter(partner => partner.logo);
        setPartners(partnersWithLogos);
      } catch (err) {
        console.error("Error fetching partners:", err);
        setError("Failed to load partners");
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Split partners into chunks of 5 for each carousel item
  const chunkPartners = (array: Partner[], size: number) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  const partnerChunks = chunkPartners(partners, 5);

  if (loading) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto grid gap-4 px-4 py-8 text-center md:px-6 lg:gap-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Partners</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Loading our amazing partners...
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-[140px] h-[70px] bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto grid gap-4 px-4 py-8 text-center md:px-6 lg:gap-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Partners</h2>
            <p className="mx-auto max-w-[700px] text-red-500 md:text-xl/relaxed">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
        <div className="container mx-auto grid gap-4 px-4 py-8 text-center md:px-6 lg:gap-10">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Partners</h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              No partners to display at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
      <div className="container mx-auto grid gap-4 px-4 py-8 text-center md:px-6 lg:gap-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Partners</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            {`We are proud to work with these amazing organizations.`}
          </p>
        </div>
        <div className="w-full flex justify-center">
          <Carousel className="w-full max-w-6xl">
            <CarouselContent>
              {partnerChunks.map((chunk, chunkIndex) => (
                <CarouselItem key={chunkIndex}>
                  <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                    {chunk.map((partner) => (
                      <div key={partner.id} className="relative w-[140px] h-[70px]">
                        <Image
                          src={partner.logo!}
                          alt={partner.name}
                          fill
                          className="object-contain opacity-50 transition-opacity hover:opacity-100"
                          sizes="140px"
                        />
                      </div>
                    ))}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}