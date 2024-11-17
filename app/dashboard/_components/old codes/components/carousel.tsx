import React, { useEffect } from "react";
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

export default function CarouselSection() {


  const imageList = [
    "/images/hero-img-1.webp",
    "/images/hero-img-2.webp",
    "/images/hero-img-3.webp",
    "/images/hero-img-4.webp",
    "/images/hero-img-5.webp",
  ];

  const slideContent = [
    { h1: 'Child Protection', h3: 'Protecting children from abuse, exploitation, and neglect.' },
    { h1: 'Youth Empowerment', h3: 'Empowering youth through education, skills, and livelihood support.' },
    { h1: 'Advocacy', h3: "Advocating for children's and youth's rights and welfare." },
    { h1: 'Humanitarian Response', h3: 'Responding to humanitarian crises, providing relief and support.' },
    { h1: 'Community Development', h3: 'Developing communities through sustainable development programs.' },
  ];

  return (
    <div className="w-full">
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={5000}
        className="w-full"
        containerClass="carousel-container"
        itemClass="carousel-item-padding-40-px"
      >
        {imageList.map((imagePath, index) => (
          <div key={index} className="relative w-full h-[600px]">
            <img
              src={imagePath}
              alt={`carousel-image-${index}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-500 bg-opacity-40"></div>
            <div
              className="absolute bottom-0 left-0 p-8 text-white animate-fadeIn duration-500 delay-200"
              style={{ bottom: 0, left: 350 }}
            >
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] text-balance">
                {slideContent[index].h1}
              </h1>
              <p className="max-w-[750px] text-lg font-light text-muted shadow">
                {slideContent[index].h3}
              </p>
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
}