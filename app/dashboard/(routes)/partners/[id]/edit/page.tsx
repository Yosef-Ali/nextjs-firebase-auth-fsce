"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, getDocFromServer } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner, PartnerType } from "@/app/types/partner";
import { PartnerForm } from "../../_components/partner-form";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function EditPartnerPage() {
  const params = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Safe access to params
        let id = params?.id;
        
        // Handle array case
        if (Array.isArray(id)) {
            id = id[0];
        }

        if (!id || typeof id !== 'string') {
          console.warn("Invalid partner ID:", id);
          setError("Invalid partner ID provided via URL.");
          return;
        }

        console.log("Loading partner with ID:", id);
        const docRef = doc(db, "partners", id);
        
        let docSnap;
        try {
          // Try to get fresh data from server first
          docSnap = await getDocFromServer(docRef);
        } catch (serverError: any) {
          // If server fetch fails (offline), try cached data
          console.warn("Server fetch failed, trying cache:", serverError?.message);
          docSnap = await getDoc(docRef);
        }

        if (docSnap.exists()) {
          console.log("Partner loaded:", docSnap.data());
          setPartner({
            id: docSnap.id,
            ...docSnap.data(),
          } as Partner);
        } else {
          console.warn("Partner document not found for ID:", id);
          setError(`Partner not found with ID: ${id}`);
          toast({
            title: "Error",
            description: "Partner not found",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        console.warn("Error loading partner:", err);
        const errorMessage = err?.message || "Unknown error occurred";
        setError(`Failed to load partner: ${errorMessage}`);
        
        toast({
          title: "Error",
          description: "Failed to load partner. Check console for details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [params?.id, router]);

  if (loading) {
    return (
      <div className="flex-col">
        <div className="flex-1 p-8 pt-6 space-y-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-[500px] w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="flex-col">
          <div className="flex-1 p-8 pt-6 space-y-4">
            <div className="flex items-center gap-x-4">
                <Button
                onClick={() => router.push("/dashboard/partners")}
                variant="ghost"
                size="sm"
                >
                <ArrowLeft className="w-4 h-4" />
                Back to Partners
                </Button>
            </div>
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-semibold">Error Loading Partner</h3>
                <p>{error}</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Button
              onClick={() => router.push("/dashboard/partners")}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Heading
              title="Edit Partner"
              description="Edit partner information"
            />
          </div>
        </div>
        <Separator />
        {partner && (
          <PartnerForm
            initialData={{
              id: partner.id,
              name: partner.name,
              position: partner.position,
              email: partner.email,
              phone: partner.phone,
              website: partner.website,
              description: partner.description,
              logo: partner.logo,
              order: partner.order,
              partnerType: partner.partnerType as PartnerType
            }}
            partnerId={partner.id}
            onSuccess={() => router.push("/dashboard/partners")}
          />
        )}
      </div>
    </div>
  );
}







