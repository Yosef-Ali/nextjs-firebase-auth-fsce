import React from "react";
import ClientCarousel from "./client-carousel";

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

const CarouselSection = () => {

  return (
    <div className="relative w-full h-[500px]">
      <ClientCarousel>
        {imageList.map((imagePath, index) => (
          <div key={index} className="relative w-full h-[500px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imagePath})` }}
            >
              <div className="absolute inset-0 bg-blue-500 bg-opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <h2 className="text-4xl font-bold mb-4">{slideContent[index].h1}</h2>
                <p className="text-xl">{slideContent[index].h3}</p>
              </div>
            </div>
          </div>
        ))}
      </ClientCarousel>
    </div>
  );
};

export default CarouselSection;