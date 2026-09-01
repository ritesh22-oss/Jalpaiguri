import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserLocation, LocationStatus } from '../types';
import {
  JALPAIGURI_DEFAULT_LOCATION,
  JALPAIGURI_LOCALITIES,
  LocalityInfo,
  calculateHaversineDistance,
  formatDistanceString,
  getClosestLocalityName
} from '../data/jalpaiguriLocalities';

interface LocationContextType {
  location: UserLocation;
  status: LocationStatus;
  errorMessage: string | null;
  isLocationSelectorOpen: boolean;
  setIsLocationSelectorOpen: (open: boolean) => void;
  requestCurrentLocation: () => Promise<{ success: boolean; locality?: string; error?: string }>;
  setManualLocation: (locality: LocalityInfo | { name: string; locality: string; lat: number; lng: number }) => void;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; distanceText: string };
  localities: LocalityInfo[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<UserLocation>(() => {
    try {
      const saved = localStorage.getItem('jpg_user_location');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading cached location:', e);
    }
    return {
      name: JALPAIGURI_DEFAULT_LOCATION.name,
      locality: JALPAIGURI_DEFAULT_LOCATION.locality,
      lat: JALPAIGURI_DEFAULT_LOCATION.lat,
      lng: JALPAIGURI_DEFAULT_LOCATION.lng,
      isApproximate: true,
      updatedAt: new Date().toISOString()
    };
  });

  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('jpg_user_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Error storing location:', e);
    }
  }, [location]);

  // Request browser / device location via native Geolocation API
  const requestCurrentLocation = useCallback(async (): Promise<{ success: boolean; locality?: string; error?: string }> => {
    setStatus('detecting');
    setErrorMessage(null);

    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setStatus('unavailable');
      setErrorMessage(msg);
      return { success: false, error: msg };
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;

          // Convert coordinates into readable Jalpaiguri locality
          const closest = getClosestLocalityName(lat, lng);

          const newLoc: UserLocation = {
            name: `${closest.locality}, Jalpaiguri`,
            locality: closest.locality,
            lat,
            lng,
            accuracy,
            isApproximate: false,
            updatedAt: new Date().toISOString()
          };

          setLocation(newLoc);
          setStatus('found');
          setErrorMessage(null);
          resolve({ success: true, locality: closest.locality });
        },
        (error) => {
          let userFriendlyError = 'Unable to retrieve location.';
          let newStatus: LocationStatus = 'error';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userFriendlyError = 'Location permission was denied. You can choose your area manually.';
              newStatus = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              userFriendlyError = 'Location signal unavailable. Using default Jalpaiguri center.';
              newStatus = 'unavailable';
              break;
            case error.TIMEOUT:
              userFriendlyError = 'Location request timed out. Please try again or select manually.';
              newStatus = 'timeout';
              break;
            default:
              userFriendlyError = error.message || 'Error detecting location.';
              newStatus = 'error';
          }

          setStatus(newStatus);
          setErrorMessage(userFriendlyError);
          resolve({ success: false, error: userFriendlyError });
        },
        options
      );
    });
  }, []);

  // Set manual location selection
  const setManualLocation = useCallback((loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number }) => {
    const localityName = 'shortName' in loc ? loc.shortName : loc.locality;
    const rawName = loc.name;
    const fullName = rawName.includes('Jalpaiguri') ? rawName : `${rawName}, Jalpaiguri`;

    const newLoc: UserLocation = {
      name: fullName,
      locality: localityName,
      lat: loc.lat,
      lng: loc.lng,
      isApproximate: true,
      updatedAt: new Date().toISOString()
    };

    setLocation(newLoc);
    setStatus('manual');
    setErrorMessage(null);
    setIsLocationSelectorOpen(false);
  }, []);

  // Distance helper from user's current location
  const getDistanceTo = useCallback(
    (targetLat: number, targetLng: number) => {
      const distanceKm = calculateHaversineDistance(location.lat, location.lng, targetLat, targetLng);
      return {
        distanceKm,
        distanceText: formatDistanceString(distanceKm)
      };
    },
    [location.lat, location.lng]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        errorMessage,
        isLocationSelectorOpen,
        setIsLocationSelectorOpen,
        requestCurrentLocation,
        setManualLocation,
        getDistanceTo,
        localities: JALPAIGURI_LOCALITIES
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
