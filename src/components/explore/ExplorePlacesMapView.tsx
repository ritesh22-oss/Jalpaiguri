import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapCanvas,
  Pin,
  useMap
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Star,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Car,
  Footprints,
  Bike,
  Smartphone,
  Info,
  X
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';
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

interface ExplorePlacesMapViewProps {
  places: ExplorePlaceItem[];
  userLat?: number;
  userLng?: number;
  onSelectPlace: (place: ExplorePlaceItem) => void;
}

type TravelMode = 'DRIVE' | 'WALK' | 'BICYCLE';

interface CameraAction {
  id: number;
  type: 'pan' | 'zoomIn' | 'zoomOut';
  center?: { lat: number; lng: number };
  zoom?: number;
}

const ExploreCameraController: React.FC<{ action: CameraAction | null }> = ({ action }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !action) return;
    if (action.type === 'pan' && action.center) {
      map.panTo(action.center);
      if (typeof action.zoom === 'number') map.setZoom(action.zoom);
    } else if (action.type === 'zoomIn') {
      map.setZoom(Math.min((map.getZoom() ?? 14) + 1, 20));
    } else if (action.type === 'zoomOut') {
      map.setZoom(Math.max((map.getZoom() ?? 14) - 1, 3));
    }
  }, [map, action]);
  return null;
};

export const ExplorePlacesMapView: React.FC<ExplorePlacesMapViewProps> = ({
  places,
  userLat = 26.5228,
  userLng = 88.7245,
  onSelectPlace
}) => {
  const { isDarkMode } = useTheme();
  const { apiKey, isLoading: isKeyLoading } = useGoogleMapsApiKey();

  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(places[0]?.id || '');
  const [infoPlaceId, setInfoPlaceId] = useState<string | null>(null);
  const [cameraAction, setCameraAction] = useState<CameraAction | null>(null);
  const seqRef = useRef(0);

  const [showRoute, setShowRoute] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [routeSummary, setRouteSummary] = useState<{ dist: string; dur: string } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || places[0];
  const hasNativeBridge =
    typeof window !== 'undefined' && typeof (window as any).AndroidGoogleAuth?.openNativeMap === 'function';

  const triggerCamera = useCallback((act: Omit<CameraAction, 'id'>) => {
    seqRef.current += 1;
    setCameraAction({ ...act, id: seqRef.current });
  }, []);

  const computeRouteToSelected = useCallback(
    async (place: ExplorePlaceItem, mode: TravelMode) => {
      setIsRouting(true);
      setRouteError(null);
      try {
        const res = await apiClient.computeRoute({
          origin: { lat: userLat, lng: userLng },
          destination: { lat: place.lat, lng: place.lng },
          travelMode: mode
        });
        const first = res.routes?.[0];
        if (first?.polyline?.encodedPolyline) {
          setRoutePath(decodePolyline(first.polyline.encodedPolyline));
          setRouteSummary({
            dist: formatRouteDistance(first.distanceMeters),
            dur: formatRouteDuration(first.duration)
          });
        } else {
          setRoutePath([]);
          setRouteSummary(null);
          setRouteError('No route found for this travel mode.');
        }
      } catch (err: any) {
        console.error('Explore route error:', err);
        setRoutePath([]);
        setRouteSummary(null);
        setRouteError(err?.message || 'Unable to compute route.');
      } finally {
        setIsRouting(false);
      }
    },
    [userLat, userLng]
  );

  const handleMarkerSelect = (place: ExplorePlaceItem) => {
    setSelectedPlaceId(place.id);
    setInfoPlaceId(place.id);
    triggerCamera({ type: 'pan', center: { lat: place.lat, lng: place.lng } });
    if (showRoute) {
      void computeRouteToSelected(place, travelMode);
    }
  };

  const handleToggleRoute = () => {
    if (!selectedPlace) return;
    if (showRoute) {
      setShowRoute(false);
      setRoutePath([]);
      setRouteSummary(null);
    } else {
      setShowRoute(true);
      void computeRouteToSelected(selectedPlace, travelMode);
    }
  };

  const handleOpenNativeMap = () => {
    try {
      const payload = JSON.stringify({
        centerLat: selectedPlace?.lat ?? userLat,
        centerLng: selectedPlace?.lng ?? userLng,
        userLat,
        userLng,
        destinationLat: selectedPlace?.lat ?? null,
        destinationLng: selectedPlace?.lng ?? null,
        destinationName: selectedPlace?.name ?? null
      });
      (window as any).AndroidGoogleAuth.openNativeMap(payload);
    } catch (e) {
      console.error('Failed opening native map:', e);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-xs flex flex-col h-[520px] bg-gray-100 dark:bg-[#0D1612]">
      {/* Google Maps Viewport */}
      <div className="relative flex-1 w-full overflow-hidden">
        {isKeyLoading ? (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
            Loading Google Maps...
          </div>
        ) : !apiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <MapPin className="w-6 h-6 text-[#007AFF] mb-1" />
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
              Google Maps API key is required to display Jalpaiguri basemap.
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
              <ExploreCameraController action={cameraAction} />

              {showRoute && routePath.length >= 2 && (
                <RoutePolylineOverlay path={routePath} strokeColor="#007AFF" strokeWeight={5} fitBounds={true} />
              )}

              {/* User GPS Marker */}
              <AdvancedMarker position={{ lat: userLat, lng: userLng }} title="Your Location">
                <Pin background="#064E3B" borderColor="#FFFFFF" glyphColor="#60A5FA" />
              </AdvancedMarker>

              {/* Places Markers */}
              {places.map((place) => {
                const isSelected = place.id === selectedPlaceId;
                return (
                  <React.Fragment key={place.id}>
                    <AdvancedMarker
                      position={{ lat: place.lat, lng: place.lng }}
                      title={place.name}
                      onClick={() => handleMarkerSelect(place)}
                    >
                      <Pin
                        background={isSelected ? '#007AFF' : '#FFFFFF'}
                        borderColor={isSelected ? '#FFFFFF' : '#007AFF'}
                        glyphColor={isSelected ? '#FFFFFF' : '#007AFF'}
                        scale={isSelected ? 1.2 : 0.95}
                      />
                    </AdvancedMarker>

                    {infoPlaceId === place.id && (
                      <InfoWindow
                        position={{ lat: place.lat, lng: place.lng }}
                        onCloseClick={() => setInfoPlaceId(null)}
                      >
                        <div className="p-1 font-sans max-w-[190px]">
                          <p className="text-xs font-extrabold text-gray-900">{place.name}</p>
                          <p className="text-[10px] text-gray-500">{place.category}</p>
                        </div>
                      </InfoWindow>
                    )}
                  </React.Fragment>
                );
              })}
            </GoogleMapCanvas>
          </MyJpgMapsProvider>
        )}

        {/* Map Top Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
          <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xs border border-gray-200 dark:border-white/10 rounded-full px-3 py-1 shadow-xs flex items-center gap-1.5 text-xs font-bold text-[#007AFF] dark:text-blue-300">
            <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
            <span>Jalpaiguri Google Map</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
              ({places.length} pins)
            </span>
          </div>
        </div>

        {/* Right Zoom / GPS Controls */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={() => triggerCamera({ type: 'zoomIn' })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerCamera({ type: 'zoomOut' })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => triggerCamera({ type: 'pan', center: { lat: userLat, lng: userLng }, zoom: 14 })}
            className="w-8 h-8 rounded-xl bg-white/95 dark:bg-[#0F172A]/95 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm text-[#007AFF] cursor-pointer"
            title="Recenter on GPS"
          >
            <Crosshair className="w-4 h-4" />
          </button>
          {hasNativeBridge && (
            <button
              onClick={handleOpenNativeMap}
              className="w-8 h-8 rounded-xl bg-[#007AFF] text-white flex items-center justify-center shadow-sm cursor-pointer"
              title="Open Native Android Google Maps"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Inline Route Travel Mode Strip */}
      {showRoute && selectedPlace && (
        <div className="px-3 py-2 bg-[#FAF8F5] dark:bg-[#0B1224] border-t border-gray-200 dark:border-white/10 space-y-1.5">
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
                    void computeRouteToSelected(selectedPlace, m.id);
                  }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    travelMode === m.id
                      ? 'bg-[#007AFF] text-white'
                      : 'bg-white dark:bg-[#121E2C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10'
                  }`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {isRouting ? (
                <span className="text-[10px] font-bold text-[#007AFF]">Routing...</span>
              ) : routeError ? (
                <span className="text-[10px] font-bold text-rose-600">{routeError}</span>
              ) : (
                routeSummary && (
                  <span className="text-[11px] font-black text-[#0F172A] dark:text-white">
                    {routeSummary.dur} ({routeSummary.dist})
                  </span>
                )
              )}
              <button
                onClick={handleToggleRoute}
                className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Close route"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {(travelMode === 'WALK' || travelMode === 'BICYCLE') && (
            <div className="flex items-start gap-1 text-[10px] text-amber-800 dark:text-amber-300">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              <span>
                Walking and bicycling routes are in beta and might sometimes be missing sidewalks, pedestrian paths, or bike paths.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Place Card Preview */}
      {selectedPlace && (
        <div
          onClick={() => onSelectPlace(selectedPlace)}
          className="p-3 bg-white dark:bg-[#121E2C] border-t border-gray-200 dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-blue-950/35 transition-colors"
        >
          <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 flex items-center justify-center">
            {selectedPlace.photoUrl ? (
              <img
                src={selectedPlace.photoUrl}
                alt={selectedPlace.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <MapPin className="w-5 h-5 text-[#007AFF]" />
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#007AFF] dark:text-blue-300">
              <span>{selectedPlace.category}</span>
              <span>•</span>
              <div className="flex items-center text-amber-600 dark:text-amber-400">
                <Star className="w-3 h-3 fill-current inline" />
                <span className="ml-0.5">{selectedPlace.rating.toFixed(1)}</span>
              </div>
            </div>

            <h4 className="text-xs font-extrabold text-gray-900 dark:text-white truncate">
              {selectedPlace.name}
            </h4>

            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
              {selectedPlace.formattedAddress}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleRoute();
              }}
              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 cursor-pointer ${
                showRoute
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-blue-50 dark:bg-blue-950 text-[#007AFF] dark:text-blue-300'
              }`}
              title="Route Here"
            >
              <Navigation className="w-3 h-3" />
              <span>Route</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectPlace(selectedPlace);
              }}
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 text-[#007AFF] dark:text-blue-300 flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
