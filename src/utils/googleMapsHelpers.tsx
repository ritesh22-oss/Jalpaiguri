import React, { useEffect, useRef, useState } from 'react';
import { APIProvider, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { apiClient } from '../services/apiClient';

export const GMP_SOLUTION_CHANNEL = 'gmp_mcp_codeassist_v1_aistudio';
export const DEFAULT_GOOGLE_MAP_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_MAPS_MAP_ID) || 'DEMO_MAP_ID';

export const JALPAIGURI_CORE_CENTER = { lat: 26.5228, lng: 88.7245 };

let cachedMapsApiKey: string | null = null;
let inflightKeyPromise: Promise<string> | null = null;

export async function resolveGoogleMapsApiKey(): Promise<string> {
  if (cachedMapsApiKey) return cachedMapsApiKey;

  const envKey =
    typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined) : undefined;
  if (envKey && envKey.trim()) {
    cachedMapsApiKey = envKey.trim();
    return cachedMapsApiKey;
  }

  if (!inflightKeyPromise) {
    inflightKeyPromise = apiClient
      .getGoogleMapsKey()
      .then((res) => {
        const key = res?.apiKey?.trim() || '';
        if (key) cachedMapsApiKey = key;
        return key;
      })
      .catch(() => '')
      .finally(() => {
        inflightKeyPromise = null;
      });
  }
  return inflightKeyPromise;
}

export function useGoogleMapsApiKey(): { apiKey: string; isLoading: boolean } {
  const [apiKey, setApiKey] = useState<string>(cachedMapsApiKey || '');
  const [isLoading, setIsLoading] = useState<boolean>(!cachedMapsApiKey);

  useEffect(() => {
    let active = true;
    if (cachedMapsApiKey) {
      setApiKey(cachedMapsApiKey);
      setIsLoading(false);
      return;
    }
    resolveGoogleMapsApiKey().then((key) => {
      if (!active) return;
      setApiKey(key);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { apiKey, isLoading };
}

export const MyJpgMapsProvider: React.FC<{
  apiKey: string;
  children: React.ReactNode;
}> = ({ apiKey, children }) => {
  const [hasAuthFailed, setHasAuthFailed] = useState(false);

  useEffect(() => {
    const handleAuthFailure = () => setHasAuthFailed(true);
    window.addEventListener('google-maps-auth-failure', handleAuthFailure);
    window.addEventListener('gmp-quota-exceeded', handleAuthFailure);
    return () => {
      window.removeEventListener('google-maps-auth-failure', handleAuthFailure);
      window.removeEventListener('gmp-quota-exceeded', handleAuthFailure);
    };
  }, []);

  if (hasAuthFailed || !apiKey) {
    return (
      <div className="w-full h-full min-h-[320px] bg-[#FAF8F5] dark:bg-[#0B1713] rounded-3xl border border-[#E8E4DA] dark:border-white/10 p-5 flex flex-col justify-between relative overflow-hidden shadow-sm">
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 120 Q 120 80 240 130 T 480 100 T 720 70" fill="none" stroke="#2B7A68" strokeWidth="16" />
          <path d="M 0 60 L 800 60 M 0 180 L 800 180 M 0 240 L 800 240" stroke="#7CB3A1" strokeWidth="1" strokeDasharray="6 6" />
        </svg>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              Jalpaiguri Connected • Interactive Fallback Map
            </span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 px-2 py-0.5 rounded-full">
            Maps Quota / Key Limit Reached
          </span>
        </div>

        <div className="relative z-10 my-4 space-y-2 text-center py-6">
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Google Maps quota limit reached or API key restriction active.
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            You can continue exploring Jalpaiguri locations, landmarks, hospitals, police stations, and transport routes seamlessly using this interactive geographic grid.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: 'Kadamtala Hub', lat: 26.5218, lng: 88.7289, cat: 'Transport' },
            { name: 'Jalpaiguri Sadar Hospital', lat: 26.5182, lng: 88.7184, cat: 'Hospital' },
            { name: 'University of North Bengal', lat: 26.7095, lng: 88.3582, cat: 'Education' },
            { name: 'Jalpaiguri Rajbari', lat: 26.5245, lng: 88.7212, cat: 'Landmark' },
          ].map((loc) => (
            <div
              key={loc.name}
              className="bg-white/95 dark:bg-[#0F172A]/95 border border-[#007AFF]/30 dark:border-blue-500/40 rounded-2xl p-2.5 text-left shadow-xs flex flex-col justify-between"
            >
              <p className="text-xs font-black text-gray-900 dark:text-white truncate">{loc.name}</p>
              <p className="text-[10px] font-semibold text-[#007AFF] dark:text-blue-400 mt-1">{loc.cat}</p>
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl backdrop-blur-xs mt-3">
          <span>📍 Jalpaiguri Town Center (26.5228° N, 88.7245° E)</span>
          <button
            onClick={() => window.location.reload()}
            className="text-[#007AFF] hover:underline font-bold cursor-pointer"
          >
            Retry Maps API
          </button>
        </div>
      </div>
    );
  }

  return (
    <APIProvider
      apiKey={apiKey}
      solutionChannel={GMP_SOLUTION_CHANNEL}
      language="en"
      region="IN"
    >
      {children}
    </APIProvider>
  );
};

/**
 * Decodes a Google encoded polyline string (from Routes API computeRoutes)
 */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  if (!encoded) return [];
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export function formatRouteDuration(durationStr?: string): string {
  if (!durationStr) return '';
  const seconds = parseInt(durationStr.replace('s', ''), 10);
  if (isNaN(seconds)) return durationStr;
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
}

export function formatRouteDistance(meters?: number): string {
  if (typeof meters !== 'number' || isNaN(meters)) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export const RoutePolylineOverlay: React.FC<{
  path: Array<{ lat: number; lng: number }>;
  strokeColor?: string;
  strokeWeight?: number;
  dashed?: boolean;
  fitBounds?: boolean;
}> = ({
  path,
  strokeColor = '#007AFF',
  strokeWeight = 5,
  dashed = false,
  fitBounds = true
}) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (!path || path.length < 2) return;

    const options: google.maps.PolylineOptions = {
      path,
      map,
      strokeColor,
      strokeOpacity: dashed ? 0 : 0.92,
      strokeWeight,
      geodesic: true,
      ...(dashed
        ? {
            icons: [
              {
                icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.85, scale: 3, strokeColor },
                offset: '0',
                repeat: '16px'
              }
            ]
          }
        : {})
    };

    const poly = new mapsLib.Polyline(options);
    polylineRef.current = poly;

    if (fitBounds && typeof google !== 'undefined' && google.maps?.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      path.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 64, right: 48, bottom: 96, left: 48 });
    }

    return () => {
      poly.setMap(null);
      polylineRef.current = null;
    };
  }, [map, mapsLib, path, strokeColor, strokeWeight, dashed, fitBounds]);

  return null;
};
