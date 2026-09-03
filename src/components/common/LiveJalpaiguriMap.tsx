import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNav } from '../../context/NavigationContext';
import { JALPAIGURI_SERVICE_REGION } from '../../data/jalpaiguriLocalities';

interface LiveJalpaiguriMapProps {
  className?: string;
  height?: number;
  showDetails?: boolean;
}

export const LiveJalpaiguriMap: React.FC<LiveJalpaiguriMapProps> = ({
  className = '',
  height = 220,
  showDetails = true
}) => {
  const { location, requestCurrentLocation, status, isWithinServiceRegion, distanceToServiceRegionKm } = useLocation();
  const { navigate } = useNav();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const jalpaiguriMarkerRef = useRef<L.Marker | null>(null);
  const connectingLineRef = useRef<L.Polyline | null>(null);

  const [activeView, setActiveView] = useState<'user' | 'jalpaiguri' | 'both'>('user');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [location.lat, location.lng],
        zoom: isWithinServiceRegion ? 14 : 12,
        zoomControl: false,
        attributionControl: false
      });

      // Standard crisp OpenStreetMap tiles
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 2
      }).addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Centering when location or activeView changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 1. Create or update User marker
    const userIcon = L.divIcon({
      className: 'user-location-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping-slow 2s infinite;"></div>
          <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #064E3B; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background: #34D399;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lng]);
    } else {
      const marker = L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #064E3B; font-size: 12px;">📍 You are here</strong>
          <p style="margin: 2px 0 0; font-size: 11px; color: #374151;">${location.name}</p>
          <span style="font-size: 10px; color: #6B7280;">(${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})</span>
        </div>
      `);
      userMarkerRef.current = marker;
    }

    // 2. Jalpaiguri Civic Hub Marker
    const jalpaiguriIcon = L.divIcon({
      className: 'jalpaiguri-hub-pin',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="width: 26px; height: 26px; border-radius: 8px; background: #1E3A8A; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px;">
            🏛️
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    if (!jalpaiguriMarkerRef.current) {
      const jMarker = L.marker([JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng], {
        icon: jalpaiguriIcon
      }).addTo(map);
      jMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #1E3A8A; font-size: 12px;">🏛️ Jalpaiguri Civic Hub</strong>
          <p style="margin: 2px 0 0; font-size: 11px; color: #374151;">Municipality & District Headquarters</p>
          <span style="font-size: 10px; color: #6B7280;">West Bengal, India</span>
        </div>
      `);
      jalpaiguriMarkerRef.current = jMarker;
    }

    // 3. Connecting trajectory line if outside Jalpaiguri
    if (!isWithinServiceRegion) {
      const latlngs: [number, number][] = [
        [location.lat, location.lng],
        [JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng]
      ];

      if (connectingLineRef.current) {
        connectingLineRef.current.setLatLngs(latlngs);
      } else {
        connectingLineRef.current = L.polyline(latlngs, {
          color: '#059669',
          weight: 2.5,
          dashArray: '6, 6',
          opacity: 0.7
        }).addTo(map);
      }
    } else if (connectingLineRef.current) {
      connectingLineRef.current.remove();
      connectingLineRef.current = null;
    }

    // 4. Adjust camera based on active view mode
    if (activeView === 'user') {
      map.setView([location.lat, location.lng], isWithinServiceRegion ? 14 : 12, { animate: true });
    } else if (activeView === 'jalpaiguri') {
      map.setView([JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng], 13, { animate: true });
    } else if (activeView === 'both') {
      const bounds = L.latLngBounds([
        [location.lat, location.lng],
        [JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng]
      ]);
      map.fitBounds(bounds, { padding: [30, 30], animate: true });
    }

    // Invalidate size in case parent dimensions rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [location.lat, location.lng, activeView, isWithinServiceRegion]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleCenterOnMe = async () => {
    setActiveView('user');
    setIsLocating(true);
    await requestCurrentLocation();
    setIsLocating(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], isWithinServiceRegion ? 15 : 13, { animate: true });
    }
  };

  const handleCenterOnJalpaiguri = () => {
    setActiveView('jalpaiguri');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([JALPAIGURI_SERVICE_REGION.lat, JALPAIGURI_SERVICE_REGION.lng], 13, { animate: true });
    }
  };

  return (
    <div className={`bg-white border border-[#E8E4DA] rounded-3xl overflow-hidden shadow-xs ${className}`}>
      {/* Header Bar */}
      <div className="px-4 py-3 border-b border-[#F0ECE1] flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#063B2C]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black text-[#11241C] tracking-tight">
                Live Jalpaiguri Civic Map
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            </div>
            <p className="text-[10px] text-[#55685F] font-semibold">
              Live device location & civic service radius
            </p>
          </div>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E4DA]">
          <button
            onClick={handleCenterOnMe}
            className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
              activeView === 'user' ? 'bg-[#063B2C] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
            }`}
            title="Focus on your real coordinates"
          >
            My GPS
          </button>
          <button
            onClick={handleCenterOnJalpaiguri}
            className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
              activeView === 'jalpaiguri' ? 'bg-[#063B2C] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
            }`}
            title="Focus on Jalpaiguri civic hub"
          >
            Jalpaiguri
          </button>
          {!isWithinServiceRegion && (
            <button
              onClick={() => setActiveView('both')}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                activeView === 'both' ? 'bg-[#063B2C] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
              }`}
              title="View your distance to Jalpaiguri"
            >
              Route
            </button>
          )}
        </div>
      </div>

      {/* Map Container Viewport */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#E5E7EB]" />

        {/* Floating Controls Overlay */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5 shadow-md">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCenterOnMe}
            disabled={isLocating}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-200 text-[#063B2C] flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            title="Recenter on My Location"
            aria-label="Recenter on My Location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={() => navigate('maps-explorer')}
            className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-xs border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Open Fullscreen Explorer"
            aria-label="Open Fullscreen Explorer"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Floating "You Are Here" Badge on Map */}
        <div className="absolute left-3 bottom-3 z-10 max-w-[78%] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span className="text-[11px] font-extrabold text-[#11241C] truncate">
              📍 You: {location.locality || location.city || 'Current GPS'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Location Status & Distance Information */}
      {showDetails && (
        <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#063B2C] shrink-0" />
              <span className="font-bold text-[#11241C] truncate">
                {location.name}
              </span>
            </div>

            {location.locationSource === 'gps' ? (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>GPS {location.accuracy ? `±${location.accuracy}m` : 'Active'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                Manual Selection
              </span>
            )}
          </div>

          {/* Regional Context Banner */}
          {isWithinServiceRegion ? (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-900 font-semibold">
              <span>Within Jalpaiguri municipal service area</span>
              <span className="text-[10px] font-bold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md">
                Local Resident
              </span>
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between text-[11px] text-amber-900 gap-2">
              <div className="space-y-0.5">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Outside Jalpaiguri Region ({Math.round(distanceToServiceRegionKm).toLocaleString()} km away)</span>
                </p>
                <p className="text-[10px] text-amber-800">
                  You are viewing Jalpaiguri Connect in remote citizen mode.
                </p>
              </div>
              <button
                onClick={() => navigate('maps-explorer')}
                className="text-[10px] font-extrabold text-amber-950 bg-amber-200/80 hover:bg-amber-200 px-2 py-1 rounded-md shrink-0 cursor-pointer"
              >
                Explore Hub
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
