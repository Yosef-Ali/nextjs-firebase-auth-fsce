'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { columns } from './columns';
import { useRouter } from 'next/navigation';
import { partnersService } from '@/app/services/partners';
import { useToast } from '@/hooks/use-toast';
import { Partner } from '@/app/types/partner';

export default function PartnersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const data = await partnersService.getAllPartners();
      setPartners(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    try {
      await partnersService.deletePartner(id);
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
      loadPartners(); // Reload the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title={`Partners (${partners.length})`}
            description="Manage organization partners"
          />
          <Button onClick={() => router.push('/dashboard/admin/partners/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Button>
        </div>
        <Separator />
        <DataTable
          columns={columns}
          data={partners}
          loading={loading}
          searchKey="name"
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}