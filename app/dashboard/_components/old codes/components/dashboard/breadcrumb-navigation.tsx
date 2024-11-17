import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export const BreadcrumbNavigation = () => {
  const params = useParams()
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/blogs">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard/blogs">Blogs</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{params.slug ? `${params.slug}` : 'Add Post'}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
