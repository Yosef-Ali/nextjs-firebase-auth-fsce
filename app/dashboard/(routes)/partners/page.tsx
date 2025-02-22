'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './_components/columns';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Partner } from '@/app/types/partner';
import { Skeleton } from '@/components/ui/skeleton';
import { partnersService } from '@/app/services/partners';

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const partnersData = await partnersService.getPartners();
        setPartners(partnersData);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Update partner type checks to match the Partner interface
  const totalPartners = partners.length;
  const partnerTypePartners = partners.filter(partner => partner.partnerType === 'partner').length;
  const membershipPartners = partners.filter(partner => partner.partnerType === 'membership').length;

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
            <div className="text-2xl font-bold">{partnerTypePartners}</div>
            <p className="text-xs text-muted-foreground">Partner Organizations</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{membershipPartners}</div>
            <p className="text-xs text-muted-foreground">Membership Partners</p>
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
