"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const cityOffices = [
  {
    region: "Addis Ababa",
    city: "Addis Ababa",
    address: "Bole Sub-City, Woreda 03, Building No. 345",
    contact: "+251 11 551 2696",
    beneficiaries: "Supporting over 5,000 children annually",
    programs: [
      "Child Protection",
      "Education Support",
      "Family Strengthening",
      "Youth Empowerment"
    ],
    featured: true
  },
  {
    region: "SNNPR",
    city: "Hawassa",
    address: "Piazza Area, Behind Hawassa University",
    contact: "+251 46 220 5678",
    beneficiaries: "Serving 2,000+ families",
    programs: [
      "Youth Development",
      "Community Outreach",
      "Child Welfare",
      "Education Programs"
    ]
  }
];

export default function CityOffices() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Statistics and Info */}
          <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Our Presence</CardTitle>
                <CardDescription>Key statistics about our city offices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="text-3xl font-bold text-primary mb-2">2+</h3>
                    <p className="text-sm text-muted-foreground">City Offices</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="text-3xl font-bold text-primary mb-2">7K+</h3>
                    <p className="text-sm text-muted-foreground">Children Supported</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Office Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={{
            hidden: {
              opacity: 0
            },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {cityOffices.map((office, index) => (
            <motion.div
              key={office.city}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{office.city}</CardTitle>
                  <CardDescription>{office.region}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">Address</h4>
                      <p className="text-sm text-gray-600">{office.address}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Contact</h4>
                      <p className="text-sm text-gray-600">{office.contact}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Impact</h4>
                      <p className="text-sm text-gray-600">{office.beneficiaries}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Programs</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {office.programs.map((program) => (
                          <li key={program}>{program}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
