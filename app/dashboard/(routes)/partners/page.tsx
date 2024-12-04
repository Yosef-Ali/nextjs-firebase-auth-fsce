"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { PartnersClient } from "./_components/client";
import { useRouter } from "next/navigation";

const PartnersPage = () => {
  const router = useRouter();

  const onCreate = () => {
    router.push("/dashboard/partners/new");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Users className="h-8 w-8 text-primary" />
          <Heading
            title="Partners Management"
            description="Manage your organization's partners and memberships"
          />
        </div>
        <Button onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Partner
        </Button>
      </div>
      <PartnersClient />
    </div>
  );
};

export default PartnersPage;