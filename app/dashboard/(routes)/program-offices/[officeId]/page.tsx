"use client";

import { useEffect, useState } from "react";
import ProgramOfficeForm from "@/app/dashboard/_components/program-offices/program-office-form";
import { programOfficesService } from "@/app/services/program-offices";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { PageProps } from "next";

interface Params {
  officeId: string;
}

export default function ProgramOfficePage({ params }: PageProps<{ params: Params }>): PageProps<{ params: Params }> {
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<any>(null);

  useEffect(() => {
    const loadOffice = async () => {
      setLoading(true);
      try {
        const data = await programOfficesService.getProgramOffice(params.officeId);
        setOffice(data);
      } catch (error) {
        console.error('Error loading program office:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffice();
  }, [params.officeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProgramOfficeForm
        initialData={office}
        title="Edit Program Office"
      />
    </div>
  );
}
