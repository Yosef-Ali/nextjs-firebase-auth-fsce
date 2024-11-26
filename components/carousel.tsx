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
  { 
    title: 'Child Protection', 
    subtitle: 'Protecting children from abuse, exploitation, and neglect.',
    description: 'Join us in our mission to create a safer future for every child.'
  },
  { 
    title: 'Youth Empowerment', 
    subtitle: 'Empowering youth through education, skills, and livelihood support.',
    description: 'Building tomorrow\'s leaders through comprehensive development programs.'
  },
  { 
    title: 'Advocacy', 
    subtitle: "Advocating for children's and youth's rights and welfare.",
    description: 'Raising voices for those who need it most.'
  },
  { 
    title: 'Humanitarian Response', 
    subtitle: 'Responding to humanitarian crises, providing relief and support.',
    description: 'Immediate action when it matters most.'
  },
  { 
    title: 'Community Development', 
    subtitle: 'Developing communities through sustainable development programs.',
    description: 'Creating lasting change through community empowerment.'
  },
];

const CarouselSection = () => {
  return (
    <div className="relative w-full h-[600px]">
      <ClientCarousel>
        {imageList.map((imagePath, index) => (
          <div key={index} className="relative w-full h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imagePath})` }}
            >
              {/* Lighter blue overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-blue-700/40" />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-blue-900/40" />
              
              {/* Content container with more bottom padding */}
              <div className="absolute inset-0 container mx-auto flex flex-col justify-center text-white px-4 md:px-8 lg:px-16 pb-24">
                <div className="max-w-3xl mt-20">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight text-white">
                    {slideContent[index].title}
                  </h1>
                  <p className="text-2xl md:text-3xl mb-5 text-blue-100 max-w-2xl">
                    {slideContent[index].subtitle}
                  </p>
                  <p className="text-lg md:text-xl text-blue-200 max-w-xl">
                    {slideContent[index].description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </ClientCarousel>
    </div>
  );
};

export default CarouselSection;