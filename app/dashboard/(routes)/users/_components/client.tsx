"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { AppUser } from "@/app/types/user";

interface UsersClientProps {
  data: AppUser[];
}

export const UsersClient: React.FC<UsersClientProps> = ({ data }) => {
  return (
    <div>
      <DataTable 
        columns={columns} 
        data={data} 
        searchKey="email"
      />
    </div>
  );
};
