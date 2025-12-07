import { CarouselItem, CarouselContent, CarouselPrevious, CarouselNext, Carousel } from "@/components/ui/carousel";
import Image from "next/image";

export default function Partners() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
      <div className="container mx-auto grid gap-4 px-4 py-8 text-center md:px-6 lg:gap-10 border-emerald-400">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Our Partners</h2>
          <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            {`We are proud to work with these amazing organizations.`}
          </p>
        </div>
        <div className="w-full flex justify-center">
          <Carousel className="w-full max-w-6xl">
            <CarouselContent>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  {[
                    { src: "/images/Logo-Kindernothilfe.svg.png", alt: "Kindernothilfe logo" },
                    { src: "/images/The_World_Bank_logo_PNG2.png", alt: "The World Bank logo" },
                    { src: "/images/Unicef_logo_PNG5.png", alt: "Unicef logo" },
                    { src: "/images/usaid.png", alt: "USAID logo" },
                    { src: "/images/Save_The_Children_logo_PNG1.png", alt: "Save The Children logo" }
                  ].map((img) => (
                    <div key={img.src} className="relative w-[140px] h-[70px]">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-contain opacity-50 transition-opacity hover:opacity-100"
                        sizes="140px"
                      />
                    </div>
                  ))}
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  {[
                    { src: "/images/DC_logo_RGB_groot.jpg", alt: "DC logo" },
                    { src: "/images/ECPAT_logo.png", alt: "ECPAT logo" },
                    { src: "/images/Emblem_of_Ethiopia.svg.png", alt: "Emblem of Ethiopia" },
                    { src: "/images/ethiopiaid-logo-with-stapline.jpg", alt: "Ethiopiaid logo" },
                    { src: "/images/family-for-every-child-logo.png", alt: "Family for Every Child logo" }
                  ].map((img) => (
                    <div key={img.src} className="relative w-[140px] h-[70px]">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-contain opacity-50 transition-opacity hover:opacity-100"
                        sizes="140px"
                      />
                    </div>
                  ))}
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  {[
                    { src: "/images/freedom-fund-logo.svg", alt: "Freedom Fund logo" },
                    { src: "/images/EW1ousPXYAAI_L4.jpg", alt: "Organization logo" },
                    { src: "/images/iom.jpg", alt: "IOM logo" },
                    { src: "/images/kinderpostzegels.png", alt: "Kinderpostzegels logo" },
                    { src: "/images/Logo-Kindernothilfe.svg.png", alt: "Kindernothilfe logo" }
                  ].map((img) => (
                    <div key={img.src} className="relative w-[140px] h-[70px]">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-contain opacity-50 transition-opacity hover:opacity-100"
                        sizes="140px"
                      />
                    </div>
                  ))}
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  {[
                    { src: "/images/Plan-logo.png", alt: "Plan logo" },
                    { src: "/images/Logo-of-Ethiopian-Ministry-of-Labor-and-Social-Affairs.jpg", alt: "Ministry of Labor and Social Affairs logo" },
                    { src: "/images/stop-child-explo.webp", alt: "Stop Child Exploitation logo" },
                    { src: "/images/oak_correct.png", alt: "Oak Foundation logo" },
                    { src: "https://firebasestorage.googleapis.com/v0/b/fsce-2024.appspot.com/o/partners%2F1739449620952-Logo-Kindernothilfe.svg.png?alt=media&token=4f969dbc-1af4-4f78-9b12-713cedc45ae5", alt: "SOS Children Village Ethiopia" }
                  ].map((img) => (
                    <div key={img.src} className="relative w-[140px] h-[70px]">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        fill
                        className="object-contain opacity-50 transition-opacity hover:opacity-100"
                        sizes="140px"
                      />
                    </div>
                  ))}
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </div>
    </section>
  );
}