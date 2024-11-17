import Aside from "@/components/dashboard/aside";
import Header from "@/components/dashboard/header";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-muted/40">
        <Aside />
        <div className="flex flex-col">
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}