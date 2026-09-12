import { calculateHaversineDistance } from './serviceArea';

/**
 * Calculates the distance between two geographic coordinates in kilometers.
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  return calculateHaversineDistance(lat1, lon1, lat2, lon2);
};

/**
 * Formats a distance in kilometers into a human-readable string.
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};
