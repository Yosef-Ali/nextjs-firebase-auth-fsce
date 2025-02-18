"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner } from "@/types";
import { Separator } from "@/components/ui/separator";

export const PartnersClient = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "partners"), orderBy("order", "asc")),
      (snapshot) => {
        const partners = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            logo: data.logo,
            website: data.website,
            order: data.order || 1,
            partnerType: data.partnerType || "membership",
            description: data.description,
            position: data.position || "",
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Partner;
        });
        setPartners(partners);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Separator />
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-24">
          <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={partners}
          searchKey="name"
        />
      )}
    </>
  );
};
