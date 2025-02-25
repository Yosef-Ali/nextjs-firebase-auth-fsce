// app/services/offices.ts

import { Office } from '@/app/types/office';

// Mock data based on your image
const officesMockData: Office[] = [
  {
    id: '1',
    name: 'Addis Ababa Office',
    location: 'Bole Sub City, Woreda 03, Addis Ababa',
    contact: '+251 116 393 229',
    email: 'info.addis@example.org',
    impact: 'Serving over 5,000 children and families',
    impactCount: 5000,
    programs: [
      'Early Childhood Education',
      'Youth Empowerment',
      'Family Support Services',
      'Community Development'
    ],
    active: true
  },
  {
    id: '2',
    name: 'Bahir Dar Office',
    location: 'Belay Zeleke Kebele, Bahir Dar',
    contact: '+251 582 206 795',
    email: 'info.bahirdar@example.org',
    impact: 'Supporting 3,000+ vulnerable children',
    impactCount: 3000,
    programs: [
      'Child Protection',
      'Education Access',
      'Health & Nutrition',
      'Vocational Training'
    ],
    active: true
  },
  {
    id: '3',
    name: 'Hawassa Office',
    location: 'Tabor Sub City, Hawassa',
    contact: '+251 462 208 091',
    email: 'info.hawassa@example.org',
    impact: 'Reaching 4,000+ children and youth',
    impactCount: 4000,
    programs: [
      'Educational Support',
      'Child Sponsorship',
      'Community Outreach',
      'Youth Development'
    ],
    active: true
  },
  {
    id: '4',
    name: 'Mekelle Office',
    location: 'Hadnet Sub City, Mekelle',
    contact: '+251 344 409 284',
    email: 'info.mekelle@example.org',
    impact: 'Assisting 2,500+ families and children',
    impactCount: 2500,
    programs: [
      'Emergency Response',
      'Child Education',
      'Family Strengthening',
      'Community Resilience'
    ],
    active: true
  }
];

class OfficesService {
  async getAllOffices(): Promise<Office[]> {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(officesMockData);
      }, 500);
    });
  }

  async getOfficeById(id: string): Promise<Office | undefined> {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const office = officesMockData.find(office => office.id === id);
        resolve(office);
      }, 300);
    });
  }

  async createOffice(officeData: Omit<Office, 'id'>): Promise<Office> {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOffice = {
          ...officeData,
          id: Math.random().toString(36).substring(2, 9)
        };
        resolve(newOffice);
      }, 500);
    });
  }

  async updateOffice(id: string, officeData: Partial<Office>): Promise<Office> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const officeIndex = officesMockData.findIndex(office => office.id === id);
        if (officeIndex === -1) {
          reject(new Error('Office not found'));
          return;
        }

        const updatedOffice = {
          ...officesMockData[officeIndex],
          ...officeData
        };

        resolve(updatedOffice);
      }, 500);
    });
  }

  async deleteOffice(id: string): Promise<void> {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const officeIndex = officesMockData.findIndex(office => office.id === id);
        if (officeIndex === -1) {
          reject(new Error('Office not found'));
          return;
        }

        resolve();
      }, 500);
    });
  }
}

export const officesService = new OfficesService();