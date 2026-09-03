export interface LocalityInfo {
  id: string;
  name: string;
  shortName: string;
  pincode: string;
  lat: number;
  lng: number;
  popularLandmarks: string[];
  type: 'commercial' | 'residential' | 'healthcare' | 'transport' | 'civic';
}

export const JALPAIGURI_DEFAULT_LOCATION = {
  name: 'Jalpaiguri, West Bengal',
  locality: 'Kadamtala',
  lat: 26.5228,
  lng: 88.7245,
  isApproximate: true
};

export const JALPAIGURI_LOCALITIES: LocalityInfo[] = [
  {
    id: 'kadamtala',
    name: 'Kadamtala',
    shortName: 'Kadamtala',
    pincode: '735101',
    lat: 26.5228,
    lng: 88.7245,
    popularLandmarks: ['Kadamtala More', 'Municipality Complex', 'Rail Crossing'],
    type: 'commercial'
  },
  {
    id: 'dinbazar',
    name: 'Dinbazar Wholesale Market',
    shortName: 'Dinbazar',
    pincode: '735101',
    lat: 26.5186,
    lng: 88.7291,
    popularLandmarks: ['Dinbazar Wholesale Market', 'Subzi Mandi', 'Cloth Market'],
    type: 'commercial'
  },
  {
    id: 'silpasamiti',
    name: 'Silpasamiti Para',
    shortName: 'Silpasamiti Para',
    pincode: '735101',
    lat: 26.5292,
    lng: 88.7180,
    popularLandmarks: ['Silpasamiti Ground', 'Club Road', 'Community Hall'],
    type: 'residential'
  },
  {
    id: 'hakimpara',
    name: 'Hakimpara',
    shortName: 'Hakimpara',
    pincode: '735101',
    lat: 26.5245,
    lng: 88.7212,
    popularLandmarks: ['Hakimpara Girls High School', 'Court More'],
    type: 'residential'
  },
  {
    id: 'sadar-hospital',
    name: 'Sadar Hospital & Post Office More',
    shortName: 'Hospital Road',
    pincode: '735101',
    lat: 26.5202,
    lng: 88.7258,
    popularLandmarks: ['District Sadar Hospital', 'Super Speciality Hospital', 'Head Post Office'],
    type: 'healthcare'
  },
  {
    id: 'paharpur',
    name: 'Paharpur More',
    shortName: 'Paharpur',
    pincode: '735121',
    lat: 26.5385,
    lng: 88.7360,
    popularLandmarks: ['Paharpur Bus Stand', 'Tea Auction Centre Road'],
    type: 'commercial'
  },
  {
    id: 'mohitnagar',
    name: 'Mohitnagar',
    shortName: 'Mohitnagar',
    pincode: '735102',
    lat: 26.5410,
    lng: 88.7450,
    popularLandmarks: ['Mohitnagar Substation', 'Agricultural Research Station'],
    type: 'residential'
  },
  {
    id: 'pandapara',
    name: 'Pandapara',
    shortName: 'Pandapara',
    pincode: '735101',
    lat: 26.5150,
    lng: 88.7190,
    popularLandmarks: ['Pandapara Kali Mandir', 'Primary School'],
    type: 'residential'
  },
  {
    id: 'maskalaibari',
    name: 'Maskalaibari',
    shortName: 'Maskalaibari',
    pincode: '735101',
    lat: 26.5110,
    lng: 88.7250,
    popularLandmarks: ['Maskalaibari Shibtala', 'Sports Ground'],
    type: 'residential'
  },
  {
    id: 'raikatpara',
    name: 'Raikatpara (Rajbari)',
    shortName: 'Raikatpara',
    pincode: '735101',
    lat: 26.5280,
    lng: 88.7265,
    popularLandmarks: ['Baikunthapur Rajbari', 'Rajbari Dighi', 'Heritage Gate'],
    type: 'civic'
  },
  {
    id: 'town-club',
    name: 'Town Club & Jubilee Park',
    shortName: 'Town Club',
    pincode: '735101',
    lat: 26.5210,
    lng: 88.7210,
    popularLandmarks: ['Town Club Stadium', 'Jubilee Park Promenade'],
    type: 'civic'
  },
  {
    id: 'nh31-desun',
    name: 'NH31 Bypass / Desun Hospital Area',
    shortName: 'NH31 Bypass',
    pincode: '735101',
    lat: 26.5370,
    lng: 88.7150,
    popularLandmarks: ['Desun Hospital', 'Highway Fuel Hub', 'Transport Nagar'],
    type: 'healthcare'
  },
  {
    id: 'adarpara',
    name: 'Adarpara',
    shortName: 'Adarpara',
    pincode: '735101',
    lat: 26.5320,
    lng: 88.7390,
    popularLandmarks: ['Adarpara High School', 'Karala River Ghat'],
    type: 'residential'
  },
  {
    id: 'town-station',
    name: 'Jalpaiguri Town Railway Station',
    shortName: 'Town Station',
    pincode: '735101',
    lat: 26.5050,
    lng: 88.7320,
    popularLandmarks: ['Town Railway Station', 'Railway Colony', 'Auto Stand'],
    type: 'transport'
  }
];

// Haversine distance calculator in kilometers
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistanceString(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

export const JALPAIGURI_SERVICE_REGION = {
  name: 'Jalpaiguri Civic & Municipal Region',
  city: 'Jalpaiguri',
  district: 'Jalpaiguri',
  state: 'West Bengal',
  country: 'India',
  lat: 26.5414,
  lng: 88.7196,
  radiusKm: 35
};

export function isWithinJalpaiguriRegion(lat: number, lng: number): boolean {
  return calculateHaversineDistance(lat, lng, JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng) <= JALPAIGURI_SERVICE_REGION.radiusKm;
}

// Find closest locality name in Jalpaiguri (only valid if within the Jalpaiguri service region)
export function getClosestLocalityName(lat: number, lng: number): { locality: string; fullName: string; distanceKm: number; isWithinRegion: boolean } {
  let closest = JALPAIGURI_LOCALITIES[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.lat, closest.lng);

  for (const loc of JALPAIGURI_LOCALITIES) {
    const dist = calculateHaversineDistance(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  const isWithin = minDistance <= JALPAIGURI_SERVICE_REGION.radiusKm;

  return {
    locality: isWithin ? closest.shortName : 'Outside Jalpaiguri',
    fullName: isWithin ? `${closest.name}, Jalpaiguri` : 'Outside Jalpaiguri Service Area',
    distanceKm: minDistance,
    isWithinRegion: isWithin
  };
}
