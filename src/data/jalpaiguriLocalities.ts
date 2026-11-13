import {
  SERVICE_AREA_MODE,
  SUPPORTED_SERVICE_AREA,
  validateServiceArea,
  ServiceAreaMode,
  calculateHaversineDistance,
  ServiceAreaValidationResult
} from '../utils/serviceArea';

export {
  SERVICE_AREA_MODE,
  SUPPORTED_SERVICE_AREA,
  validateServiceArea,
  calculateHaversineDistance,
  type ServiceAreaMode,
  type ServiceAreaValidationResult
};

export interface LocalityInfo {
  id: string;
  name: string;
  shortName: string;
  pincode: string;
  lat: number;
  lng: number;
  radiusKm?: number;
  popularLandmarks: string[];
  type: 'commercial' | 'residential' | 'healthcare' | 'transport' | 'civic';
}

export const JALPAIGURI_DEFAULT_LOCATION = {
  name: 'Kadamtala, Jalpaiguri, West Bengal',
  locality: 'Kadamtala',
  lat: 26.52537,
  lng: 88.72030,
  isApproximate: false
};

/**
 * Ground-Truth Verified Jalpaiguri Localities and Neighborhoods
 * Geocoded to exact geographic centers with specific boundary radii to prevent cross-neighborhood confusion.
 */
export const JALPAIGURI_LOCALITIES: LocalityInfo[] = [
  {
    id: 'senpara',
    name: 'Senpara',
    shortName: 'Senpara',
    pincode: '735101',
    lat: 26.53647,
    lng: 88.72564,
    radiusKm: 0.45,
    popularLandmarks: ['Senpara Club & Library', 'Senpara Main Road', 'Durgapuja Ground'],
    type: 'residential'
  },
  {
    id: 'raikatpara',
    name: 'Raikatpara',
    shortName: 'Raikatpara',
    pincode: '735101',
    lat: 26.53526,
    lng: 88.71979,
    radiusKm: 0.45,
    popularLandmarks: ['Raikatpara Sporting Association Ground', 'Mohun Bagan Sarani', 'Raikatpara Rakha Kali Mandir'],
    type: 'residential'
  },
  {
    id: 'rajbari-para',
    name: 'Rajbari Para (Baikunthapur Palace)',
    shortName: 'Rajbari',
    pincode: '735101',
    lat: 26.54103,
    lng: 88.71958,
    radiusKm: 0.55,
    popularLandmarks: ['Baikunthapur Rajbari Palace', 'Rajbari Dighi', 'Rajbari Park', 'Rajbari Kali Mandir'],
    type: 'civic'
  },
  {
    id: 'kadamtala',
    name: 'Kadamtala',
    shortName: 'Kadamtala',
    pincode: '735101',
    lat: 26.52537,
    lng: 88.72030,
    radiusKm: 0.50,
    popularLandmarks: ['Kadamtala More', 'Municipality Complex', 'Mobile Hospital', 'Rail Crossing'],
    type: 'commercial'
  },
  {
    id: 'kamarpara',
    name: 'Kamarpara',
    shortName: 'Kamarpara',
    pincode: '735101',
    lat: 26.52533,
    lng: 88.72165,
    radiusKm: 0.40,
    popularLandmarks: ['Doctor Charu Chandra Sanyal Sarani', 'Kamarpara Community Center'],
    type: 'residential'
  },
  {
    id: 'dinbazar',
    name: 'Dinbazar Wholesale Market',
    shortName: 'Dinbazar',
    pincode: '735101',
    lat: 26.51860,
    lng: 88.72910,
    radiusKm: 0.50,
    popularLandmarks: ['Dinbazar Wholesale Market', 'Subzi Mandi', 'Cloth Market', 'Netaji Subhash Chandra Bose Road'],
    type: 'commercial'
  },
  {
    id: 'ashrampara',
    name: 'Ashrampara',
    shortName: 'Ashrampara',
    pincode: '735101',
    lat: 26.51525,
    lng: 88.72697,
    radiusKm: 0.45,
    popularLandmarks: ['Ramakrishna Mission Ashram Road', 'Ashrampara Community Ground'],
    type: 'residential'
  },
  {
    id: 'babupara',
    name: 'Babupara',
    shortName: 'Babupara',
    pincode: '735101',
    lat: 26.52297,
    lng: 88.72738,
    radiusKm: 0.45,
    popularLandmarks: ['Babupara Field', 'Babupara Shiva Mandir', 'Station Road'],
    type: 'residential'
  },
  {
    id: 'nayabasti',
    name: 'Nayabasti',
    shortName: 'Nayabasti',
    pincode: '735101',
    lat: 26.51701,
    lng: 88.73039,
    radiusKm: 0.45,
    popularLandmarks: ['Club Road', 'Nayabasti Community Ground', 'R2 Bike Hospital'],
    type: 'residential'
  },
  {
    id: 'shanti-para',
    name: 'Shanti Para',
    shortName: 'Shantipara',
    pincode: '735101',
    lat: 26.53558,
    lng: 88.71206,
    radiusKm: 0.50,
    popularLandmarks: ['Shantipara More', 'Vidyasagar Sarani', 'Siliguri Road Entrance'],
    type: 'residential'
  },
  {
    id: 'hakimpara',
    name: 'Hakimpara',
    shortName: 'Hakimpara',
    pincode: '735101',
    lat: 26.52913,
    lng: 88.73125,
    radiusKm: 0.45,
    popularLandmarks: ['Hakimpara Temple', 'Court More', 'Hakimpara Girls High School'],
    type: 'residential'
  },
  {
    id: 'sadar-hospital',
    name: 'District Sadar Hospital & Post Office More',
    shortName: 'Hospital Road',
    pincode: '735101',
    lat: 26.52943,
    lng: 88.72759,
    radiusKm: 0.40,
    popularLandmarks: ['Jalpaiguri District Sadar Hospital', 'Super Speciality Hospital', 'Head Post Office', 'OPD Block'],
    type: 'healthcare'
  },
  {
    id: 'adarpara',
    name: 'Adarpara',
    shortName: 'Adarpara',
    pincode: '735101',
    lat: 26.51339,
    lng: 88.72487,
    radiusKm: 0.50,
    popularLandmarks: ['Adarpara High School', 'Karala River Ghat'],
    type: 'residential'
  },
  {
    id: 'tb-hospital-para',
    name: 'TB Hospital Para',
    shortName: 'TB Hospital Para',
    pincode: '735101',
    lat: 26.54074,
    lng: 88.70731,
    radiusKm: 0.50,
    popularLandmarks: ['TB Hospital Complex', 'Maskalaibari Bridge Link'],
    type: 'healthcare'
  },
  {
    id: 'maskalaibari',
    name: 'Maskalaibari',
    shortName: 'Maskalaibari',
    pincode: '735101',
    lat: 26.53478,
    lng: 88.70715,
    radiusKm: 0.50,
    popularLandmarks: ['Maskalaibari Ground', 'Maskalaibari Bridge', 'Shashan Kali Mandir'],
    type: 'residential'
  },
  {
    id: 'deshbandhu-para',
    name: 'Deshbandhu Para',
    shortName: 'Deshbandhu Para',
    pincode: '735101',
    lat: 26.53191,
    lng: 88.71139,
    radiusKm: 0.45,
    popularLandmarks: ['Deshbandhu Para Sarbojonin Kalibari', 'Vidyasagar Sarani'],
    type: 'residential'
  },
  {
    id: 'pandapara',
    name: 'Pandapara',
    shortName: 'Pandapara',
    pincode: '735101',
    lat: 26.51723,
    lng: 88.72087,
    radiusKm: 0.50,
    popularLandmarks: ['Pandapara Kalibari', 'Pandapara Tumol Lane', 'Jay Lane'],
    type: 'residential'
  },
  {
    id: 'town-station',
    name: 'Jalpaiguri Town Railway Station',
    shortName: 'Town Station',
    pincode: '735101',
    lat: 26.51869,
    lng: 88.72415,
    radiusKm: 0.45,
    popularLandmarks: ['Jalpaiguri Railway Station', 'Station Road Auto Stand', 'Railway Colony'],
    type: 'transport'
  },
  {
    id: 'silpasamiti',
    name: 'Silpasamiti Para',
    shortName: 'Silpasamiti Para',
    pincode: '735101',
    lat: 26.52920,
    lng: 88.71800,
    radiusKm: 0.45,
    popularLandmarks: ['Silpasamiti Ground', 'Club Road', 'Community Hall'],
    type: 'residential'
  },
  {
    id: 'goshala',
    name: 'Goshala More',
    shortName: 'Goshala',
    pincode: '735102',
    lat: 26.54705,
    lng: 88.70913,
    radiusKm: 0.50,
    popularLandmarks: ['Goshala Temple', 'NH27 Junction', 'Siliguri Road Crossing'],
    type: 'commercial'
  },
  {
    id: 'paharpur',
    name: 'Paharpur More',
    shortName: 'Paharpur',
    pincode: '735121',
    lat: 26.55869,
    lng: 88.72444,
    radiusKm: 0.70,
    popularLandmarks: ['Paharpur Bus Stop', 'NH27 Crossing', 'Tea Auction Centre Road'],
    type: 'commercial'
  },
  {
    id: 'raninagar',
    name: 'Raninagar BSF & Industrial Area',
    shortName: 'Raninagar',
    pincode: '735133',
    lat: 26.53963,
    lng: 88.63662,
    radiusKm: 1.50,
    popularLandmarks: ['Raninagar Industrial Estate', 'BSF Camp', 'NH27 Overpass'],
    type: 'civic'
  },
  {
    id: 'mohitnagar',
    name: 'Mohitnagar Station & Research Farm',
    shortName: 'Mohitnagar',
    pincode: '735102',
    lat: 26.53065,
    lng: 88.66768,
    radiusKm: 1.20,
    popularLandmarks: ['Mohitnagar Railway Station', 'Agricultural Research Station'],
    type: 'residential'
  }
];

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
  return validateServiceArea(lat, lng).isInside;
}

/**
 * High-accuracy Jalpaiguri Locality Finder.
 * Uses exact distance checking against known neighborhood boundaries.
 * If distance exceeds the neighborhood's radius (default 500m), it designates the area as a specific coordinate point
 * rather than improperly substituting an adjacent neighborhood (e.g. tapping Senpara will never return Raikatpara).
 */
export function getClosestLocalityName(lat: number, lng: number): {
  locality: string;
  fullName: string;
  distanceKm: number;
  isWithinRegion: boolean;
  isExactNeighborhood: boolean;
} {
  const validation = validateServiceArea(lat, lng);
  if (!validation.isInside) {
    return {
      locality: 'Outside Jalpaiguri',
      fullName: 'Outside Jalpaiguri Service Area',
      distanceKm: validation.centerDistanceKm,
      isWithinRegion: false,
      isExactNeighborhood: false
    };
  }

  let closest = JALPAIGURI_LOCALITIES[0];
  let minDistance = calculateHaversineDistance(lat, lng, closest.lat, closest.lng);

  for (const loc of JALPAIGURI_LOCALITIES) {
    const dist = calculateHaversineDistance(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  const radiusThreshold = closest.radiusKm || 0.5;
  const isExact = minDistance <= radiusThreshold;

  if (isExact) {
    return {
      locality: closest.shortName,
      fullName: `${closest.name}, Jalpaiguri`,
      distanceKm: minDistance,
      isWithinRegion: true,
      isExactNeighborhood: true
    };
  }

  // Tapped coordinate is in between neighborhoods or outside a tight centroid.
  // We clearly indicate this without falsely claiming it is the adjacent neighborhood.
  return {
    locality: `Near ${closest.shortName}`,
    fullName: `Area near ${closest.name} (${Math.round(minDistance * 1000)}m), Jalpaiguri`,
    distanceKm: minDistance,
    isWithinRegion: true,
    isExactNeighborhood: false
  };
}
