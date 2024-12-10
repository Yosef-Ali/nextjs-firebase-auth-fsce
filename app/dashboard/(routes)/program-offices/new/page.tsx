"use client";

import ProgramOfficeForm from "@/app/dashboard/_components/program-offices/program-office-form";

export default function NewProgramOfficePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ProgramOfficeForm 
        initialData={null} 
        title="Create Program Office"
      />
    </div>
  );
}
