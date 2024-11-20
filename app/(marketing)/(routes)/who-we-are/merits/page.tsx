"use client";

import { Award, Shield, Target, Heart, Users, Lightbulb, Scale, Clock, Sparkles } from "lucide-react";
import CarouselSection from "@/components/carousel";
import MeritsGrid from './_components/MeritsGrid';

const meritsData = [
  {
    title: "Child-Centered Approach",
    description: "Putting children's needs and rights at the heart of everything we do.",
    longDescription: "Our organization is built on the fundamental belief that every child deserves the best possible start in life. We ensure that children's voices are heard and their needs are prioritized in all our programs and decisions.",
    icon: <Heart className="w-10 h-10 text-red-500" />,
    featured: true
  },
  {
    title: "Community Empowerment",
    description: "Building stronger communities through collaborative partnerships and local engagement.",
    longDescription: "We believe in the power of community-driven change. By working hand in hand with local communities, we create sustainable solutions that address the root causes of challenges facing children and families.",
    icon: <Users className="w-10 h-10 text-blue-500" />,
    featured: true
  },
  {
    title: "Excellence",
    description: "Committed to delivering outstanding results and maintaining the highest standards in everything we do.",
    icon: <Award className="w-8 h-8 text-yellow-500" />
  },
  {
    title: "Integrity",
    description: "Building trust through honest practices and transparent communication with all stakeholders.",
    icon: <Shield className="w-8 h-8 text-green-500" />
  },
  {
    title: "Innovation",
    description: "Continuously pushing boundaries and embracing new ideas to stay ahead in a dynamic environment.",
    icon: <Lightbulb className="w-8 h-8 text-purple-500" />
  },
  {
    title: "Accountability",
    description: "Taking responsibility for our actions and being transparent in our operations and decision-making.",
    icon: <Scale className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Sustainability",
    description: "Creating lasting positive change through environmentally and socially responsible practices.",
    icon: <Target className="w-8 h-8 text-green-500" />
  },
  {
    title: "Timeliness",
    description: "Responding promptly to needs and delivering solutions efficiently and effectively.",
    icon: <Clock className="w-8 h-8 text-orange-500" />
  },
  {
    title: "Quality",
    description: "Maintaining high standards in all our programs and services to ensure the best outcomes.",
    icon: <Sparkles className="w-8 h-8 text-yellow-500" />
  }
];

export default function MeritsPage() {
  return (
    <div className="min-h-screen bg-background">
      <CarouselSection />
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Our Values and Merits</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our values guide every decision we make and every action we take. They reflect our commitment
              to excellence, integrity, and the well-being of the children and communities we serve.
            </p>
          </div>
          <MeritsGrid merits={meritsData} />
        </div>
      </section>
    </div>
  );
}