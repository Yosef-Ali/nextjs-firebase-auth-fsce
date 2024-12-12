"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner } from "@/types";

export const PartnersClient = () => {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "partners"), 
        orderBy("order", "asc")
      ),
      (snapshot) => {
        const partners = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            order: data.order || Number.MAX_SAFE_INTEGER, 
            partnerType: data.partnerType || "partner",   
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          } as Partner;
        });
        setPartners(partners);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <>
      <DataTable columns={columns} data={partners} />
    </>
  );
};
