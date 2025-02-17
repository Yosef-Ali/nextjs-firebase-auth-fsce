'use client';

import { Suspense } from "react";
import { LoadingScreen } from "@/components/loading-screen";
import ClientLayout from "./ClientLayout";

export default function RootClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <ClientLayout>{children}</ClientLayout>
        </Suspense>
    );
}