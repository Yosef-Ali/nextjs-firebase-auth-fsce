'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { ProgramOfficesManager } from '@/app/dashboard/_components/ProgramOfficesManager';
// Or if using default export:
// import ProgramOfficesManager from '@/app/dashboard/_components/ProgramOfficesManager';

export default function ProgramOfficesPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Program Offices"
            description="Manage program offices and locations"
          />
        </div>
        <Separator />
        <ProgramOfficesManager />
      </div>
    </div>
  );
}
