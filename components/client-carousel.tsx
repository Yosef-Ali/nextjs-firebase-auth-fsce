"use client";

import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 1
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1
  }
};

interface ClientCarouselProps {
  children: React.ReactNode;
}

const CustomButtonGroup = ({ next, previous }: any) => {
  return (
    <div className="custom-button-group absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
      <Button
        onClick={previous}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-blue-950/30 backdrop-blur-sm hover:bg-blue-900/50 shadow-lg border-blue-400/10"
      >
        <ChevronLeft className="h-6 w-6 text-blue-100" />
      </Button>
      <Button
        onClick={next}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-blue-950/30 backdrop-blur-sm hover:bg-blue-900/50 shadow-lg border-blue-400/10"
      >
        <ChevronRight className="h-6 w-6 text-blue-100" />
      </Button>
    </div>
  );
};

const ClientCarousel = ({ children }: ClientCarouselProps) => {
  return (
    <div className="relative">
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        arrows={false}
        showDots={false}
        customButtonGroup={<CustomButtonGroup />}
        renderButtonGroupOutside={true}
      >
        {children}
      </Carousel>
    </div>
  );
};

export default ClientCarousel;
