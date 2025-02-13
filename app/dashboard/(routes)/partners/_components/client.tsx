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
            ...data,
            order: data.order || Number.MAX_SAFE_INTEGER,
            partnerType: data.partnerType || "partner",
            createdAt: data.createdAt?.toDate(),
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
