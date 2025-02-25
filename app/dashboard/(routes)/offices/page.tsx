"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { programOfficesService } from "@/app/services/program-offices";
import OfficesContent from "./_components/offices-content";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgramOffice } from "@/app/types/program-office";
import { toast } from "@/hooks/use-toast";
import { OfficeEditor } from "@/app/dashboard/_components/OfficeEditor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OfficesPage() {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<ProgramOffice | undefined>();

  const fetchOffices = async () => {
    try {
      setIsLoading(true);
      const fetchedOffices = await programOfficesService.getAllProgramOffices();
      setOffices(fetchedOffices || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch offices. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  const handleCreate = () => {
    setSelectedOffice(undefined);
    setIsEditorOpen(true);
  };

  const handleEdit = (office: ProgramOffice) => {
    setSelectedOffice(office);
    setIsEditorOpen(true);
  };

  const handleDelete = async (office: ProgramOffice) => {
    try {
      await programOfficesService.deleteProgramOffice(office.id);
      toast({
        title: "Success",
        description: "Office deleted successfully",
      });
      fetchOffices();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete office",
        variant: "destructive",
      });
    }
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedOffice(undefined);
  };

  const handleSaved = () => {
    handleEditorClose();
    fetchOffices();
  };

  // Calculate office stats
  const totalOffices = offices.length;
  const activePrograms = offices.reduce((total, office) => total + office.programs.length, 0);
  const beneficiariesCount = offices.reduce((total, office) => total + (parseInt(office.beneficiaries) || 0), 0);
  const regions = new Set(offices.map(office => office.region)).size;

  if (isLoading) {
    return (
      <div className="container py-10 mx-auto">
        <div className="space-y-4">
          <Skeleton className="h-8 w-[200px]" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
            <Skeleton className="h-[120px]" />
          </div>
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Where We Work</h1>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Office
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="text-2xl font-bold">{totalOffices}</div>
            <p className="text-xs text-muted-foreground">Total Offices</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{regions}</div>
            <p className="text-xs text-muted-foreground">Regions</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{beneficiariesCount.toLocaleString()}+</div>
            <p className="text-xs text-muted-foreground">Total Beneficiaries</p>
          </Card>
          <Card className="p-6">
            <div className="text-2xl font-bold">{activePrograms}</div>
            <p className="text-xs text-muted-foreground">Active Programs</p>
          </Card>
        </div>

        {/* Offices Table */}
        <Card>
          <OfficesContent
            initialOffices={offices}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Card>

        <Dialog
          open={isEditorOpen}
          onOpenChange={(open) => {
            if (!open) {
              handleEditorClose();
            }
            setIsEditorOpen(open);
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedOffice ? "Edit Office" : "Create New Office"}
              </DialogTitle>
            </DialogHeader>
            <OfficeEditor
              office={selectedOffice}
              mode={selectedOffice ? "edit" : "create"}
              onSuccess={handleSaved}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
