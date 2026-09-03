import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserLocation, LocationStatus } from '../types';
import {
  JALPAIGURI_DEFAULT_LOCATION,
  JALPAIGURI_LOCALITIES,
  JALPAIGURI_SERVICE_REGION,
  isWithinJalpaiguriRegion,
  LocalityInfo,
  calculateHaversineDistance,
  formatDistanceString
} from '../data/jalpaiguriLocalities';

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
  locationSource?: 'gps' | 'manual';
  isLowAccuracy?: boolean;
  accuracyWarning?: string | null;
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
  location: ExtendedUserLocation;
  status: LocationStatus;
  errorMessage: string | null;
  isLocationSelectorOpen: boolean;
  setIsLocationSelectorOpen: (open: boolean) => void;
  isLiveTracking: boolean;
  startLiveTracking: () => void;
  stopLiveTracking: () => void;
  requestCurrentLocation: () => Promise<{ success: boolean; locality?: string; location?: ExtendedUserLocation; error?: string }>;
  refreshLocation: () => Promise<{ success: boolean; locality?: string; error?: string }>;
  setManualLocation: (loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number; city?: string; state?: string }) => void;
  getDistanceTo: (targetLat: number, targetLng: number) => { distanceKm: number; distanceText: string };
  localities: LocalityInfo[];
  serviceRegion: typeof JALPAIGURI_SERVICE_REGION;
  isWithinServiceRegion: boolean;
  distanceToServiceRegionKm: number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Robust Reverse Geocoding calling dedicated server-side proxy with fallback
async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  // 1. First priority: Server-side dedicated proxy route
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
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
    }
  } catch (serverErr) {
    console.warn('[REVERSE GEOCODE] Server proxy unavailable, trying fallback:', serverErr);
  }

  // 2. Intelligent Regional Fallback: Detect if coordinates belong to known Indian Metros or regions
  const KNOWN_REGIONS = [
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, radiusKm: 80 },
    { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, radiusKm: 70 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, radiusKm: 60 },
    { name: 'Jalpaiguri', state: 'West Bengal', lat: 26.5414, lng: 88.7196, radiusKm: 35 },
    { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953, radiusKm: 40 },
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, radiusKm: 80 },
    { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.2090, radiusKm: 70 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, radiusKm: 70 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, radiusKm: 50 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, radiusKm: 45 },
    { name: 'Madurai', state: 'Tamil Nadu', lat: 9.9252, lng: 78.1198, radiusKm: 40 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, radiusKm: 45 }
  ];

  for (const reg of KNOWN_REGIONS) {
    const d = calculateHaversineDistance(lat, lng, reg.lat, reg.lng);
    if (d <= reg.radiusKm) {
      return {
        formattedName: `${reg.name}, ${reg.state}`,
        locality: reg.name,
        city: reg.name,
        district: reg.name,
        state: reg.state,
        country: 'India',
        pincode: '',
        road: '',
        source: 'regional-resolver'
      };
    }
  }

  // 3. Generic geographic coordinates representation (Never fake Kadamtala!)
  const coordLabel = `Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
  return {
    formattedName: coordLabel,
    locality: coordLabel,
    city: '',
    district: '',
    state: '',
    country: 'India',
    pincode: '',
    road: '',
    source: 'coordinate-fallback'
  };
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<ExtendedUserLocation>(() => {
    try {
      const saved = localStorage.getItem('jpg_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If parsed location is valid and not a stale default Kadamtala without coordinates
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached location:', e);
    }

    // Default initial location: Marked explicitly as unverified default
    return {
      name: JALPAIGURI_DEFAULT_LOCATION.name,
      locality: JALPAIGURI_DEFAULT_LOCATION.locality,
      city: 'Jalpaiguri',
      state: 'West Bengal',
      country: 'India',
      lat: JALPAIGURI_DEFAULT_LOCATION.lat,
      lng: JALPAIGURI_DEFAULT_LOCATION.lng,
      isApproximate: true,
      locationSource: 'manual',
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
      // Prompt specification: enableHighAccuracy: true, timeout: 15000, maximumAge: 0
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = position.coords.accuracy;
          const altitude = position.coords.altitude;
          const speed = position.coords.speed;
          const heading = position.coords.heading;

          // Check accuracy: if > 1000m, flag low accuracy warning
          const isLowAccuracy = accuracy > 1000;
          const accuracyWarning = isLowAccuracy
            ? `Your location accuracy is ±${Math.round(accuracy)}m. Location may be approximate.`
            : null;

          // Perform real reverse geocoding on the EXACT device coordinates
          const geoResult = await reverseGeocodeCoordinates(lat, lng);

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
            accuracy: Math.round(accuracy),
            altitude,
            speed,
            heading,
            addressDetails: geoResult.details,
            isApproximate: false,
            locationSource: 'gps',
            isLowAccuracy,
            accuracyWarning,
            updatedAt: new Date().toISOString()
          };

          setLocation(newLoc);
          setStatus('found');
          setErrorMessage(null);
          console.log(`[DEVICE GPS SUCCESS] ${lat}, ${lng} (±${Math.round(accuracy)}m) -> ${geoResult.formattedName} [${geoResult.city}, ${geoResult.state}]`);
          resolve({ success: true, locality: geoResult.locality, location: newLoc });
        },
        (error) => {
          let userFriendlyError = 'Unable to detect your device location.';
          let newStatus: LocationStatus = 'error';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              userFriendlyError = 'Location permission is turned off. Please enable location access in your browser or device settings.';
              newStatus = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              userFriendlyError = 'GPS signal unavailable. Please ensure location services are enabled on your device.';
              newStatus = 'unavailable';
              break;
            case error.TIMEOUT:
              userFriendlyError = 'Location request timed out. Please tap Try Again.';
              newStatus = 'timeout';
              break;
            default:
              userFriendlyError = error.message || 'Error detecting location.';
              newStatus = 'error';
          }

          setStatus(newStatus);
          setErrorMessage(userFriendlyError);
          console.warn('[DEVICE GPS ERROR]', error.code, userFriendlyError);
          resolve({ success: false, error: userFriendlyError });
        },
        options
      );
    });
  }, []);

  // Location Refresh alias (dedicated function for Profile / Location settings)
  const refreshLocation = useCallback(async () => {
    return await requestCurrentLocation();
  }, [requestCurrentLocation]);

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
          // If moved significantly or if previous location was manual, update
          const dist = calculateHaversineDistance(prev.lat, prev.lng, lat, lng);
          if (dist > 0.05 || prev.locationSource !== 'gps') {
            reverseGeocodeCoordinates(lat, lng).then((geo) => {
              setLocation({
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
            locationSource: 'gps',
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
        maximumAge: 0,
        timeout: 15000
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
    if (typeof window !== 'undefined' && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
        if (result.state === 'granted') {
          requestCurrentLocation();
        }
      }).catch(() => {});
    }
  }, [requestCurrentLocation]);

  // Set manual location selection without locking user permanently
  const setManualLocation = useCallback((loc: LocalityInfo | { name: string; locality: string; lat: number; lng: number; city?: string; state?: string }) => {
    stopLiveTracking();
    const localityName = 'shortName' in loc ? loc.shortName : loc.locality;
    const rawName = loc.name;
    const city = 'city' in loc && loc.city ? loc.city : 'Jalpaiguri';
    const state = 'state' in loc && loc.state ? loc.state : 'West Bengal';

    const newLoc: ExtendedUserLocation = {
      name: rawName,
      locality: localityName,
      city,
      state,
      country: 'India',
      lat: loc.lat,
      lng: loc.lng,
      isApproximate: true,
      locationSource: 'manual',
      updatedAt: new Date().toISOString()
    };

    setLocation(newLoc);
    setStatus('manual');
    setErrorMessage(null);
    setIsLocationSelectorOpen(false);
  }, [stopLiveTracking]);

  // Calculate distance from user's current GPS/selected location to target
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

  // Separate user location from Jalpaiguri service region
  const isWithinServiceRegion = isWithinJalpaiguriRegion(location.lat, location.lng);
  const distanceToServiceRegionKm = calculateHaversineDistance(
    location.lat,
    location.lng,
    JALPAIGURI_SERVICE_REGION.lat,
    JALPAIGURI_SERVICE_REGION.lng
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
        refreshLocation,
        setManualLocation,
        getDistanceTo,
        localities: JALPAIGURI_LOCALITIES,
        serviceRegion: JALPAIGURI_SERVICE_REGION,
        isWithinServiceRegion,
        distanceToServiceRegionKm
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
