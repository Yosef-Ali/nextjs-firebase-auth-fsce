"use client";

import React from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

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

const ClientCarousel = ({ children }: ClientCarouselProps) => {
  return (
    <Carousel
      responsive={responsive}
      infinite={true}
      autoPlay={true}
      autoPlaySpeed={5000}
      showDots={true}
      removeArrowOnDeviceType={["tablet", "mobile"]}
    >
      {children}
    </Carousel>
  );
};

export default ClientCarousel;
