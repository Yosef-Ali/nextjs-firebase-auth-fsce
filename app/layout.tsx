"use client";

import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import AuthRedirectHandler from "@/components/auth/AuthRedirectHandler";
import { useEffect, useState } from "react";
import { getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { NetworkStatus } from "@/components/NetworkStatus";

const inter = Inter({ subsets: ["latin"] });

// Remove metadata export as this is a client component.
// export const metadata: Metadata = {
//   title: 'FSCE - Foundation for Social Care and Empowerment',
//   description: 'FSCE is an Ethiopian resident charity organization working on child protection and empowerment.',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  // Add global error handler for Firestore errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || "";

      // Check if this is a Firestore 'already-exists' error
      if (
        errorMessage.includes("already-exists") ||
        errorMessage.includes("Target ID already exists")
      ) {
        console.warn(
          "Detected Firestore listener conflict. Reloading page to reset listeners."
        );

        // Prevent the error from showing in the console
        event.preventDefault();

        // Show a toast notification
        toast({
          title: "Connection Issue Detected",
          description: "Refreshing to fix the connection...",
          variant: "default",
        });

        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);

        return false;
      }
    };

    window.addEventListener("error", handleError as EventListener);

    return () => {
      window.removeEventListener("error", handleError as EventListener);
    };
  }, [toast]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <AuthRedirectHandler />
          <NetworkStatus />
        </AuthProvider>
      </body>
    </html>
  );
}
