"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { PartnerForm } from "../_components/partner-form";
import { db } from "@/lib/firebase";

export default function PartnerPage({ params }: { params: { partnerId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<any>(null);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const docRef = doc(db, "partners", params.partnerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPartner({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          router.push("/dashboard/partners");
        }
      } catch (error) {
        console.error("Error fetching partner:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [params.partnerId, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

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
      <PartnerForm initialData={partner} />
    </div>
  );
}
