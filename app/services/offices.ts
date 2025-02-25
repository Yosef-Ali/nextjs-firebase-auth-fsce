import { Office } from '@/app/types/office';
import { 
  getProgramOffices, 
  getProgramOffice, 
  createProgramOffice, 
  updateProgramOffice, 
  deleteProgramOffice 
} from '@/app/lib/firebase/program-offices-service';

// Convert ProgramOffice to Office type
const mapToOffice = (programOffice: any): Office => ({
  id: programOffice.id,
  name: programOffice.location,
  location: programOffice.region,
  contact: programOffice.contact,
  email: programOffice.email,
  impact: programOffice.beneficiaries,
  impactCount: parseInt(programOffice.beneficiaries?.match(/\d+/)?.[0] || '0', 10),
  programs: programOffice.programs || [],
  active: true
});

// Convert Office to ProgramOffice type
const mapToProgramOffice = (office: Partial<Office>) => ({
  type: 'Program',
  region: office.location,
  location: office.name,
  address: '',
  contact: office.contact,
  email: office.email,
  beneficiaries: office.impact,
  programs: office.programs || []
});

class OfficesService {
  async getAllOffices(): Promise<Office[]> {
    const programOffices = await getProgramOffices();
    return programOffices.map(mapToOffice);
  }

  async getOfficeById(id: string): Promise<Office | null> {
    const programOffice = await getProgramOffice(id);
    return programOffice ? mapToOffice(programOffice) : null;
  }

  async createOffice(officeData: Omit<Office, 'id'>): Promise<Office> {
    const programOfficeData = mapToProgramOffice(officeData);
    const created = await createProgramOffice(programOfficeData);
    return mapToOffice(created);
  }

  async updateOffice(id: string, officeData: Partial<Office>): Promise<Office> {
    const programOfficeData = mapToProgramOffice(officeData);
    await updateProgramOffice(id, programOfficeData);
    const updated = await getProgramOffice(id);
    if (!updated) {
      throw new Error('Failed to retrieve updated office');
    }
    return mapToOffice(updated);
  }

  async deleteOffice(id: string): Promise<void> {
    return deleteProgramOffice(id);
  }
}

export const officesService = new OfficesService();