'use client';

interface DashboardRoutesLayoutProps {
    children: React.ReactNode;
}

export default function DashboardRoutesLayout({ children }: DashboardRoutesLayoutProps) {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            {children}
        </div>
    );
}