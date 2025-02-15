"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PartnersClient } from "./_components/client";
import { useRouter } from "next/navigation";

const PartnersPage = () => {
  const router = useRouter();

  const onCreate = () => {
    router.push("/dashboard/partners/new");
  };

  return (
    <div className="container p-6 mx-auto space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Partners Management
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage your organization's partners and memberships. Add, update,
            and track partner relationships.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Partners
          </h3>
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Partner
          </Button>
        </CardHeader>
        <div className="p-0">
          <PartnersClient />
        </div>
      </Card>
    </div>
  );
};

export default PartnersPage;
