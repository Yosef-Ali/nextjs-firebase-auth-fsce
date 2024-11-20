"use client";

import React from 'react';
import CarouselSection from "@/components/carousel";
import BoardMemberGrid from './_components/BoardMemberGrid';

const members = [
  {
    name: 'Dr. Sarah Alemayehu',
    position: 'Executive Director',
    image: '/images/profile.webp',
    bio: 'Dr. Sarah brings over 15 years of experience in child welfare and organizational leadership. She has led numerous successful initiatives focused on improving the lives of vulnerable children in Ethiopia.',
    featured: true
  },
  {
    name: 'Ato Bekele Tadesse',
    position: 'Board Chairman',
    image: '/images/profile.webp',
    bio: 'With 20+ years of experience in nonprofit governance, Ato Bekele has been instrumental in shaping strategic directions and ensuring organizational sustainability.',
    featured: true
  },
  {
    name: 'W/ro Tigist Haile',
    position: 'Vice Chairperson',
    image: '/images/profile.webp',
    bio: 'W/ro Tigist has extensive experience in community development and child protection programs, bringing valuable insights to our organization.',
    featured: true
  },
  {
    name: 'Dr. Yohannes Wolde',
    position: 'Secretary',
    image: '/images/profile.webp',
    bio: 'An expert in educational policy and child development, Dr. Yohannes ensures our programs align with best practices in child welfare.'
  },
  {
    name: 'Ato Girma Kebede',
    position: 'Treasurer',
    image: '/images/profile.webp',
    bio: 'A certified accountant with expertise in nonprofit financial management, Ato Girma oversees our financial sustainability and transparency.'
  },
  {
    name: 'W/ro Bethlehem Alemu',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'A successful entrepreneur and philanthropist, W/ro Bethlehem contributes valuable business acumen and social impact expertise.'
  },
  {
    name: 'Dr. Solomon Tekle',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'As a pediatrician and public health expert, Dr. Solomon provides crucial guidance on child health and welfare programs.'
  },
  {
    name: 'W/ro Meseret Worku',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'With a background in social work and community organizing, W/ro Meseret ensures our programs remain community-centered.'
  },
  {
    name: 'Ato Dawit Gebre',
    position: 'Board Member',
    image: '/images/profile.webp',
    bio: 'An expert in project management and strategic planning, Ato Dawit helps guide our organizational growth and program effectiveness.'
  }
];

export default function BoardMembersPage() {
  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Board Members</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our dedicated board members who bring their expertise and passion to guide our organization
              in making a positive impact in the lives of children and communities across Ethiopia.
            </p>
          </div>
          <BoardMemberGrid members={members} />
        </div>
      </section>
    </div>
  );
}