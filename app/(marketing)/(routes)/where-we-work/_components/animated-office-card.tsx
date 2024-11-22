"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OfficeCardProps {
  office: {
    region: string;
    city: string;
    address: string;
    contact: string;
    beneficiaries: string;
    programs: string[];
  };
}

export function AnimatedOfficeCard({ office }: OfficeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
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
  );
}
