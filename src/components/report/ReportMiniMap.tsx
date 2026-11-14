import React, { useCallback, useEffect, useState } from 'react';
import { AdvancedMarker, Map as GoogleMapCanvas, Pin, useMap } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { validateServiceArea } from '../../utils/serviceArea';
import { JALPAIGURI_LOCALITIES } from '../../data/jalpaiguriLocalities';
import {
  DEFAULT_GOOGLE_MAP_ID,
  GMP_SOLUTION_CHANNEL,
  MyJpgMapsProvider,
  useGoogleMapsApiKey
} from '../../utils/googleMapsHelpers';

const DEFAULT_JALPAIGURI_LAT = 26.5228;
const DEFAULT_JALPAIGURI_LNG = 88.7245;

export interface MapPositionUpdate {
  lat: number;
  lng: number;
  locality: string;
  formattedAddress: string;
  isInsideJalpaiguri: boolean;
}

interface ReportMiniMapProps {
  currentLat: number;
  currentLng: number;
  currentLocality?: string;
  onPositionChange: (update: MapPositionUpdate) => void;
  onRequestGps?: () => void;
  isLocating?: boolean;
}

function findNearestLocality(lat: number, lng: number) {
  let closest = JALPAIGURI_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of JALPAIGURI_LOCALITIES) {
    const dLat = ((loc.lat - lat) * Math.PI) / 180;
    const dLng = ((loc.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((loc.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c;
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return { locality: closest, distanceKm: minDistance };
}

const MiniMapCameraSync: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.panTo({ lat, lng });
  }, [map, lat, lng]);
  return null;
};

export const ReportMiniMap: React.FC<ReportMiniMapProps> = ({
  currentLat,
  currentLng,
  onPositionChange
}) => {
  const { apiKey, isLoading } = useGoogleMapsApiKey();
  const [isExpanded, setIsExpanded] = useState(false);
  const [pinLat, setPinLat] = useState(currentLat || DEFAULT_JALPAIGURI_LAT);
  const [pinLng, setPinLng] = useState(currentLng || DEFAULT_JALPAIGURI_LNG);
  const [isInside, setIsInside] = useState(true);

  useEffect(() => {
    if (currentLat && currentLng) {
      setPinLat(currentLat);
      setPinLng(currentLng);
      setIsInside(validateServiceArea(currentLat, currentLng).isInside);
    }
  }, [currentLat, currentLng]);

  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      setPinLat(lat);
      setPinLng(lng);
      const check = validateServiceArea(lat, lng);
      setIsInside(check.isInside);

      const nearest = findNearestLocality(lat, lng);
      const addressString =
        nearest.distanceKm <= 0.4 && nearest.locality.popularLandmarks.length > 0
          ? `Near ${nearest.locality.popularLandmarks[0]}, ${nearest.locality.name}, Jalpaiguri, WB - ${nearest.locality.pincode}`
          : `${nearest.locality.name}, Jalpaiguri, West Bengal - ${nearest.locality.pincode}`;

      onPositionChange({
        lat,
        lng,
        locality: nearest.locality.name,
        formattedAddress: addressString,
        isInsideJalpaiguri: check.isInside
      });
    },
    [onPositionChange]
  );

  const handleResetCenter = () => {
    handleLocationUpdate(DEFAULT_JALPAIGURI_LAT, DEFAULT_JALPAIGURI_LNG);
  };

  return (
    <div className="space-y-2">
      {/* Map Control Bar */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#11241C] dark:text-white">
          <MapPin className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
          <span>Interactive Pinpoint Map</span>
          <span className="text-[10px] font-normal text-[#55685F] dark:text-[#9FB2A8]">
            (Drag pin or tap map)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleResetCenter}
            className="p-1 rounded-md bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
            title="Recenter on Jalpaiguri Town"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[11px] font-semibold text-[#007AFF] dark:text-[#93C5FD] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-[#D5CEBF] dark:border-white/15 shadow-inner transition-all duration-300 bg-slate-100 ${
          isExpanded ? 'h-72 sm:h-80' : 'h-48 sm:h-52'
        }`}
      >
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
            Loading Google Maps...
          </div>
        ) : !apiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <MapPin className="w-5 h-5 text-rose-500 mb-1" />
            <p className="text-xs font-bold text-gray-700">Google Maps API Key Required</p>
          </div>
        ) : (
          <MyJpgMapsProvider apiKey={apiKey}>
            <GoogleMapCanvas
              mapId={DEFAULT_GOOGLE_MAP_ID}
              defaultCenter={{ lat: pinLat, lng: pinLng }}
              defaultZoom={16}
              gestureHandling="greedy"
              disableDefaultUI={true}
              zoomControl={true}
              clickableIcons={false}
              internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
              onClick={(ev) => {
                const ll = ev?.detail?.latLng;
                if (ll) handleLocationUpdate(ll.lat, ll.lng);
              }}
              className="w-full h-full"
            >
              <MiniMapCameraSync lat={pinLat} lng={pinLng} />
              <AdvancedMarker
                position={{ lat: pinLat, lng: pinLng }}
                draggable={true}
                title="Drag to pinpoint exact issue location"
                onDragEnd={(ev) => {
                  const ll = ev?.latLng;
                  if (ll) {
                    const pLat = typeof ll.lat === 'function' ? ll.lat() : ll.lat;
                    const pLng = typeof ll.lng === 'function' ? ll.lng() : ll.lng;
                    handleLocationUpdate(Number(pLat), Number(pLng));
                  }
                }}
              >
                <Pin background="#DC2626" borderColor="#7F1D1D" glyphColor="#FFFFFF" scale={1.2} />
              </AdvancedMarker>
            </GoogleMapCanvas>
          </MyJpgMapsProvider>
        )}

        {/* Floating Coordinates & Status Badge */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-mono shadow-md flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>
              {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
            </span>
          </div>

          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-md backdrop-blur-md flex items-center gap-1 ${
              isInside
                ? 'bg-blue-800/90 text-blue-100 border border-blue-500/30'
                : 'bg-rose-900/90 text-rose-100 border border-rose-500/30'
            }`}
          >
            {isInside ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>In Jalpaiguri</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>Outside Boundary</span>
              </>
            )}
          </div>
        </div>

        {/* Bottom Floating Hint */}
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-10 flex items-center justify-between">
          <div className="px-2 py-1 rounded-md bg-white/90 dark:bg-[#121E19]/90 backdrop-blur-xs text-[10px] font-medium text-[#11241C] dark:text-[#E2EBE6] shadow-xs border border-black/5 dark:border-white/10 flex items-center gap-1">
            <span className="text-rose-600 font-bold">Pin:</span>
            <span>Drag marker directly over the issue spot</span>
          </div>
        </div>
      </div>
    </div>
  );
};
