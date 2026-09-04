import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation, LocationStatus } from '../types';
import {
  SERVICE_AREA_MODE,
  SUPPORTED_SERVICE_AREA,
  validateServiceArea,
  calculateHaversineDistance,
  formatDistanceString,
  ServiceAreaMode,
  ServiceAreaValidationResult
} from '../utils/serviceArea';
import { JALPAIGURI_LOCALITIES, LocalityInfo } from '../data/jalpaiguriLocalities';
import { apiClient } from '../services/apiClient';

export interface ExtendedUserLocation extends UserLocation {
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  pincode?: string;
  road?: string;
  accuracy?: number;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  locationSource?: 'gps' | 'manual' | 'simulated';
  isLowAccuracy?: boolean;
  accuracyWarning?: string | null;
  serviceAreaStatus?: 'inside' | 'outside';
  addressDetails?: {
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface ReverseGeocodeResult {
  formattedName: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  road: string;
  source: string;
  details?: ExtendedUserLocation['addressDetails'];
}

interface LocationContextType {
  location: ExtendedUserLocation | null;
  verifiedGpsLocation: ExtendedUserLocation | null;
  status: LocationStatus;
  errorMessage: string | null;
  serviceAreaMode: ServiceAreaMode;
  setServiceAreaMode: (mode: ServiceAreaMode) => void;
  serviceAreaStatus: 'inside' | 'outside' | 'pending';
  serviceAreaValidation: ServiceAreaValidationResult | null;
  isWithinServiceRegion: boolean;
  distanceToServiceRegionKm: number;
  isLocationSelectorOpen: boolean;
  setIsLocationSelectorOpen: (open: boolean) => void;
  isLiveTracking: boolean;
  startLiveTracking: () => void;
  stopLiveTracking: () => void;
  requestCurrentLocation: () => Promise<{ success: boolean; locality?: string; location?: ExtendedUserLocation; error?: string }>;
  refreshLocation: () => Promise<{ success: boolean; locality?: string; error?: string }>;
  setManualLocation: (loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number; city?: string; state?: string }) => void;
  setSimulatedLocation: (preset: 'JALPAIGURI' | 'CHENNAI' | 'KOLKATA' | 'SILIGURI' | 'RESET') => void;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; distanceText: string };
  localities: LocalityInfo[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Real reverse geocoding via dedicated server-side proxy
async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const data = await apiClient.reverseGeocode(lat, lng);
    if (data && data.success) {
      return {
        formattedName: data.name || `${data.locality || 'Detected Area'}, ${data.state || data.country || ''}`.trim(),
        locality: data.locality || data.city || 'Detected Location',
        city: data.city || '',
        district: data.district || '',
        state: data.state || '',
        country: data.country || 'India',
        pincode: data.pincode || '',
        road: data.road || '',
        source: data.source || 'server-api',
        details: {
          road: data.road,
          suburb: data.locality,
          city: data.city,
          district: data.district,
          state: data.state,
          postcode: data.pincode,
          country: data.country
        }
      };
    }
  } catch (serverErr) {
    console.warn('[REVERSE GEOCODE] Server proxy call failed or timed out:', serverErr);
  }

  // Client-side regional boundary fallback if server reverse geocode is unreachable
  const REGIONAL_REFERENCE = [
    { city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, radiusKm: 70 },
    { city: 'Bengaluru', district: 'Bangalore Urban', state: 'Karnataka', lat: 12.9716, lng: 77.5946, radiusKm: 60 },
    { city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, radiusKm: 50 },
    { city: 'Jalpaiguri', district: 'Jalpaiguri', state: 'West Bengal', lat: 26.5414, lng: 88.7196, radiusKm: 30 },
    { city: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', lat: 26.7271, lng: 88.3953, radiusKm: 35 },
    { city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, radiusKm: 65 },
    { city: 'Delhi', district: 'New Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, radiusKm: 60 },
    { city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, radiusKm: 60 }
  ];

  for (const reg of REGIONAL_REFERENCE) {
    const d = calculateHaversineDistance(lat, lng, reg.lat, reg.lng);
    if (d <= reg.radiusKm) {
      return {
        formattedName: `${reg.city}, ${reg.state}`,
        locality: reg.city,
        city: reg.city,
        district: reg.district,
        state: reg.state,
        country: 'India',
        pincode: '',
        road: '',
        source: 'regional-fallback'
      };
    }
  }

  return {
    formattedName: `Location (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`,
    locality: `Coordinates ${lat.toFixed(2)}, ${lng.toFixed(2)}`,
    city: 'Detected Area',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    road: '',
    source: 'raw-coordinates'
  };
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serviceAreaMode, setServiceAreaMode] = useState<ServiceAreaMode>(() => {
    try {
      const saved = localStorage.getItem('jpg_service_area_mode');
      if (saved === 'JALPAIGURI_CITY' || saved === 'JALPAIGURI_DISTRICT') {
        return saved;
      }
    } catch (e) {}
    return SERVICE_AREA_MODE;
  });

  const [location, setLocation] = useState<ExtendedUserLocation | null>(() => {
    try {
      const saved = localStorage.getItem('jpg_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading saved location:', e);
    }
    return null;
  });

  // Track the ground-truth verified GPS reading (distinct from any manual info view)
  const [verifiedGpsLocation, setVerifiedGpsLocation] = useState<ExtendedUserLocation | null>(() => {
    try {
      const saved = localStorage.getItem('jpg_verified_gps_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.locationSource === 'gps') {
          return parsed;
        }
      }
    } catch (e) {}
    return null;
  });

  const [status, setStatus] = useState<LocationStatus>('detecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState<boolean>(false);
  const [isLiveTracking, setIsLiveTracking] = useState<boolean>(false);
  const watchIdRef = useRef<number | null>(null);

  // Calculate geospatial service area validation based on ground truth verified location or current location
  const activeGeoLocation = location;
  const serviceAreaValidation: ServiceAreaValidationResult | null = activeGeoLocation
    ? validateServiceArea(activeGeoLocation.lat, activeGeoLocation.lng, serviceAreaMode)
    : null;

  const serviceAreaStatus: 'inside' | 'outside' | 'pending' = serviceAreaValidation
    ? serviceAreaValidation.serviceAreaStatus
    : (status === 'detecting' ? 'pending' : 'outside');

  const isWithinServiceRegion = serviceAreaStatus === 'inside';

  // Persist mode changes
  useEffect(() => {
    try {
      localStorage.setItem('jpg_service_area_mode', serviceAreaMode);
    } catch (e) {}
  }, [serviceAreaMode]);

  // Persist location
  useEffect(() => {
    if (location) {
      try {
        localStorage.setItem('jpg_user_location', JSON.stringify(location));
      } catch (e) {}
    }
  }, [location]);

  // Persist verified GPS location
  useEffect(() => {
    if (verifiedGpsLocation) {
      try {
        localStorage.setItem('jpg_verified_gps_location', JSON.stringify(verifiedGpsLocation));
      } catch (e) {}
    }
  }, [verifiedGpsLocation]);

  // Real GPS detection via native Geolocation API
  const requestCurrentLocation = useCallback(async (): Promise<{ success: boolean; locality?: string; location?: ExtendedUserLocation; error?: string }> => {
    setStatus('detecting');
    setErrorMessage(null);

    if (typeof window === 'undefined' || !navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser or device.';
      setStatus('unavailable');
      setErrorMessage(msg);
      return { success: false, error: msg };
    }

    return new Promise((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);
          const altitude = position.coords.altitude;
          const speed = position.coords.speed;
          const heading = position.coords.heading;

          const isLowAccuracy = accuracy > 1000;
          const accuracyWarning = isLowAccuracy
            ? `Your location accuracy is ±${accuracy}m. Location may be approximate.`
            : null;

          // Real reverse geocoding on the EXACT device coordinates
          const geoResult = await reverseGeocodeCoordinates(lat, lng);
          const validation = validateServiceArea(lat, lng, serviceAreaMode);

          const newLoc: ExtendedUserLocation = {
            name: geoResult.formattedName,
            locality: geoResult.locality,
            city: geoResult.city,
            district: geoResult.district,
            state: geoResult.state,
            country: geoResult.country,
            pincode: geoResult.pincode,
            road: geoResult.road,
            lat,
            lng,
            accuracy,
            altitude,
            speed,
            heading,
            addressDetails: geoResult.details,
            isApproximate: false,
            locationSource: 'gps',
            isLowAccuracy,
            accuracyWarning,
            serviceAreaStatus: validation.serviceAreaStatus,
            updatedAt: new Date().toISOString()
          };

          setLocation(newLoc);
          setVerifiedGpsLocation(newLoc);
          setStatus('found');
          setErrorMessage(null);

          console.log(`[GPS DETECTED] (${lat.toFixed(4)}, ${lng.toFixed(4)}) -> ${geoResult.formattedName} -> Service Area: ${validation.serviceAreaStatus.toUpperCase()}`);
          resolve({ success: true, locality: geoResult.locality, location: newLoc });
        },
        (error) => {
          let userFriendlyError = 'Location permission is required to verify whether Jalpaiguri Connect is available in your area.';
          let newStatus: LocationStatus = 'error';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userFriendlyError = 'Location permission is turned off. Please allow location access to check service availability.';
              newStatus = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              userFriendlyError = 'GPS signal unavailable. Please ensure device location services are enabled.';
              newStatus = 'unavailable';
              break;
            case error.TIMEOUT:
              userFriendlyError = 'Location request timed out. Please tap Check Location Again.';
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
  }, [serviceAreaMode]);

  const refreshLocation = useCallback(async () => {
    return await requestCurrentLocation();
  }, [requestCurrentLocation]);

  // Live GPS tracking via watchPosition
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

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy);

        setLocation((prev) => {
          if (!prev || calculateHaversineDistance(prev.lat, prev.lng, lat, lng) > 0.05) {
            reverseGeocodeCoordinates(lat, lng).then((geo) => {
              const validation = validateServiceArea(lat, lng, serviceAreaMode);
              const updated: ExtendedUserLocation = {
                name: geo.formattedName,
                locality: geo.locality,
                city: geo.city,
                district: geo.district,
                state: geo.state,
                country: geo.country,
                pincode: geo.pincode,
                road: geo.road,
                lat,
                lng,
                accuracy,
                altitude: pos.coords.altitude,
                speed: pos.coords.speed,
                heading: pos.coords.heading,
                addressDetails: geo.details,
                isApproximate: false,
                locationSource: 'gps',
                serviceAreaStatus: validation.serviceAreaStatus,
                updatedAt: new Date().toISOString()
              };
              setLocation(updated);
              setVerifiedGpsLocation(updated);
            });
          }
          return prev;
        });

        setStatus('found');
      },
      (err) => {
        console.warn('[REALTIME GPS] Watch error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );
  }, [serviceAreaMode]);

  const stopLiveTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // On initial mount, immediately attempt to detect real device GPS
  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  // Manual location for general informational view (explicitly marked as manual)
  const setManualLocation = useCallback((loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number; city?: string; state?: string }) => {
    stopLiveTracking();
    const localityName = 'shortName' in loc ? loc.shortName : loc.locality;
    const rawName = loc.name;
    const city = 'city' in loc && loc.city ? loc.city : 'Jalpaiguri';
    const state = 'state' in loc && loc.state ? loc.state : 'West Bengal';

    const validation = validateServiceArea(loc.lat, loc.lng, serviceAreaMode);

    const newLoc: ExtendedUserLocation = {
      name: rawName,
      locality: localityName,
      city,
      district: 'Jalpaiguri',
      state,
      country: 'India',
      lat: loc.lat,
      lng: loc.lng,
      isApproximate: true,
      locationSource: 'manual',
      serviceAreaStatus: validation.serviceAreaStatus,
      updatedAt: new Date().toISOString()
    };

    setLocation(newLoc);
    setStatus('manual');
    setErrorMessage(null);
    setIsLocationSelectorOpen(false);
  }, [stopLiveTracking, serviceAreaMode]);

  // Developer & Tester Simulation Preset Switcher
  const setSimulatedLocation = useCallback((preset: 'JALPAIGURI' | 'CHENNAI' | 'KOLKATA' | 'SILIGURI' | 'RESET') => {
    stopLiveTracking();
    if (preset === 'RESET') {
      requestCurrentLocation();
      return;
    }

    const PRESETS = {
      JALPAIGURI: { name: 'Kadamtala, Jalpaiguri', locality: 'Kadamtala', city: 'Jalpaiguri', district: 'Jalpaiguri', state: 'West Bengal', lat: 26.5218, lng: 88.7289 },
      CHENNAI: { name: 'T. Nagar, Chennai', locality: 'T. Nagar', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', lat: 13.0418, lng: 80.2341 },
      KOLKATA: { name: 'Park Street, Kolkata', locality: 'Park Street', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', lat: 22.5535, lng: 88.3518 },
      SILIGURI: { name: 'Sevoke Road, Siliguri', locality: 'Sevoke Road', city: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', lat: 26.7271, lng: 88.3953 }
    };

    const target = PRESETS[preset];
    const validation = validateServiceArea(target.lat, target.lng, serviceAreaMode);

    const simLoc: ExtendedUserLocation = {
      name: target.name,
      locality: target.locality,
      city: target.city,
      district: target.district,
      state: target.state,
      country: 'India',
      lat: target.lat,
      lng: target.lng,
      accuracy: 15,
      isApproximate: false,
      locationSource: 'simulated',
      serviceAreaStatus: validation.serviceAreaStatus,
      updatedAt: new Date().toISOString()
    };

    setLocation(simLoc);
    setVerifiedGpsLocation(simLoc);
    setStatus('found');
    setErrorMessage(null);
  }, [stopLiveTracking, requestCurrentLocation, serviceAreaMode]);

  const getDistanceTo = useCallback(
    (targetLat: number, targetLng: number) => {
      const currentLat = location ? location.lat : 26.5414;
      const currentLng = location ? location.lng : 88.7196;
      const distanceKm = calculateHaversineDistance(currentLat, currentLng, targetLat, targetLng);
      return {
        distanceKm,
        distanceText: formatDistanceString(distanceKm)
      };
    },
    [location]
  );

  return (
    <LocationContext.Provider
      value={{
        location,
        verifiedGpsLocation,
        status,
        errorMessage,
        serviceAreaMode,
        setServiceAreaMode,
        serviceAreaStatus,
        serviceAreaValidation,
        isWithinServiceRegion,
        distanceToServiceRegionKm: serviceAreaValidation?.centerDistanceKm || 0,
        isLocationSelectorOpen,
        setIsLocationSelectorOpen,
        isLiveTracking,
        startLiveTracking,
        stopLiveTracking,
        requestCurrentLocation,
        refreshLocation,
        setManualLocation,
        setSimulatedLocation,
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
