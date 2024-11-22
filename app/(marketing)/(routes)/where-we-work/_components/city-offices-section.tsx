import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedOfficeCard } from './animated-office-card';

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
    ]
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

export default function CityOfficesSection() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            City Offices
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Our city offices are at the heart of Ethiopia's urban centers, providing crucial
            support and services to children and families in metropolitan areas.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>Our Presence</CardTitle>
                  <CardDescription>Key statistics about our city offices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-primary/5">
                      <h3 className="text-3xl font-bold text-primary mb-2">3+</h3>
                      <p className="text-muted-foreground">City Offices</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5">
                      <h3 className="text-3xl font-bold text-primary mb-2">9,500+</h3>
                      <p className="text-muted-foreground">Children Supported</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8">Our Office Locations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityOffices.map((office) => (
                <AnimatedOfficeCard key={office.city} office={office} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
