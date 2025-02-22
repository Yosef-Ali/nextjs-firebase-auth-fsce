'use client';

import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    );
}