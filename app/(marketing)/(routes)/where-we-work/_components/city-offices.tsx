"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProgramOffice {
  region: string;
  city: string;
  location: string;
  address: string;
  contact: string;
  beneficiaries: string;
  programs: string[];
}

export default function CityOffices() {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const officesCollection = collection(db, 'programOffices');
        const officesSnapshot = await getDocs(officesCollection);
        const officesData = officesSnapshot.docs
          .map(doc => ({
            ...doc.data()
          }))
          .filter(office => office.type === 'Early Childhood Education') as ProgramOffice[];
        setOffices(officesData);
      } catch (error) {
        console.error('Error fetching offices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
                    <h3 className="text-3xl font-bold text-primary mb-2">{offices.length}+</h3>
                    <p className="text-sm text-muted-foreground">City Offices</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <h3 className="text-3xl font-bold text-primary mb-2">15K+</h3>
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
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {offices.map((office, index) => (
            <motion.div
              key={office.location}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">{office.location}</CardTitle>
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
                        {office.programs.map((program, index) => (
                          <li key={`${office.location}-${program}-${index}`}>{program}</li>
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
