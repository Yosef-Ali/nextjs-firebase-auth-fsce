"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PartnerForm } from "../../../_components/partner-form";

interface EditFormProps {
  initialData: any;
}

export const EditForm: React.FC<EditFormProps> = ({ initialData }) => {
  const router = useRouter();

  return (
    <div className="p-6 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/dashboard/partners")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex items-center justify-between">
        <Heading
          title="Edit Partner"
          description="Update partner information"
        />
      </div>
      <Separator />
      <PartnerForm initialData={initialData} />
    </div>
  );
};
