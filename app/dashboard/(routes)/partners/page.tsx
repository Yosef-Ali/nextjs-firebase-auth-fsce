'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Partner } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "partners"), orderBy("order", "asc")),
      (snapshot) => {
        const partners = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            logo: data.logo,
            website: data.website,
            order: data.order || 1,
            partnerType: data.partnerType || "REGULAR",
            description: data.description || "",
          };
        });
        setPartners(partners);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Calculate stats
  const totalPartners = partners.length;
  const premiumPartners = partners.filter(partner => partner.partnerType === 'PREMIUM').length;
  const regularPartners = partners.filter(partner => partner.partnerType === 'REGULAR').length;

  return (
    <div className="container mx-auto py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Partners</h1>
          <Button onClick={() => window.location.href = '/dashboard/partners/new'}>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalPartners}</div>
            <p className="text-xs text-muted-foreground">Total Partners</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{premiumPartners}</div>
            <p className="text-xs text-muted-foreground">Premium Partners</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{regularPartners}</div>
            <p className="text-xs text-muted-foreground">Regular Partners</p>
          </Card>
        </div>

        {/* Partners Table */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={partners}
            searchKey="name"
          />
        )}
      </div>
    </div>
  );
}
