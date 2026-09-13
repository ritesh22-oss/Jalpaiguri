
import { Worker, BloodDonor, Doctor, Hospital, Shop, Restaurant, DurgaPandalItem } from '../types';

// Simplified type definition for a combined search result
export interface SearchResult {
  id: string;
  name: string;
  type: 'MYJPG' | 'GOOGLE';
  category: string;
  lat: number;
  lng: number;
  address?: string;
  rating?: number;
  distanceKm?: number;
  data?: any; // The original object
}

export const searchMyJpgDirectory = (
  query: string,
  data: {
    workers: Worker[];
    bloodDonors: BloodDonor[];
    doctors: Doctor[];
    hospitals: Hospital[];
    shops: Shop[];
    restaurants: Restaurant[];
  }
): SearchResult[] => {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  // Helper to add results
  const addResults = (items: any[], type: string, category: string) => {
    items.forEach(item => {
      if (item.name?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q) || category.toLowerCase().includes(q)) {
        results.push({
          id: item.id,
          name: item.name,
          type: 'MYJPG',
          category: category,
          lat: item.lat || 0,
          lng: item.lng || 0,
          data: item
        });
      }
    });
  };

  if (q.includes('worker') || q.includes('electrician') || q.includes('plumber')) addResults(data.workers, 'Worker', 'Workers');
  if (q.includes('blood') || q.includes('donor')) addResults(data.bloodDonors, 'BloodDonor', 'Blood Donors');
  if (q.includes('doctor')) addResults(data.doctors, 'Doctor', 'Doctors');
  if (q.includes('hospital')) addResults(data.hospitals, 'Hospital', 'Hospitals');
  if (q.includes('shop')) addResults(data.shops, 'Shop', 'Shops');
  if (q.includes('restaurant') || q.includes('cafe')) addResults(data.restaurants, 'Restaurant', 'Restaurants');

  return results;
};
