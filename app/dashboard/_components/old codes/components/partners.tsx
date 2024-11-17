import { CarouselItem, CarouselContent, CarouselPrevious, CarouselNext, Carousel } from "@/components/ui/carousel";

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
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Logo-Kindernothilfe.svg.png"
                    width={140}
                  />
                  <img
                    alt="The World Bank logo"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/The_World_Bank_logo_PNG2.png"
                    width={140}
                  />
                  <img
                    alt="Unicef logo"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Unicef_logo_PNG5.png"
                    width={140}
                  />
                  <img
                    alt="usaid"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/usaid.png"
                    width={140}
                  />
                  <img
                    alt="Save The Children logo"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Save_The_Children_logo_PNG1.png"
                    width={140}
                  />


                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  <img
                    alt="DC logo"
                    className="object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/DC_logo_RGB_groot.jpg"
                    width={140}
                  />
                  <img
                    alt="ECPAT logo"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/ECPAT_logo.png"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/Emblem_of_Ethiopia.svg.png"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/ethiopiaid-logo-with-stapline.jpg"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/family-for-every-child-logo.png"
                    width={140}
                  />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/freedom-fund-logo.svg"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/EW1ousPXYAAI_L4.jpg"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/iom.jpg"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/kinderpostzegels.png"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Logo-Kindernothilfe.svg.png"
                    width={140}
                  />
                </div>
              </CarouselItem>
              <CarouselItem>
                <div className="flex items-center justify-center flex-wrap md:flex-nowrap gap-6 p-6">
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Plan-logo.png"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Logo-of-Ethiopian-Ministry-of-Labor-and-Social-Affairs.jpg"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={140}
                    src="/images/stop-child-explo.webp"
                    width={140}
                  />
                  <img
                    alt="oak_correct"
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/oak_correct.png"
                    width={140}
                  />
                  <img
                    alt=""
                    className="aspect-[2/1] object-contain opacity-50 transition-opacity hover:opacity-100"
                    height={70}
                    src="/images/Logo-Kindernothilfe.svg.png"
                    width={140}
                  />
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