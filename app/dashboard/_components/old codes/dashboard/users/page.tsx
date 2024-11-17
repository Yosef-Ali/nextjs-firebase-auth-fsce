import UserTable from "@/components/dashboard/UserManagement/user-table";

export default function Users() {

  return (
    <>
      <main className="grid flex-1 items-start gap-4 px-4 sm:px-6 py-24 md:gap-8">
        <UserTable />
      </main>
    </>
  )
}

