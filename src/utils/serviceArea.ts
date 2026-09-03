/**
 * Jalpaiguri Connect - Official Service Area & Geographic Coverage Configuration
 * 
 * JALPAIGURI CONNECT IS A JALPAIGURI-ONLY APPLICATION.
 * This file is the single source of truth for service area boundaries,
 * supported modes, geospatial boundary coordinates, and Point-in-Polygon validation.
 */

export type ServiceAreaMode = 'JALPAIGURI_CITY' | 'JALPAIGURI_DISTRICT';

/**
 * Product Owner Configuration:
 * - 'JALPAIGURI_CITY': Restricts coverage to Jalpaiguri Municipality wards and core urban area
 * - 'JALPAIGURI_DISTRICT': Covers the entire Jalpaiguri district (Sadar, Malbazar, Maynaguri, Dhupguri, Rajganj, etc.)
 * 
 * Central switch - Do NOT add other cities or states.
 */
export const SERVICE_AREA_MODE: ServiceAreaMode = 'JALPAIGURI_CITY';

export interface ServiceBoundaryConfig {
  id: ServiceAreaMode;
  name: string;
  description: string;
  officialSource: string;
  center: { lat: number; lng: number };
  boundingBox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  // Geospatial polygon vertices: Array of [latitude, longitude]
  polygon: [number, number][];
}

/**
 * 1. JALPAIGURI MUNICIPALITY / CITY BOUNDARY
 * Official coverage for Jalpaiguri Municipality (Wards 1 through 25).
 * Bounded by:
 * - North: Paharpur, Mohitnagar agricultural research line (Lat ~26.552°N)
 * - East: Teesta River embankment & Karala confluence (Lng ~88.758°E)
 * - South: Town Railway Station, Mandalghat, Pandapara south boundary (Lat ~26.495°N)
 * - West: Baikunthapur forest border, Racecourse, NH31 bypass (Lng ~88.685°E)
 */
export const JALPAIGURI_CITY_BOUNDARY: ServiceBoundaryConfig = {
  id: 'JALPAIGURI_CITY',
  name: 'Jalpaiguri Municipality',
  description: 'Official Jalpaiguri Municipal area comprising Wards 1 to 25 along the Karala and Teesta river basins.',
  officialSource: 'Jalpaiguri Municipality Master Plan & West Bengal Municipal Affairs Dept.',
  center: { lat: 26.5265, lng: 88.7230 },
  boundingBox: {
    minLat: 26.4900,
    maxLat: 26.5650,
    minLng: 88.6850,
    maxLng: 88.7650
  },
  polygon: [
    [26.5480, 88.7050], // NW: Paharpur / NH31 bypass
    [26.5560, 88.7280], // North: Mohitnagar North
    [26.5520, 88.7520], // NE: Mohitnagar East / Karala upper reach
    [26.5380, 88.7620], // East: Teesta Embankment / Raikatpara East
    [26.5180, 88.7550], // SE: Dinbazar East / Teesta bank
    [26.5020, 88.7420], // SE: Maskalaibari South
    [26.4950, 88.7280], // South: Town Railway Station / Pandapara South
    [26.5050, 88.7020], // SW: Silpasamiti Para West
    [26.5220, 88.6880], // West: Hakimpara West / Racecourse
    [26.5400, 88.6920]  // NW: Desun / NH31 Highway link
  ]
};

/**
 * 2. JALPAIGURI DISTRICT BOUNDARY
 * Covers the full administrative boundaries of Jalpaiguri District in North Bengal:
 * - Subdivisions: Jalpaiguri Sadar, Malbazar
 * - Community Blocks: Rajganj, Jalpaiguri Sadar, Maynaguri, Dhupguri, Mal, Matiali, Nagrakata
 * Bounded by:
 * - North: Darjeeling / Kalimpong & Bhutan border
 * - East: Alipurduar District
 * - South: Cooch Behar District & Bangladesh border
 * - West: Siliguri (Darjeeling district) & Bangladesh
 */
export const JALPAIGURI_DISTRICT_BOUNDARY: ServiceBoundaryConfig = {
  id: 'JALPAIGURI_DISTRICT',
  name: 'Jalpaiguri District',
  description: 'Entire Jalpaiguri administrative district including Sadar, Maynaguri, Dhupguri, Malbazar, Matiali, Nagrakata, and Rajganj.',
  officialSource: 'District Census Handbook, Jalpaiguri, Directorate of Census Operations, West Bengal',
  center: { lat: 26.5414, lng: 88.7196 },
  boundingBox: {
    minLat: 26.2500,
    maxLat: 27.0500,
    minLng: 88.3800,
    maxLng: 89.2000
  },
  polygon: [
    [27.0200, 88.7200], // North: Matiali / Bhutan border foothills
    [27.0100, 89.0500], // NE: Nagrakata / Jaldhaka river
    [26.8500, 89.1500], // East: Dhupguri East / Alipurduar border
    [26.5500, 89.1000], // SE: Maynaguri East / Cooch Behar border
    [26.3200, 88.8500], // South: Sadar South / Bangladesh border
    [26.3800, 88.5800], // SW: Rajganj South
    [26.6500, 88.4200], // West: Rajganj / Siliguri boundary
    [26.8800, 88.5500]  // NW: Malbazar West / Kalimpong foothills
  ]
};

/**
 * Centralized Supported Service Area lookup
 */
export const SUPPORTED_SERVICE_AREA: Record<ServiceAreaMode, ServiceBoundaryConfig> = {
  JALPAIGURI_CITY: JALPAIGURI_CITY_BOUNDARY,
  JALPAIGURI_DISTRICT: JALPAIGURI_DISTRICT_BOUNDARY
};

/**
 * Ray-Casting Algorithm for Point-in-Polygon (PIP) Validation.
 * Determines with mathematical certainty whether a coordinate is inside the geospatial boundary.
 */
export function isPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}

/**
 * Haversine formula to compute great-circle distance between two points in km.
 */
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

export interface ServiceAreaValidationResult {
  isInside: boolean;
  serviceAreaStatus: 'inside' | 'outside';
  configuredMode: ServiceAreaMode;
  boundaryName: string;
  centerDistanceKm: number;
  reason: string;
}

/**
 * Validates whether the given geographic coordinates are inside the supported Jalpaiguri service area.
 * Uses bounding box pre-filter followed by ray-casting point-in-polygon verification.
 */
export function validateServiceArea(
  lat: number,
  lng: number,
  mode: ServiceAreaMode = SERVICE_AREA_MODE
): ServiceAreaValidationResult {
  const boundary = SUPPORTED_SERVICE_AREA[mode] || JALPAIGURI_CITY_BOUNDARY;
  const { minLat, maxLat, minLng, maxLng } = boundary.boundingBox;

  const centerDist = calculateHaversineDistance(lat, lng, boundary.center.lat, boundary.center.lng);

  // 1. Check bounding box pre-filter
  const inBoundingBox = lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;

  // 2. Run Point-in-Polygon Ray Casting
  const inPolygon = inBoundingBox && isPointInPolygon(lat, lng, boundary.polygon);

  if (inPolygon) {
    return {
      isInside: true,
      serviceAreaStatus: 'inside',
      configuredMode: mode,
      boundaryName: boundary.name,
      centerDistanceKm: Math.round(centerDist * 10) / 10,
      reason: `Location is verified inside ${boundary.name} (${mode}) official service boundary.`
    };
  }

  return {
    isInside: false,
    serviceAreaStatus: 'outside',
    configuredMode: mode,
    boundaryName: boundary.name,
    centerDistanceKm: Math.round(centerDist * 10) / 10,
    reason: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) are outside ${boundary.name}. Jalpaiguri Connect is strictly available only within Jalpaiguri.`
  };
}

export function formatDistanceString(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}
