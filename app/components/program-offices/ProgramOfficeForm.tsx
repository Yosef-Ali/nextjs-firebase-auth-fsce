import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProgramOffice, ProgramOfficeCreate } from '@/app/types/program-office';

interface ProgramOfficeFormProps {
  initialData?: ProgramOffice;
  onSubmit: (data: ProgramOfficeCreate) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ProgramOfficeForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}: ProgramOfficeFormProps) {
  const [formData, setFormData] = useState<ProgramOfficeCreate>({
    type: 'Program',
    region: initialData?.region || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    contact: initialData?.contact || '',
    email: initialData?.email || '',
    beneficiaries: initialData?.beneficiaries || '',
    programs: initialData?.programs || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Region</label>
        <Input
          value={formData.region}
          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Contact</label>
        <Input
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Beneficiaries</label>
        <Input
          value={formData.beneficiaries}
          onChange={(e) => setFormData({ ...formData, beneficiaries: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Programs</label>
        <Textarea
          value={formData.programs.join('\n')}
          onChange={(e) => setFormData({ ...formData, programs: e.target.value.split('\n').filter(p => p.trim()) })}
          placeholder="Enter programs (one per line)"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Program Office
        </Button>
      </div>
    </form>
  );
}
