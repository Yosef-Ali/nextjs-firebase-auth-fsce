'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Building2, GraduationCap, Users, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CarouselSection from '@/components/carousel';
import Partners from '@/components/partners';

interface CityOffice {
  region: string;
  city: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

const cityOffices: CityOffice[] = [
  {
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Bole Sub-City, Woreda 03, Building No. 345",
    contact: "+251 11 551 2696",
    email: "addisababa@fsce.org",
    beneficiaries: "Supporting over 5,000 children annually",
    programs: [
      "Child Protection",
      "Education Support",
      "Family Strengthening",
      "Youth Empowerment"
    ]
  },
  {
    region: "SNNPR",
    city: "Hawassa",
    address: "Piazza Area, Behind Hawassa University",
    contact: "+251 46 220 5678",
    email: "hawassa@fsce.org",
    beneficiaries: "Serving 2,000+ families",
    programs: [
      "Youth Development",
      "Community Outreach",
      "Child Welfare",
      "Education Programs"
    ]
  }
];

export default function CityOfficesPage() {
  return (
    <>
      <CarouselSection />
      <div className="min-h-screen bg-background">
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              City Offices
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Our city offices are strategically located in Ethiopia's major urban centers,
              providing vital support and services to children and families in metropolitan areas.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="space-y-6">
                <Card className="hover:shadow-lg transition-shadow border-2 border-primary/10">
                  <CardHeader>
                    <CardTitle>Our Urban Impact</CardTitle>
                    <CardDescription>Key statistics about our city presence</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h3 className="text-3xl font-bold text-primary mb-2">2+</h3>
                        <p className="text-muted-foreground">City Offices</p>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <h3 className="text-3xl font-bold text-primary mb-2">7,000+</h3>
                        <p className="text-muted-foreground">Children & Families Supported</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-12">
              <h2 className="text-3xl font-bold text-center mb-8">Our City Presence</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cityOffices.map((office) => (
                  <motion.div
                    key={office.city}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">{office.city} Office</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-muted-foreground">{office.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Contact</p>
                          <p className="text-muted-foreground">{office.contact}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-muted-foreground">{office.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Users className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Impact</p>
                          <p className="text-muted-foreground">{office.beneficiaries}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-5 w-5 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium">Programs</p>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {office.programs.map((program, index) => (
                              <li key={index} className="text-sm">{program}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Partners />
    </>
  );
}