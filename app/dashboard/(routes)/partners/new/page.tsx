"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PartnerForm } from "../_components/partner-form";

const NewPartnerPage = () => {
  const router = useRouter();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Heading
            title="Create Partner"
            description="Add a new partner to your organization"
          />
        </div>
      </div>
      <Separator />
      <PartnerForm />
    </div>
  );
};

export default NewPartnerPage;
