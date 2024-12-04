"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, use } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PartnerForm } from "../../_components/partner-form";
import { useFirestoreDocument } from "@/app/lib/firebase/firestore-hooks";

export default function EditPartnerPage({ 
  params 
}: { 
  params: Promise<{ partnerId: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [partnerDoc, loading, error] = useFirestoreDocument("partners", resolvedParams.partnerId);

  useEffect(() => {
    if (!loading && partnerDoc && !partnerDoc.exists()) {
      router.push("/dashboard/partners");
    }
  }, [loading, partnerDoc, router]);

  if (error) {
    console.error("Error fetching partner:", error);
    return <div>Error loading partner</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!partnerDoc?.exists()) {
    return null;
  }

  const partner = partnerDoc?.exists() ? {
    id: partnerDoc.id,
    name: partnerDoc.data().name,
    email: partnerDoc.data().email,
    order: partnerDoc.data().order,
    phone: partnerDoc.data().phone,
    partnerType: partnerDoc.data().partnerType,
    description: partnerDoc.data().description,
    website: partnerDoc.data().website,
    logoUrl: partnerDoc.data().logo,
  } : null;

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
      {partner && <PartnerForm initialData={partner} />}
    </div>
  );
}
