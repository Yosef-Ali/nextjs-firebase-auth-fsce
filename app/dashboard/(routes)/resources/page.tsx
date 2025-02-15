"use client";

import { withRoleProtection } from "@/app/lib/withRoleProtection";
import { UserRole } from "@/lib/authorization";
import { ResourcesTable } from "@/app/dashboard/_components/ResourcesTable";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { getResources } from "@/app/actions/resources-actions";
import { Resource } from "@/app/types/resource";
import { useAuthContext } from "@/lib/context/auth-context";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

function ResourcesPage() {
  const { user, userData } = useAuthContext();
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const result = await getResources();
        if (result.success && result.data) {
          setResources(result.data);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to fetch resources",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch resources",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchResources();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Loading resources...</p>
      </div>
    );
  }

  return (
    <div className="container p-6 mx-auto space-y-8 bg-transparent">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            Content Resources
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Upload, manage and organize various content resources. Categorize
            and track resources effectively.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-transparent">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <h3 className="text-lg font-semibold leading-none tracking-tight">
            Resources
          </h3>
          {user &&
            (userData?.role === "admin" ||
              userData?.role === "super_admin") && (
              <Button onClick={() => router.push("/dashboard/resources/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            )}
        </CardHeader>
        <div className="p-0">
          <ResourcesTable initialResources={resources} />
        </div>
      </Card>
    </div>
  );
}

export default withRoleProtection(ResourcesPage, UserRole.ADMIN);
