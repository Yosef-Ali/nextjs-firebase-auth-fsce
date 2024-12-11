"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, use } from "react";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PartnerForm } from "../../_components/partner-form";
import { useFirestoreDocument } from "@/app/lib/firebase/firestore-hooks";
import { Partner } from "@/app/types/partner";

// Components
const LoadingState = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const ErrorState = ({ error }: { error: Error }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <p className="text-red-500">Error: {error.message}</p>
    </div>
  </div>
);

const BackButton = () => {
  const router = useRouter();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push("/dashboard/partners")}
      className="flex items-center gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Button>
  );
};

// Main Component
export default function EditPartnerPage({ 
  params 
}: { 
  params: Promise<{ partnerId: string }> 
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [partnerDoc, loading, error] = useFirestoreDocument("partners", resolvedParams.partnerId);

  useEffect(() => {
    if (!loading && partnerDoc && typeof partnerDoc === 'object') {
      if ('exists' in partnerDoc && !partnerDoc.exists) {
        router.push("/dashboard/partners");
      }
    }
  }, [loading, partnerDoc, router]);

  if (error) {
    if (error instanceof Error) {
      console.error('Error fetching partner:', error.message);
      return <ErrorState error={error} />;
    } else {
      console.log('Operation was successful, no error to display.');
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (partnerDoc?.exists()) {
    const partnerData = partnerDoc.data();
    const partner: Partner = {
      id: partnerDoc.id,
      name: partnerData?.name || "",
      email: partnerData?.email || "",
      order: partnerData?.order || 1,
      phone: partnerData?.phone || "",
      partnerType: (partnerData?.partnerType as "partner" | "membership") || "partner",
      description: partnerData?.description || "",
      website: partnerData?.website || "",
      logo: partnerData?.logo || ""
    };

    return (
      <main className="p-6 space-y-4">
        <nav>
          <BackButton />
        </nav>
        <header className="flex items-center justify-between">
          <Heading
            title="Edit Partner"
            description="Update partner information"
          />
        </header>
        <Separator />
        <section>
          <PartnerForm 
            initialData={partner}
            partnerId={resolvedParams.partnerId} 
          />
        </section>
      </main>
    );
  } else {
    console.error("Partner document does not exist or is invalid");
  }

  return null;
}
