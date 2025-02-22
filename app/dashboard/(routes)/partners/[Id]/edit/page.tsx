"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner } from "@/app/types/partner";
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

  useEffect(() => {
    const loadPartner = async () => {
      try {
        if (!params?.id) return;

        const docRef = doc(db, "partners", params.id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPartner({
            id: docSnap.id,
            ...docSnap.data(),
          } as Partner);
        } else {
          toast({
            title: "Error",
            description: "Partner not found",
            variant: "destructive",
          });
          router.push("/dashboard/partners");
        }
      } catch (error) {
        console.error("Error loading partner:", error);
        toast({
          title: "Error",
          description: "Failed to load partner",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPartner();
  }, [params?.id, router]);

  const convertPartnerType = (type: string) => {
    return type === 'partner' ? 'strategic' : type as 'strategic' | 'membership';
  };

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
              email: partner.email,
              phone: partner.phone,
              website: partner.website,
              description: partner.description,
              logo: partner.logo,
              order: partner.order,
              partnerType: convertPartnerType(partner.partnerType)
            }}
            partnerId={partner.id}
            onSuccess={() => router.push("/dashboard/partners")}
          />
        )}
      </div>
    </div>
  );
}







