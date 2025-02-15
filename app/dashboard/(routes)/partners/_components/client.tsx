"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Partner } from "@/types";
import { Button } from "@/components/ui/button";

export const PartnersClient = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "partners"), orderBy("order", "asc")),
      (snapshot) => {
        try {
          const partners = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "",
              email: data.email || "",
              phone: data.phone || "",
              logo: data.logo || "",
              website: data.website || "",
              order: data.order || 1,
              partnerType: data.partnerType || "membership",
              description: data.description || "",
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as Partner;
          });
          setPartners(partners);
          setError(null);
        } catch (err) {
          console.error("Error processing partners data:", err);
          setError("Failed to load partners data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching partners:", err);
        setError("Failed to connect to the database. Please check your connection.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-48 p-4">
        <p className="mb-4 text-destructive">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center w-full h-48">
          <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary" />
        </div>
      ) : (
        <div className="p-0">
          <DataTable
            columns={columns}
            data={partners}
          />
        </div>
      )}
    </>
  );
};
