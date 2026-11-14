import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapCanvas,
  Pin,
  useMap
} from '@vis.gl/react-google-maps';
import {
  Navigation,
  ShieldCheck,
  X,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Crosshair,
  MapPin,
  Car,
  Footprints,
  Bike,
  Info
} from 'lucide-react';
import { NearbyItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import apiClient from '../../services/apiClient';
import {
  DEFAULT_GOOGLE_MAP_ID,
  GMP_SOLUTION_CHANNEL,
  MyJpgMapsProvider,
  RoutePolylineOverlay,
  decodePolyline,
  formatRouteDistance,
  formatRouteDuration,
  useGoogleMapsApiKey
} from '../../utils/googleMapsHelpers';

interface NearbyGoogleMapPanelProps {
  items: NearbyItem[];
  userLat: number;
  userLng: number;
  selectedMarkerItem: NearbyItem | null;
  onSelectMarker: (item: NearbyItem | null) => void;
  onAction: (item: NearbyItem) => void;
}

type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE';

interface CamCmd {
  id: number;
  type: 'pan' | 'zoomIn' | 'zoomOut';
  center?: { lat: number; lng: number };
  zoom?: number;
}

const NearbyCameraSync: React.FC<{ cmd: CamCmd | null }> = ({ cmd }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !cmd) return;
    if (cmd.type === 'pan' && cmd.center) {
      map.panTo(cmd.center);
      if (typeof cmd.zoom === 'number') map.setZoom(cmd.zoom);
    } else if (cmd.type === 'zoomIn') {
      map.setZoom(Math.min((map.getZoom() ?? 14) + 1, 20));
    } else if (cmd.type === 'zoomOut') {
      map.setZoom(Math.max((map.getZoom() ?? 14) - 1, 3));
    }
  }, [map, cmd]);
  return null;
};

export const NearbyGoogleMapPanel: React.FC<NearbyGoogleMapPanelProps> = ({
  items,
  userLat,
  userLng,
  selectedMarkerItem,
  onSelectMarker,
  onAction
}) => {
  const { isDarkMode } = useTheme();
  const { apiKey, isLoading } = useGoogleMapsApiKey();
  const [camCmd, setCamCmd] = useState<CamCmd | null>(null);
  const seqRef = useRef(0);

  const [showRoute, setShowRoute] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [routeMeta, setRouteMeta] = useState<{ dist: string; dur: string } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const triggerCam = useCallback((cmd: Omit<CamCmd, 'id'>) => {
    seqRef.current += 1;
    setCamCmd({ ...cmd, id: seqRef.current });
  }, []);

  const fetchRoute = useCallback(
    async (item: NearbyItem, mode: TravelMode) => {
      setIsRouting(true);
      setRouteError(null);
      try {
        const res = await apiClient.computeRoute({
          origin: { lat: userLat, lng: userLng },
          destination: { lat: item.lat, lng: item.lng },
          travelMode: mode
        });
        const first = res.routes?.[0];
        if (first?.polyline?.encodedPolyline) {
          setRoutePath(decodePolyline(first.polyline.encodedPolyline));
          setRouteMeta({
            dist: formatRouteDistance(first.distanceMeters),
            dur: formatRouteDuration(first.duration)
          });
        } else {
          setRoutePath([]);
          setRouteMeta(null);
          setRouteError('No route available.');
        }
      } catch (err: any) {
        console.error('Nearby route compute error:', err);
        setRoutePath([]);
        setRouteMeta(null);
        setRouteError(err?.message || 'Unable to compute route.');
      } finally {
        setIsRouting(false);
      }
    },
    [userLat, userLng]
  );

  const handleSelectItem = (item: NearbyItem) => {
    onSelectMarker(item);
    triggerCam({ type: 'pan', center: { lat: item.lat, lng: item.lng } });
    if (showRoute) {
      void fetchRoute(item, travelMode);
    }
  };

  return (
    <div className="relative w-full h-[520px] bg-slate-100 dark:bg-[#131F1A] rounded-3xl overflow-hidden border border-[#D2CEBE] dark:border-white/10 shadow-md flex flex-col justify-between">
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
            Loading Google Maps...
          </div>
        ) : !apiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <MapPin className="w-6 h-6 text-[#007AFF] mb-1" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Google Maps API key required
            </p>
          </div>
        ) : (
          <MyJpgMapsProvider apiKey={apiKey}>
            <GoogleMapCanvas
              mapId={DEFAULT_GOOGLE_MAP_ID}
              defaultCenter={{ lat: userLat, lng: userLng }}
              defaultZoom={14}
              mapTypeId="roadmap"
              colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
              gestureHandling="greedy"
              disableDefaultUI={true}
              clickableIcons={true}
              internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
              className="w-full h-full"
            >
              <NearbyCameraSync cmd={camCmd} />

              {showRoute && routePath.length >= 2 && (
                <RoutePolylineOverlay path={routePath} strokeColor="#007AFF" strokeWeight={5} fitBounds={true} />
              )}

              {/* User GPS Pin */}
              <AdvancedMarker position={{ lat: userLat, lng: userLng }} title="Your GPS Location">
                <Pin background="#064E3B" borderColor="#FFFFFF" glyphColor="#60A5FA" />
              </AdvancedMarker>

              {/* Filtered Directory Service Pins */}
              {items.slice(0, 30).map((item) => {
                const isSelected = selectedMarkerItem?.id === item.id;
                return (
                  <AdvancedMarker
                    key={item.id}
                    position={{ lat: item.lat, lng: item.lng }}
                    title={item.name}
                    onClick={() => handleSelectItem(item)}
                  >
                    <Pin
                      background={isSelected ? '#007AFF' : '#FFFFFF'}
                      borderColor={isSelected ? '#FFFFFF' : '#007AFF'}
                      glyphColor={isSelected ? '#FFFFFF' : '#007AFF'}
                      scale={isSelected ? 1.2 : 0.95}
                    />
                  </AdvancedMarker>
                );
              })}

              {selectedMarkerItem && (
                <InfoWindow
                  position={{ lat: selectedMarkerItem.lat, lng: selectedMarkerItem.lng }}
                  onCloseClick={() => onSelectMarker(null)}
                >
                  <div className="p-1 font-sans max-w-[180px]">
                    <p className="text-xs font-extrabold text-gray-900">{selectedMarkerItem.name}</p>
                    <p className="text-[10px] text-gray-500">{selectedMarkerItem.subcategory}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMapCanvas>
          </MyJpgMapsProvider>
        )}
      </div>

      {/* Map Top Controls */}
      <div className="relative z-20 p-3 flex items-start justify-between pointer-events-none">
        <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#E8E4DA] dark:border-white/10 text-[11px] font-bold text-[#11241C] dark:text-white shadow-xs flex items-center gap-1.5 pointer-events-auto">
          <Navigation className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#38BDF8]" />
          <span>Tap any pin to inspect nearby service</span>
        </div>

        <div className="flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={() => triggerCam({ type: 'zoomIn' })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerCam({ type: 'zoomOut' })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerCam({ type: 'pan', center: { lat: userLat, lng: userLng }, zoom: 14 })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center shadow-sm text-[#007AFF] cursor-pointer"
            title="Recenter on GPS"
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Selected Result Bottom Sheet */}
      {selectedMarkerItem && (
        <div className="relative z-30 m-3 bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E8E4DA] dark:border-white/10 shadow-xl space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-[#38BDF8] uppercase">
                  {selectedMarkerItem.subcategory}
                </span>
                {selectedMarkerItem.verified && (
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <h4 className="text-sm font-extrabold text-[#0F172A] dark:text-white">
                {selectedMarkerItem.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                {selectedMarkerItem.area} • {selectedMarkerItem.distanceText}
              </p>
            </div>
            <button
              onClick={() => {
                onSelectMarker(null);
                setShowRoute(false);
                setRoutePath([]);
                setRouteMeta(null);
              }}
              className="p-1 text-slate-500 dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {showRoute && (
            <div className="space-y-1.5 pt-1 border-t border-[#F0ECE1] dark:border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {(
                    [
                      { id: 'DRIVE', label: 'Drive', icon: <Car className="w-3 h-3" /> },
                      { id: 'WALK', label: 'Walk', icon: <Footprints className="w-3 h-3" /> },
                      { id: 'BICYCLE', label: 'Cycle', icon: <Bike className="w-3 h-3" /> }
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setTravelMode(m.id);
                        void fetchRoute(selectedMarkerItem, m.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                        travelMode === m.id
                          ? 'bg-[#007AFF] text-white'
                          : 'bg-[#FAF8F5] dark:bg-white/5 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
                <span className="text-[11px] font-black text-[#007AFF]">
                  {isRouting ? 'Routing...' : routeError ? routeError : routeMeta ? `${routeMeta.dur} • ${routeMeta.dist}` : ''}
                </span>
              </div>
              {(travelMode === 'WALK' || travelMode === 'BICYCLE') && (
                <p className="text-[10px] text-amber-800 dark:text-amber-300 flex items-start gap-1">
                  <Info className="w-3 h-3 shrink-0 mt-0.5" />
                  <span>
                    Walking and bicycling routes are in beta and might sometimes be missing sidewalks, pedestrian paths, or bike paths.
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#007AFF] dark:text-[#38BDF8] truncate">
              {selectedMarkerItem.startingPrice ||
                selectedMarkerItem.salary ||
                selectedMarkerItem.openStatus ||
                'Available Now'}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  const next = !showRoute;
                  setShowRoute(next);
                  if (next) {
                    void fetchRoute(selectedMarkerItem, travelMode);
                  } else {
                    setRoutePath([]);
                    setRouteMeta(null);
                  }
                }}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#007AFF] dark:text-blue-300 text-xs font-bold cursor-pointer"
              >
                {showRoute ? 'Hide Route' : 'Route'}
              </button>
              <button
                onClick={() => onAction(selectedMarkerItem)}
                className="bg-[#007AFF] dark:bg-blue-600 text-white hover:bg-blue-700 px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>{selectedMarkerItem.primaryActionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
