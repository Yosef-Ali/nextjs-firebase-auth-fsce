'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Building2, GraduationCap, Users } from 'lucide-react';
import CarouselSection from '@/components/carousel';
import Partners from '@/components/partners';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface ProgramOffice {
  id: string;
  type: 'Program';
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

export default function ProgramOfficesPage() {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const officesCollection = collection(db, 'programOffices');
        const officesSnapshot = await getDocs(officesCollection);
        const officesData = officesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ProgramOffice[];
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <CarouselSection />
      <div className="min-h-screen bg-background">
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
              Our Program Offices
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              Our offices are strategically located across Ethiopia, providing vital support 
              and services to children and families in urban and regional areas.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {offices.map((office) => (
                  <motion.div
                    key={office.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 border-2 border-primary/10"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="h-6 w-6 text-primary" />
                      <h3 className="text-xl font-semibold">{office.location} Office</h3>
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
