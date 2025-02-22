"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

interface ProgramOffice {
  id: string;
  type: "Program";
  region: string;
  location: string;
  address: string;
  contact: string;
  email: string;
  beneficiaries: string;
  programs: string[];
}

export const ProgramOfficesManager = () => {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingOffice, setEditingOffice] = useState<ProgramOffice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [officeToDelete, setOfficeToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newOffice, setNewOffice] = useState<Omit<ProgramOffice, "id">>({
    type: "Program",
    region: "",
    location: "",
    address: "",
    contact: "",
    email: "",
    beneficiaries: "",
    programs: [],
  });

  // Fetch offices
  const fetchOffices = async () => {
    try {
      const officesCollection = collection(db, "programOffices");
      const officesSnapshot = await getDocs(officesCollection);
      const officesData = officesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProgramOffice[];
      setOffices(officesData);
    } catch (error) {
      console.error("Error fetching offices:", error);
      toast.error("Failed to load program offices");
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
      const officesCollection = collection(db, "programOffices");
      await addDoc(officesCollection, newOffice);
      toast.success("Program office added successfully");
      fetchOffices();
      setNewOffice({
        type: "Program",
        region: "",
        location: "",
        address: "",
        contact: "",
        email: "",
        beneficiaries: "",
        programs: [],
      });
    } catch (error) {
      console.error("Error adding office:", error);
      toast.error("Failed to add program office");
    }
  };

  // Update office
  const handleUpdateOffice = async (id: string) => {
    if (!editingOffice) return;

    try {
      const officeRef = doc(db, "programOffices", id);
      // Remove id from the object before updating
      const { id: _, ...updateData } = editingOffice;
      await updateDoc(officeRef, updateData);
      toast.success("Program office updated successfully");
      fetchOffices();
      setEditingId(null);
      setEditingOffice(null);
    } catch (error) {
      console.error("Error updating office:", error);
      toast.error("Failed to update program office");
    }
  };

  // Delete office
  const handleDeleteOffice = async () => {
    if (!officeToDelete) return;

    setIsDeleting(true);
    try {
      const officeRef = doc(db, "programOffices", officeToDelete);
      await deleteDoc(officeRef);
      toast.success("Program office deleted successfully");
      fetchOffices();
    } catch (error) {
      console.error("Error deleting office:", error);
      toast.error("Failed to delete program office");
    } finally {
      setIsDeleting(false);
      setOfficeToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteOffice}
        isLoading={isDeleting}
        title="Delete Program Office"
        description="Are you sure you want to delete this program office? This action cannot be undone."
      />
      <Card>
        <CardHeader>
          <CardTitle>Add New Program Office</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              placeholder="Region"
              value={newOffice.region}
              onChange={(e) =>
                setNewOffice({ ...newOffice, region: e.target.value })
              }
            />
            <Input
              placeholder="Location"
              value={newOffice.location}
              onChange={(e) =>
                setNewOffice({ ...newOffice, location: e.target.value })
              }
            />
            <Input
              placeholder="Address"
              value={newOffice.address}
              onChange={(e) =>
                setNewOffice({ ...newOffice, address: e.target.value })
              }
            />
            <Input
              placeholder="Contact"
              value={newOffice.contact}
              onChange={(e) =>
                setNewOffice({ ...newOffice, contact: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              type="email"
              value={newOffice.email}
              onChange={(e) =>
                setNewOffice({ ...newOffice, email: e.target.value })
              }
            />
            <Input
              placeholder="Beneficiaries"
              value={newOffice.beneficiaries}
              onChange={(e) =>
                setNewOffice({ ...newOffice, beneficiaries: e.target.value })
              }
            />
            <Button onClick={handleAddOffice} className="col-span-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Office
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offices.map((office) => (
          <Card key={office.id}>
            <CardContent className="pt-6">
              {editingId === office.id ? (
                <div className="space-y-4">
                  <Input
                    value={editingOffice?.region || office.region}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        region: e.target.value
                      }))
                    }
                  />
                  <Input
                    value={editingOffice?.location || office.location}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        location: e.target.value
                      }))
                    }
                  />
                  <Input
                    value={editingOffice?.address || office.address}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        address: e.target.value
                      }))
                    }
                  />
                  <Input
                    value={editingOffice?.contact || office.contact}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        contact: e.target.value
                      }))
                    }
                  />
                  <Input
                    value={editingOffice?.email || office.email}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        email: e.target.value
                      }))
                    }
                  />
                  <Input
                    value={editingOffice?.beneficiaries || office.beneficiaries}
                    onChange={(e) =>
                      setEditingOffice(prev => ({
                        ...(prev || office),
                        beneficiaries: e.target.value
                      }))
                    }
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingId(null);
                        setEditingOffice(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={() => handleUpdateOffice(office.id)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
              : (
                <div className="space-y-2">
                  <p>
                    <strong>Region:</strong> {office.region}
                  </p>
                  <p>
                    <strong>Location:</strong> {office.location}
                  </p>
                  <p>
                    <strong>Address:</strong> {office.address}
                  </p>
                  <p>
                    <strong>Contact:</strong> {office.contact}
                  </p>
                  <p>
                    <strong>Email:</strong> {office.email}
                  </p>
                  <p>
                    <strong>Beneficiaries:</strong> {office.beneficiaries}
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingId(office.id);
                        setEditingOffice(office);  // Initialize editingOffice with current office data
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setOfficeToDelete(office.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
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
};

export default ProgramOfficesManager;
