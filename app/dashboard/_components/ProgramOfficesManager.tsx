"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface ProgramOffice {
  id: string;
  type: 'Program';
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

export default function ProgramOfficesManager() {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newOffice, setNewOffice] = useState<Omit<ProgramOffice, 'id'>>({
    type: 'Program',
    region: '',
    location: '',
    address: '',
    contact: '',
    email: '',
    beneficiaries: '',
    programs: []
  });

  // Fetch offices
  const fetchOffices = async () => {
    try {
      const officesCollection = collection(db, 'programOffices');
      const officesSnapshot = await getDocs(officesCollection);
      const officesData = officesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProgramOffice[];
      setOffices(officesData);
    } catch (error) {
      console.error('Error fetching offices:', error);
      toast.error('Failed to load program offices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffices();
  }, []);

  // Add new office
  const handleAddOffice = async () => {
    try {
      const officesCollection = collection(db, 'programOffices');
      await addDoc(officesCollection, newOffice);
      toast.success('Program office added successfully');
      fetchOffices();
      setNewOffice({
        type: 'Program',
        region: '',
        location: '',
        address: '',
        contact: '',
        email: '',
        beneficiaries: '',
        programs: []
      });
    } catch (error) {
      console.error('Error adding office:', error);
      toast.error('Failed to add program office');
    }
  };

  // Update office
  const handleUpdateOffice = async (id: string, updatedData: Partial<ProgramOffice>) => {
    try {
      const officeRef = doc(db, 'programOffices', id);
      await updateDoc(officeRef, updatedData);
      toast.success('Program office updated successfully');
      fetchOffices();
      setEditingId(null);
    } catch (error) {
      console.error('Error updating office:', error);
      toast.error('Failed to update program office');
    }
  };

  // Delete office
  const handleDeleteOffice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this office?')) {
      try {
        const officeRef = doc(db, 'programOffices', id);
        await deleteDoc(officeRef);
        toast.success('Program office deleted successfully');
        fetchOffices();
      } catch (error) {
        console.error('Error deleting office:', error);
        toast.error('Failed to delete program office');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Program Office</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Region"
              value={newOffice.region}
              onChange={(e) => setNewOffice({ ...newOffice, region: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={newOffice.location}
              onChange={(e) => setNewOffice({ ...newOffice, location: e.target.value })}
            />
            <Input
              placeholder="Address"
              value={newOffice.address}
              onChange={(e) => setNewOffice({ ...newOffice, address: e.target.value })}
            />
            <Input
              placeholder="Contact"
              value={newOffice.contact}
              onChange={(e) => setNewOffice({ ...newOffice, contact: e.target.value })}
            />
            <Input
              placeholder="Email"
              type="email"
              value={newOffice.email}
              onChange={(e) => setNewOffice({ ...newOffice, email: e.target.value })}
            />
            <Input
              placeholder="Beneficiaries"
              value={newOffice.beneficiaries}
              onChange={(e) => setNewOffice({ ...newOffice, beneficiaries: e.target.value })}
            />
            <Textarea
              placeholder="Programs (one per line)"
              value={newOffice.programs.join('\n')}
              onChange={(e) => setNewOffice({ ...newOffice, programs: e.target.value.split('\n').filter(p => p.trim()) })}
              className="col-span-2"
            />
          </div>
          <Button onClick={handleAddOffice} className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add Office
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {offices.map((office, index) => (
          <Card key={office.id || index}>
            <CardContent className="pt-6">
              {editingId === office.id ? (
                <div className="space-y-4">
                  <Input
                    defaultValue={office.region}
                    onChange={(e) => handleUpdateOffice(office.id, { region: e.target.value })}
                    placeholder="Region"
                  />
                  <Input
                    defaultValue={office.location}
                    onChange={(e) => handleUpdateOffice(office.id, { location: e.target.value })}
                    placeholder="Location"
                  />
                  <Input
                    defaultValue={office.address}
                    onChange={(e) => handleUpdateOffice(office.id, { address: e.target.value })}
                    placeholder="Address"
                  />
                  <Input
                    defaultValue={office.contact}
                    onChange={(e) => handleUpdateOffice(office.id, { contact: e.target.value })}
                    placeholder="Contact"
                  />
                  <Input
                    defaultValue={office.email}
                    onChange={(e) => handleUpdateOffice(office.id, { email: e.target.value })}
                    placeholder="Email"
                  />
                  <Input
                    defaultValue={office.beneficiaries}
                    onChange={(e) => handleUpdateOffice(office.id, { beneficiaries: e.target.value })}
                    placeholder="Beneficiaries"
                  />
                  <Textarea
                    defaultValue={office.programs.join('\n')}
                    onChange={(e) => handleUpdateOffice(office.id, { programs: e.target.value.split('\n').filter(p => p.trim()) })}
                    placeholder="Programs (one per line)"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingId(null)} variant="outline">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={() => handleUpdateOffice(office.id, office)}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="font-semibold">{office.location}</h3>
                  <p className="text-sm text-muted-foreground">Region: {office.region}</p>
                  <p className="text-sm text-muted-foreground">Address: {office.address}</p>
                  <p className="text-sm text-muted-foreground">Contact: {office.contact}</p>
                  <p className="text-sm text-muted-foreground">Email: {office.email}</p>
                  <p className="text-sm text-muted-foreground">Beneficiaries: {office.beneficiaries}</p>
                  <div>
                    <p className="text-sm font-medium">Programs:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {office.programs.map((program, index) => (
                        <li key={index}>{program}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => setEditingId(office.id)} variant="outline" size="sm">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={() => handleDeleteOffice(office.id)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
