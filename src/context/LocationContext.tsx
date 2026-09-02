import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation, LocationStatus } from '../types';
import {
  JALPAIGURI_DEFAULT_LOCATION,
  JALPAIGURI_LOCALITIES,
  LocalityInfo,
  calculateHaversineDistance,
  formatDistanceString,
  getClosestLocalityName
} from '../data/jalpaiguriLocalities';

interface ExtendedUserLocation extends UserLocation {
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  addressDetails?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface LocationContextType {
  location: ExtendedUserLocation;
  status: LocationStatus;
  errorMessage: string | null;
  isLocationSelectorOpen: boolean;
  setIsLocationSelectorOpen: (open: boolean) => void;
  isLiveTracking: boolean;
  startLiveTracking: () => void;
  stopLiveTracking: () => void;
  requestCurrentLocation: () => Promise<{ success: boolean; locality?: string; error?: string }>;
  setManualLocation: (locality: LocalityInfo | { name: string; locality: string; lat: number; lng: number }) => void;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; distanceText: string };
  localities: LocalityInfo[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Real-time reverse geocoding helper using OpenStreetMap Nominatim
async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<{
  formattedName: string;
  locality: string;
  details?: ExtendedUserLocation['addressDetails'];
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JalpaiguriConnectApp/1.0'
        }
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.village ||
          addr.town ||
          addr.city_district ||
          addr.city ||
          'Jalpaiguri';

        const road = addr.road || addr.pedestrian || addr.street;
        const city = addr.city || addr.town || addr.municipality || addr.district || 'Jalpaiguri';
        const state = addr.state || 'West Bengal';
        const postcode = addr.postcode || '';

        const nameParts = [road, locality, city].filter(Boolean);
        const formattedName = nameParts.length > 0 ? nameParts.join(', ') : `${locality}, ${city}`;

        return {
          formattedName: postcode ? `${formattedName} (${postcode})` : formattedName,
          locality,
          details: {
            road,
            neighbourhood: addr.neighbourhood,
            suburb: addr.suburb,
            city,
            state,
            postcode,
            country: addr.country
          }
        };
      }
    }
  } catch (err) {
    // Non-blocking fallback
  }

  // Fallback to nearest Jalpaiguri locality mapping
  const closest = getClosestLocalityName(lat, lng);
  return {
    formattedName: `${closest.locality}, Jalpaiguri`,
    locality: closest.locality
  };
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<ExtendedUserLocation>(() => {
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
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('jpg_user_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Error storing location:', e);
    }
  }, [location]);

  // Request browser / device location via native Geolocation API with real coordinates & reverse geocoding
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
        timeout: 12000,
        maximumAge: 10000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          const altitude = position.coords.altitude;
          const speed = position.coords.speed;
          const heading = position.coords.heading;

          // Perform real reverse geocoding
          const geoResult = await reverseGeocodeCoordinates(lat, lng);

          const newLoc: ExtendedUserLocation = {
            name: geoResult.formattedName,
            locality: geoResult.locality,
            lat,
            lng,
            accuracy: Math.round(accuracy),
            altitude,
            speed,
            heading,
            addressDetails: geoResult.details,
            isApproximate: false,
            updatedAt: new Date().toISOString()
          };

          setLocation(newLoc);
          setStatus('found');
          setErrorMessage(null);
          console.log(`[REALTIME GPS] Updated coordinates: ${lat}, ${lng} (±${Math.round(accuracy)}m) -> ${geoResult.formattedName}`);
          resolve({ success: true, locality: geoResult.locality });
        },
        (error) => {
          let userFriendlyError = 'Unable to retrieve location.';
          let newStatus: LocationStatus = 'error';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userFriendlyError = 'Location permission was denied. You can select your area manually.';
              newStatus = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              userFriendlyError = 'Location signal unavailable. Using last known location.';
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

  // Continuous Real-Time GPS Tracking via watchPosition
  const startLiveTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation not supported');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLiveTracking(true);
    setStatus('detecting');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setLocation((prev) => {
          // If moved significantly or first live lock, update coordinates
          const dist = calculateHaversineDistance(prev.lat, prev.lng, lat, lng);
          if (dist > 0.05 || prev.isApproximate) {
            reverseGeocodeCoordinates(lat, lng).then((geo) => {
              setLocation({
                name: geo.formattedName,
                locality: geo.locality,
                lat,
                lng,
                accuracy,
                altitude: pos.coords.altitude,
                speed: pos.coords.speed,
                heading: pos.coords.heading,
                addressDetails: geo.details,
                isApproximate: false,
                updatedAt: new Date().toISOString()
              });
            });
          }

          return {
            ...prev,
            lat,
            lng,
            accuracy,
            altitude: pos.coords.altitude,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            isApproximate: false,
            updatedAt: new Date().toISOString()
          };
        });

        setStatus('found');
      },
      (err) => {
        console.warn('[REALTIME GPS] Watch position notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );
  }, []);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  }, []);

  // Clean up watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-detect realtime location silently on mount if permission exists
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          requestCurrentLocation();
        }
      }).catch(() => {});
    }
  }, [requestCurrentLocation]);

  // Set manual location selection
  const setManualLocation = useCallback((loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number }) => {
    stopLiveTracking();
    const localityName = 'shortName' in loc ? loc.shortName : loc.locality;
    const rawName = loc.name;
    const fullName = rawName.includes('Jalpaiguri') ? rawName : `${rawName}, Jalpaiguri`;

    const newLoc: ExtendedUserLocation = {
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
  }, [stopLiveTracking]);

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
        isLiveTracking,
        startLiveTracking,
        stopLiveTracking,
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

