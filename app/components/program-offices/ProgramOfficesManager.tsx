'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgramOffice } from '@/app/types/program-office';
import { programOfficesService } from '@/app/services/program-offices';
import { toast } from 'sonner';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { ProgramOfficeForm } from './ProgramOfficeForm';
import { Loader2 } from 'lucide-react';

export function ProgramOfficesManager() {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOffice, setSelectedOffice] = useState<ProgramOffice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchOffices();
  }, []);

  const fetchOffices = async () => {
    try {
      const data = await programOfficesService.getProgramOffices();
      setOffices(data.sort((a: ProgramOffice, b: ProgramOffice) => 
        a.location.localeCompare(b.location)
      ));
    } catch (error) {
      toast.error('Failed to fetch program offices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await programOfficesService.deleteProgramOffice(id);
      setOffices(offices.filter(office => office.id !== id));
      toast.success('Program office deleted successfully');
    } catch (error) {
      toast.error('Failed to delete program office');
    }
  };

  const handleCreate = async (data: ProgramOfficeCreate) => {
    setIsSubmitting(true);
    try {
      await programOfficesService.createProgramOffice(data);
      toast.success('Program office created successfully');
      await fetchOffices();
      handleCancel();
    } catch (error) {
      toast.error('Failed to create program office');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: Partial<ProgramOffice>) => {
    if (!selectedOffice?.id) return;
    
    setIsSubmitting(true);
    try {
      await programOfficesService.updateProgramOffice(selectedOffice.id, data);
      toast.success('Program office updated successfully');
      await fetchOffices();
      handleCancel();
    } catch (error) {
      toast.error('Failed to update program office');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedOffice(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{selectedOffice ? 'Edit' : 'Create'} Program Office</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramOfficeForm
            initialData={selectedOffice || undefined}
            onSubmit={selectedOffice ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Program Offices</h2>
        <Button 
          onClick={() => setIsEditing(true)}
          disabled={isSubmitting}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Office
        </Button>
      </div>

      {offices.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No program offices found. Click "Add Office" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => (
            <Card key={office.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{office.location}</h3>
                    <p className="text-sm text-gray-500">{office.region}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isSubmitting}
                      onClick={() => {
                        setSelectedOffice(office);
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isSubmitting}
                      onClick={() => handleDelete(office.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">{office.address}</p>
                  <p className="text-sm">{office.contact}</p>
                  <p className="text-sm">{office.email}</p>
                  <p className="text-sm">{office.beneficiaries}</p>
                  {office.programs?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Programs:</p>
                      <ul className="text-sm list-disc list-inside">
                        {office.programs.map((program, index) => (
                          <li key={index}>{program}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
