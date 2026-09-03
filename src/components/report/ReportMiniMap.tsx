import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  MapPin,
  Crosshair,
  Maximize2,
  Minimize2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles
} from 'lucide-react';
import { loadGoogleMapsJsApi } from '../../utils/googleMapsLoader';
import { validateServiceArea } from '../../utils/serviceArea';
import { JALPAIGURI_LOCALITIES } from '../../data/jalpaiguriLocalities';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default center: Jalpaiguri Town Center (Kadamtala / Court More)
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

// Haversine nearest Jalpaiguri landmark calculation
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

export const ReportMiniMap: React.FC<ReportMiniMapProps> = ({
  currentLat,
  currentLng,
  currentLocality,
  onPositionChange,
  onRequestGps,
  isLocating = false
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet' | 'loading'>('loading');
  const [isExpanded, setIsExpanded] = useState(false);
  const [pinLat, setPinLat] = useState(currentLat || DEFAULT_JALPAIGURI_LAT);
  const [pinLng, setPinLng] = useState(currentLng || DEFAULT_JALPAIGURI_LNG);
  const [isInside, setIsInside] = useState(true);

  // References for map instances to allow programmatic recentering
  const googleMapRef = useRef<any>(null);
  const googleMarkerRef = useRef<any>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const leafletMarkerRef = useRef<L.Marker | null>(null);

  // Sync state when props change
  useEffect(() => {
    if (currentLat && currentLng) {
      setPinLat(currentLat);
      setPinLng(currentLng);
      const check = validateServiceArea(currentLat, currentLng);
      setIsInside(check.isInside);

      // Pan Google Map
      if (googleMapRef.current && googleMarkerRef.current) {
        googleMapRef.current.panTo({ lat: currentLat, lng: currentLng });
        if (googleMarkerRef.current.position) {
          googleMarkerRef.current.position = { lat: currentLat, lng: currentLng };
        } else if (googleMarkerRef.current.setPosition) {
          googleMarkerRef.current.setPosition({ lat: currentLat, lng: currentLng });
        }
      }

      // Pan Leaflet Map
      if (leafletMapRef.current && leafletMarkerRef.current) {
        leafletMapRef.current.panTo([currentLat, currentLng]);
        leafletMarkerRef.current.setLatLng([currentLat, currentLng]);
      }
    }
  }, [currentLat, currentLng]);

  // Position change dispatcher
  const handleLocationUpdate = useCallback(
    (lat: number, lng: number) => {
      setPinLat(lat);
      setPinLng(lng);
      const check = validateServiceArea(lat, lng);
      setIsInside(check.isInside);

      const nearest = findNearestLocality(lat, lng);
      let addressString = '';

      if (nearest.distanceKm <= 0.4 && nearest.locality.popularLandmarks.length > 0) {
        addressString = `Near ${nearest.locality.popularLandmarks[0]}, ${nearest.locality.name}, Jalpaiguri, WB - ${nearest.locality.pincode}`;
      } else {
        addressString = `${nearest.locality.name}, Jalpaiguri, West Bengal - ${nearest.locality.pincode}`;
      }

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

  // Initialize Map Engine (Google Maps Platform with Draggable Marker)
  useEffect(() => {
    let isMounted = true;
    let fallbackTimeout: any = null;

    const initMap = async () => {
      if (!containerRef.current) return;

      try {
        // Set timeout to switch to Leaflet if Google Maps takes too long
        fallbackTimeout = setTimeout(() => {
          if (isMounted && mapEngine === 'loading') {
            initLeafletFallback();
          }
        }, 4000);

        const google = await loadGoogleMapsJsApi();
        clearTimeout(fallbackTimeout);
        if (!isMounted || !containerRef.current) return;

        const { Map } = (await (google.maps as any).importLibrary('maps')) as any;
        let markerLib: any = null;
        try {
          markerLib = (await (google.maps as any).importLibrary('marker')) as any;
        } catch {
          // Standard marker fallback
        }

        const initialLat = currentLat || DEFAULT_JALPAIGURI_LAT;
        const initialLng = currentLng || DEFAULT_JALPAIGURI_LNG;

        const map = new Map(containerRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 16,
          mapId: 'JPG_CIVIC_REPORT_MAP', // Enables AdvancedMarkerElement
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          clickableIcons: false
        });

        googleMapRef.current = map;

        // Create draggable marker using AdvancedMarkerElement
        if (markerLib?.AdvancedMarkerElement && markerLib?.PinElement) {
          const pin = new markerLib.PinElement({
            background: '#DC2626',
            borderColor: '#7F1D1D',
            glyphColor: '#FFFFFF',
            scale: 1.3
          });

          const advMarker = new markerLib.AdvancedMarkerElement({
            map,
            position: { lat: initialLat, lng: initialLng },
            gmpDraggable: true,
            title: 'Drag to pinpoint exact issue location',
            content: pin.element
          });

          googleMarkerRef.current = advMarker;

          advMarker.addListener('dragend', () => {
            const pos = advMarker.position;
            if (pos) {
              const pLat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
              const pLng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;
              handleLocationUpdate(Number(pLat), Number(pLng));
            }
          });

          map.addListener('click', (e: any) => {
            if (e.latLng) {
              advMarker.position = e.latLng;
              handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
            }
          });
        } else {
          // Fallback to standard Google Maps Marker
          const stdMarker = new (google.maps as any).Marker({
            map,
            position: { lat: initialLat, lng: initialLng },
            draggable: true,
            title: 'Drag to pinpoint exact issue location',
            animation: (google.maps as any).Animation.DROP
          });

          googleMarkerRef.current = stdMarker;

          stdMarker.addListener('dragend', (e: any) => {
            if (e.latLng) {
              handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
            }
          });

          map.addListener('click', (e: any) => {
            if (e.latLng) {
              stdMarker.setPosition(e.latLng);
              handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        setMapEngine('google');
      } catch {
        if (isMounted) {
          initLeafletFallback();
        }
      }
    };

    const initLeafletFallback = () => {
      if (!containerRef.current || leafletMapRef.current) return;
      try {
        const initialLat = currentLat || DEFAULT_JALPAIGURI_LAT;
        const initialLng = currentLng || DEFAULT_JALPAIGURI_LNG;

        const map = L.map(containerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: true,
          attributionControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        // Custom red pulsing pin icon
        const redIcon = L.divIcon({
          className: 'custom-report-pin',
          html: `<div style="background-color: #DC2626; width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 26]
        });

        const marker = L.marker([initialLat, initialLng], {
          icon: redIcon,
          draggable: true
        }).addTo(map);

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          handleLocationUpdate(pos.lat, pos.lng);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          handleLocationUpdate(e.latlng.lat, e.latlng.lng);
        });

        leafletMapRef.current = map;
        leafletMarkerRef.current = marker;
        setMapEngine('leaflet');
      } catch (err) {
        console.error('Failed to init Leaflet fallback:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [handleLocationUpdate]);

  // Recenter to Jalpaiguri center
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
          {/* Recenter button */}
          <button
            type="button"
            onClick={handleResetCenter}
            className="p-1 rounded-md bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[#55685F] dark:text-[#A2B3AA] hover:bg-[#F0ECE1] transition-colors"
            title="Recenter on Jalpaiguri Town"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Toggle Expand / Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#FAF8F5] dark:bg-white/5 border border-[#E8E4DA] dark:border-white/10 text-[11px] font-semibold text-[#063B2C] dark:text-[#5CE6B0] hover:bg-[#F0ECE1] transition-colors"
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
        className={`relative w-full rounded-2xl overflow-hidden border border-[#D5CEBF] dark:border-white/15 shadow-inner transition-all duration-300 ${
          isExpanded ? 'h-72 sm:h-80' : 'h-48 sm:h-52'
        }`}
      >
        <div ref={containerRef} className="w-full h-full" />

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
                ? 'bg-emerald-800/90 text-emerald-100 border border-emerald-500/30'
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
            <span className="text-rose-600 font-bold">📍</span>
            <span>Drag marker directly over the issue spot</span>
          </div>

          {mapEngine === 'google' ? (
            <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/60 text-[9px] font-mono text-[#55685F] dark:text-white/80 shadow-xs">
              Google Maps
            </div>
          ) : (
            <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-black/60 text-[9px] font-mono text-[#55685F] dark:text-white/80 shadow-xs">
              OpenStreetMap
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
