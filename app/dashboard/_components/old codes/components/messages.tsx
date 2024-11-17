"use client";
import React from 'react';

const MessageSection: React.FC = () => {
  return (
    <div className="ml-2 md:ml-4 mr-2">
      <div className="mt-20 sm:mt-0 text-center">
        <div
          className="w-64 h-64 rounded-full mx-auto bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("/yared.jpeg")`,
          }}
        />
        <h2 className="scroll-m-20 text-xl font-semibold tracking-tight mt-6">Yared Degefu</h2>
        <p className="text-sm text-muted-foreground">Executive Director</p>
        <p className="leading-7 [&:not(:first-child)]:mt-6">{`
          Welcome to the FSCE website! We're excited to share our progress in
          empowering children. We've recently undergone successful
          organizational changes to better serve our mission, and thanks to the
          dedication of our staff, partners, and supporters, we've secured
          increased funding and improved program implementation. Explore our
          site to learn more about how you can join us in making a lasting
          impact on children's lives.`}
        </p>
      </div>
    </div>
  );
};

export default MessageSection;