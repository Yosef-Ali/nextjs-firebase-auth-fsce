"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { programOfficesService } from '../services/program-offices';
import { ProgramOffice, ProgramOfficeCreate, ProgramOfficeUpdate } from '@/app/types/program-office';

interface ProgramOfficesContextType {
  offices: ProgramOffice[];
  loading: boolean;
  refreshOffices: () => Promise<void>;
  addOffice: (office: ProgramOfficeCreate) => Promise<void>;
  updateOffice: (id: string, data: ProgramOfficeUpdate) => Promise<void>;
  deleteOffice: (id: string) => Promise<void>;
}

const ProgramOfficesContext = createContext<ProgramOfficesContextType | undefined>(undefined);

export function ProgramOfficesProvider({ children }: { children: ReactNode }) {
  const [offices, setOffices] = useState<ProgramOffice[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOffices = async () => {
    try {
      const allOffices = await programOfficesService.getProgramOffices();
      setOffices(allOffices);
    } catch (error) {
      console.error('Error loading program offices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addOffice = async (office: ProgramOfficeCreate) => {
    try {
      await programOfficesService.createProgramOffice(office);
      await refreshOffices();
    } catch (error) {
      console.error('Error adding program office:', error);
      throw error;
    }
  };

  const updateOffice = async (id: string, data: ProgramOfficeUpdate) => {
    try {
      await programOfficesService.updateProgramOffice(id, data);
      await refreshOffices();
    } catch (error) {
      console.error('Error updating program office:', error);
      throw error;
    }
  };

  const deleteOffice = async (id: string) => {
    try {
      await programOfficesService.deleteProgramOffice(id);
      await refreshOffices();
    } catch (error) {
      console.error('Error deleting program office:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshOffices();
  }, []);

  return (
    <ProgramOfficesContext.Provider
      value={{
        offices,
        loading,
        refreshOffices,
        addOffice,
        updateOffice,
        deleteOffice,
      }}
    >
      {children}
    </ProgramOfficesContext.Provider>
  );
}

export function useProgramOffices() {
  const context = useContext(ProgramOfficesContext);
  if (context === undefined) {
    throw new Error('useProgramOffices must be used within a ProgramOfficesProvider');
  }
  return context;
}
