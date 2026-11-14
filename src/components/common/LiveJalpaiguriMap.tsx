import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapCanvas,
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Compass,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  ShieldCheck,
  AlertCircle,
  X,
  Search,
  ArrowLeft,
  Car,
  Footprints,
  Bike,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Info,
  Loader2,
  ExternalLink,
  Route as RouteIcon,
  Building2,
  Milestone,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Share2,
  RotateCw,
  Layers,
  Eye,
  WifiOff,
  CheckCircle2
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNav } from '../../context/NavigationContext';
import { JALPAIGURI_SERVICE_REGION } from '../../data/jalpaiguriLocalities';
import apiClient, {
  ApiClientError,
  AutocompletePredictionItem,
  GooglePlaceNewResult,
  JourneyPreviewStop,
  NearbyPoiSummary,
  ReverseGeocodeResponse,
  RouteStepSummary
} from '../../services/apiClient';
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
import { StreetExplorerTarget, StreetViewExplorerModal } from './StreetViewExplorerModal';

interface LiveJalpaiguriMapProps {
  className?: string;
  height?: number;
  showDetails?: boolean;
  searchQuery?: string;
}

type TravelMode = 'DRIVE' | 'TWO_WHEELER' | 'WALK' | 'BICYCLE';
type MapViewMode = 'standard' | 'satellite' | '3d';

interface SavedPlaceEntry {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
  savedAt: number;
}

interface RouteOptionSummary {
  description: string;
  distanceMeters: number;
  durationText: string;
  encodedPolyline: string;
  points: Array<{ lat: number; lng: number }>;
  steps: RouteStepSummary[];
}

const SAVED_PLACES_STORAGE_KEY = 'myjpg_saved_places_v1';
const CACHED_ROUTES_STORAGE_KEY = 'myjpg_cached_routes_v1';

interface DestinationPoint {
  placeId?: string;
  name: string;
  address?: string;
  category?: string;
  lat: number;
  lng: number;
}

interface InspectedPoint {
  kind: 'poi' | 'road' | 'locality' | 'coordinate';
  title: string;
  category: string;
  formattedAddress: string;
  road: string;
  locality: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  placeId?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  nearbyPlaces: NearbyPoiSummary[];
  landmarks: Array<{ name: string; description?: string; distanceMeters?: number; placeId?: string }>;
  source: string;
  isLoading?: boolean;
  error?: string | null;
}

interface CameraCommand {
  id: number;
  type: 'pan' | 'bounds' | 'zoomIn' | 'zoomOut' | 'rotate3d';
  center?: { lat: number; lng: number };
  zoom?: number;
  tilt?: number;
  heading?: number;
  points?: Array<{ lat: number; lng: number }>;
}

function createSessionToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `myjpg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function formatDistanceFromKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function extractAddressComponent(components: any[] | undefined, type: string): string {
  if (!Array.isArray(components)) return '';
  const match = components.find((c: any) => Array.isArray(c.types) && c.types.includes(type));
  return match?.longText || match?.shortText || '';
}

const MapCameraController: React.FC<{
  command: CameraCommand | null;
  viewMode: MapViewMode;
}> = ({ command, viewMode }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (viewMode === '3d') {
      map.setTilt(58);
      map.setHeading((map.getHeading() ?? 0) || 25);
      const z = map.getZoom() ?? 15;
      if (z < 17) map.setZoom(17.2);
    } else {
      map.setTilt(0);
      map.setHeading(0);
    }
  }, [map, viewMode]);

  useEffect(() => {
    if (!map || !command) return;

    if (command.type === 'pan' && command.center) {
      map.panTo(command.center);
      if (typeof command.zoom === 'number') {
        map.setZoom(command.zoom);
      }
      if (typeof command.tilt === 'number') {
        map.setTilt(command.tilt);
      }
      if (typeof command.heading === 'number') {
        map.setHeading(command.heading);
      }
    } else if (command.type === 'bounds' && command.points && command.points.length >= 2) {
      if (typeof google !== 'undefined' && google.maps?.LatLngBounds) {
        const bounds = new google.maps.LatLngBounds();
        command.points.forEach((pt) => bounds.extend(pt));
        map.fitBounds(bounds, { top: 56, right: 48, bottom: 84, left: 48 });
      }
    } else if (command.type === 'zoomIn') {
      const current = map.getZoom() ?? 14;
      map.setZoom(Math.min(current + 1, 20));
    } else if (command.type === 'zoomOut') {
      const current = map.getZoom() ?? 14;
      map.setZoom(Math.max(current - 1, 3));
    } else if (command.type === 'rotate3d') {
      const currHeading = map.getHeading() ?? 0;
      map.setHeading((currHeading + 45) % 360);
      map.setTilt(60);
    }
  }, [map, command]);

  return null;
};

const RemoteTrajectoryOverlay: React.FC<{
  show: boolean;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}> = ({ show, from, to }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const lineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;
    if (lineRef.current) {
      lineRef.current.setMap(null);
      lineRef.current = null;
    }
    if (!show) return;

    const poly = new mapsLib.Polyline({
      path: [from, to],
      map,
      geodesic: true,
      strokeOpacity: 0,
      strokeWeight: 2.5,
      icons: [
        {
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, scale: 3, strokeColor: '#059669' },
          offset: '0',
          repeat: '14px'
        }
      ]
    });
    lineRef.current = poly;

    return () => {
      poly.setMap(null);
      lineRef.current = null;
    };
  }, [map, mapsLib, show, from.lat, from.lng, to.lat, to.lng]);

  return null;
};

export const LiveJalpaiguriMap: React.FC<LiveJalpaiguriMapProps> = ({
  className = '',
  height = 220,
  showDetails = true,
  searchQuery = ''
}) => {
  const {
    location,
    requestCurrentLocation,
    isWithinServiceRegion,
    distanceToServiceRegionKm,
    setManualLocation
  } = useLocation();
  const { navigate } = useNav();
  const { apiKey, isLoading: isKeyLoading } = useGoogleMapsApiKey();

  const safeLat = location?.lat ?? 26.5265;
  const safeLng = location?.lng ?? 88.723;
  const safeName = location?.name ?? 'Jalpaiguri Sadar';
  const safeLocality = location?.locality ?? location?.city ?? 'Current GPS';

  const [activeView, setActiveView] = useState<'user' | 'jalpaiguri' | 'both'>('user');
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>('standard');
  const [languageCode, setLanguageCode] = useState<'en' | 'bn'>('en');
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [fullscreenSearch, setFullscreenSearch] = useState(searchQuery || '');
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompletePredictionItem[]>([]);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const [searchResults, setSearchResults] = useState<GooglePlaceNewResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [originPoint, setOriginPoint] = useState<DestinationPoint | null>(null);
  const [destination, setDestination] = useState<DestinationPoint | null>(null);
  const [travelMode, setTravelMode] = useState<TravelMode>('DRIVE');
  const [routeAlternatives, setRouteAlternatives] = useState<RouteOptionSummary[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [routePath, setRoutePath] = useState<Array<{ lat: number; lng: number }>>([]);
  const [encodedRoutePolyline, setEncodedRoutePolyline] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [routeDistanceText, setRouteDistanceText] = useState('');
  const [routeDurationText, setRouteDurationText] = useState('');
  const [routeSteps, setRouteSteps] = useState<RouteStepSummary[]>([]);
  const [alongRoutePlaces, setAlongRoutePlaces] = useState<GooglePlaceNewResult[]>([]);
  const [isLoadingAlongRoute, setIsLoadingAlongRoute] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeUsingOfflineCache, setRouteUsingOfflineCache] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const [streetExplorerTarget, setStreetExplorerTarget] = useState<StreetExplorerTarget | null>(null);
  const [journeyStops, setJourneyStops] = useState<JourneyPreviewStop[]>([]);
  const [isLoadingJourneyPreview, setIsLoadingJourneyPreview] = useState(false);
  const [showJourneyTimeline, setShowJourneyTimeline] = useState(false);

  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceEntry[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_PLACES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [openInfoTarget, setOpenInfoTarget] = useState<'user' | 'hub' | 'dest' | 'clicked' | string | null>(null);
  const [inspectedPoint, setInspectedPoint] = useState<InspectedPoint | null>(null);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand | null>(null);
  const cmdSeqRef = useRef(0);

  // Caching & Cancellation Refs
  const tapCacheRef = useRef<Map<string, ReverseGeocodeResponse>>(new Map());
  const tapAbortRef = useRef<AbortController | null>(null);
  const autocompleteAbortRef = useRef<AbortController | null>(null);
  const routeAbortRef = useRef<AbortController | null>(null);
  const sessionTokenRef = useRef<string>(createSessionToken());
  const suppressNextAutocompleteRef = useRef(false);

  const hasNativeMapBridge =
    typeof window !== 'undefined' && typeof (window as any).AndroidGoogleAuth?.openNativeMap === 'function';

  useEffect(() => {
    return () => {
      tapAbortRef.current?.abort();
      autocompleteAbortRef.current?.abort();
      routeAbortRef.current?.abort();
    };
  }, []);

  const issueCamera = useCallback((cmd: Omit<CameraCommand, 'id'>) => {
    cmdSeqRef.current += 1;
    setCameraCommand({ ...cmd, id: cmdSeqRef.current });
  }, []);

  const activeOrigin = useMemo(
    () =>
      originPoint ?? {
        name: safeLocality,
        lat: safeLat,
        lng: safeLng
      },
    [originPoint, safeLocality, safeLat, safeLng]
  );

  const applySelectedRouteOption = useCallback(
    async (option: RouteOptionSummary, dest: DestinationPoint, controller?: AbortController) => {
      setRoutePath(option.points);
      setEncodedRoutePolyline(option.encodedPolyline);
      setRouteDescription(option.description);
      setRouteDistanceText(formatRouteDistance(option.distanceMeters));
      setRouteDurationText(option.durationText);
      setRouteSteps(option.steps);
      setJourneyStops([]);
      setShowJourneyTimeline(false);

      if (!option.encodedPolyline) return;
      setIsLoadingAlongRoute(true);
      try {
        const alongRes = await apiClient.searchPlacesAlongRoute(
          {
            encodedPolyline: option.encodedPolyline,
            textQuery: 'hospital school temple bank pharmacy market restaurant',
            origin: { lat: activeOrigin.lat, lng: activeOrigin.lng },
            maxResultCount: 8,
            languageCode
          },
          { signal: controller?.signal }
        );
        const filtered = (alongRes.places || []).filter(
          (p) => p.location && (!dest.placeId || p.id !== dest.placeId)
        );
        setAlongRoutePlaces(filtered);
      } catch (alongErr: any) {
        if (alongErr?.status !== 499) {
          console.warn('Places along route unavailable:', alongErr?.message);
        }
      } finally {
        setIsLoadingAlongRoute(false);
      }
    },
    [activeOrigin.lat, activeOrigin.lng, languageCode]
  );

  const fetchRouteToDestination = useCallback(
    async (dest: DestinationPoint, mode: TravelMode, customOrigin?: DestinationPoint | null) => {
      const startPt = customOrigin ?? originPoint ?? { name: safeLocality, lat: safeLat, lng: safeLng };
      routeAbortRef.current?.abort();
      const controller = new AbortController();
      routeAbortRef.current = controller;

      setIsRouting(true);
      setRouteError(null);
      setRouteUsingOfflineCache(false);
      setAlongRoutePlaces([]);
      setJourneyStops([]);
      setShowJourneyTimeline(false);

      const cacheKey = `${startPt.lat.toFixed(4)},${startPt.lng.toFixed(4)}->${dest.lat.toFixed(4)},${dest.lng.toFixed(4)}:${mode}`;

      try {
        const res = await apiClient.computeRoute(
          {
            origin: { lat: startPt.lat, lng: startPt.lng },
            destination: { lat: dest.lat, lng: dest.lng },
            travelMode: mode,
            computeAlternativeRoutes: true,
            languageCode
          },
          { signal: controller.signal }
        );

        const options: RouteOptionSummary[] = (res.routes || [])
          .filter((r) => Boolean(r?.polyline?.encodedPolyline))
          .map((r, idx) => ({
            description: r.description || `Route ${idx + 1}`,
            distanceMeters: r.distanceMeters || 0,
            durationText: formatRouteDuration(r.duration),
            encodedPolyline: r.polyline?.encodedPolyline || '',
            points: decodePolyline(r.polyline?.encodedPolyline || ''),
            steps: r.legs?.[0]?.steps || []
          }));

        if (options.length === 0) {
          setRouteAlternatives([]);
          setSelectedRouteIndex(0);
          setRoutePath([]);
          setEncodedRoutePolyline('');
          setRouteDescription('');
          setRouteDistanceText('');
          setRouteDurationText('');
          setRouteSteps([]);
          setRouteError('No route found between start and destination.');
          return;
        }

        setRouteAlternatives(options);
        setSelectedRouteIndex(0);
        setOpenInfoTarget('dest');

        // Save lightweight route steps & summary for offline access (no map imagery stored)
        try {
          const existing = JSON.parse(localStorage.getItem(CACHED_ROUTES_STORAGE_KEY) || '{}');
          existing[cacheKey] = {
            originName: startPt.name,
            destinationName: dest.name,
            option: options[0],
            savedAt: Date.now()
          };
          localStorage.setItem(CACHED_ROUTES_STORAGE_KEY, JSON.stringify(existing));
        } catch {
          // ignore quota errors
        }

        await applySelectedRouteOption(options[0], dest, controller);
      } catch (err: any) {
        if (err instanceof ApiClientError && err.status === 499) return;
        console.error('Google Routes compute failed:', err);

        // Try cached offline route metadata/steps if network failed
        try {
          const existing = JSON.parse(localStorage.getItem(CACHED_ROUTES_STORAGE_KEY) || '{}');
          const cached = existing[cacheKey];
          if (cached?.option) {
            setRouteAlternatives([cached.option]);
            setSelectedRouteIndex(0);
            setRoutePath(cached.option.points || []);
            setEncodedRoutePolyline(cached.option.encodedPolyline || '');
            setRouteDescription(cached.option.description || '');
            setRouteDistanceText(formatRouteDistance(cached.option.distanceMeters));
            setRouteDurationText(cached.option.durationText || '');
            setRouteSteps(cached.option.steps || []);
            setRouteUsingOfflineCache(true);
            setRouteError(null);
            return;
          }
        } catch {
          // ignore
        }

        setRouteAlternatives([]);
        setRoutePath([]);
        setEncodedRoutePolyline('');
        setRouteDescription('');
        setRouteSteps([]);
        setRouteError(err?.message || 'Unable to compute Google Maps route right now.');
      } finally {
        setIsRouting(false);
      }
    },
    [applySelectedRouteOption, languageCode, originPoint, safeLat, safeLng, safeLocality]
  );

  const selectDestination = useCallback(
    async (dest: DestinationPoint, mode: TravelMode = travelMode) => {
      setDestination(dest);
      setSearchResults([]);
      setAutocompleteSuggestions([]);
      setOpenInfoTarget('dest');
      issueCamera({
        type: 'pan',
        center: { lat: dest.lat, lng: dest.lng },
        zoom: mapViewMode === '3d' ? 17.5 : 16,
        tilt: mapViewMode === '3d' ? 58 : 0
      });
      await fetchRouteToDestination(dest, mode);
    },
    [fetchRouteToDestination, issueCamera, mapViewMode, travelMode]
  );

  const handleSwapOriginAndDestination = useCallback(() => {
    if (!destination) return;
    const prevOrigin: DestinationPoint = originPoint ?? {
      name: safeLocality,
      lat: safeLat,
      lng: safeLng
    };
    const nextOrigin = destination;
    const nextDest = prevOrigin;
    setOriginPoint(nextOrigin);
    setDestination(nextDest);
    void fetchRouteToDestination(nextDest, travelMode, nextOrigin);
  }, [destination, fetchRouteToDestination, originPoint, safeLat, safeLng, safeLocality, travelMode]);

  const handleToggleSavePlace = useCallback((place: { id: string; name: string; address: string; category: string; lat: number; lng: number }) => {
    setSavedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id || (Math.abs(p.lat - place.lat) < 0.0002 && Math.abs(p.lng - place.lng) < 0.0002));
      const next = exists
        ? prev.filter((p) => p.id !== place.id && !(Math.abs(p.lat - place.lat) < 0.0002 && Math.abs(p.lng - place.lng) < 0.0002))
        : [{ ...place, savedAt: Date.now() }, ...prev.slice(0, 29)];
      try {
        localStorage.setItem(SAVED_PLACES_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      setActionFeedback(exists ? `Removed "${place.name}" from saved places` : `Saved "${place.name}"`);
      setTimeout(() => setActionFeedback(null), 2600);
      return next;
    });
  }, []);

  const handleSharePlace = useCallback(async (title: string, address: string, lat: number, lng: number) => {
    const shareText = `${title}\n${address}\nCoordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title, text: shareText });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setActionFeedback('Location details copied to clipboard');
        setTimeout(() => setActionFeedback(null), 2600);
      }
    } catch {
      // User cancelled share dialog
    }
  }, []);

  const handlePreviewJourney = useCallback(async () => {
    if (!encodedRoutePolyline || !destination) return;
    setIsLoadingJourneyPreview(true);
    setShowJourneyTimeline(true);
    try {
      const res = await apiClient.getJourneyStreetPreview({
        encodedPolyline: encodedRoutePolyline,
        originName: activeOrigin.name,
        destinationName: destination.name,
        maxStops: 8
      });

      let finalStops = res.stops || [];

      // If server metadata key restricts Street View Static API, probe stops authentically via loaded Google Maps JS StreetViewService
      if (res.metadataDenied && typeof google !== 'undefined' && google.maps?.StreetViewService && finalStops.length > 0) {
        const sv = new google.maps.StreetViewService();
        finalStops = await Promise.all(
          finalStops.map(
            (stop) =>
              new Promise<JourneyPreviewStop>((resolve) => {
                sv.getPanorama(
                  {
                    location: { lat: stop.lat, lng: stop.lng },
                    radius: 65,
                    source: google.maps.StreetViewSource.OUTDOOR
                  },
                  (data, st) => {
                    if (st === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                      resolve({
                        ...stop,
                        panoLat: data.location.latLng.lat(),
                        panoLng: data.location.latLng.lng(),
                        panoId: data.location.pano || null,
                        streetViewAvailable: true,
                        copyright: data.copyright || '© Google'
                      });
                    } else {
                      resolve(stop);
                    }
                  }
                );
              })
          )
        );
      }

      setJourneyStops(finalStops);
      const firstCovered = finalStops.find((s) => s.streetViewAvailable);
      if (firstCovered) {
        setStreetExplorerTarget({
          title: firstCovered.label,
          subtitle: `${(firstCovered.distanceFromStartMeters / 1000).toFixed(1)} km • Route Preview`,
          lat: firstCovered.panoLat ?? firstCovered.lat,
          lng: firstCovered.panoLng ?? firstCovered.lng,
          panoId: firstCovered.panoId,
          heading: firstCovered.headingDegrees
        });
      }
    } catch (err: any) {
      setActionFeedback(err?.message || 'Unable to check route Street View coverage');
      setTimeout(() => setActionFeedback(null), 3000);
    } finally {
      setIsLoadingJourneyPreview(false);
    }
  }, [activeOrigin.name, destination, encodedRoutePolyline]);

  const inspectPlaceById = useCallback(
    async (placeId: string, opts?: { sessionToken?: string; fallbackName?: string }) => {
      tapAbortRef.current?.abort();
      const controller = new AbortController();
      tapAbortRef.current = controller;

      setInspectedPoint((prev) => ({
        kind: 'poi',
        title: opts?.fallbackName || prev?.title || 'Identifying place...',
        category: 'Loading Place Details',
        formattedAddress: prev?.formattedAddress || 'Fetching verified address...',
        road: prev?.road || '',
        locality: prev?.locality || '',
        city: 'Jalpaiguri',
        pincode: '',
        lat: prev?.lat ?? safeLat,
        lng: prev?.lng ?? safeLng,
        placeId,
        nearbyPlaces: prev?.nearbyPlaces || [],
        landmarks: prev?.landmarks || [],
        source: 'places-details',
        isLoading: true,
        error: null
      }));

      try {
        const detail = await apiClient.getPlaceDetails(placeId, {
          sessionToken: opts?.sessionToken,
          language: languageCode,
          signal: controller.signal
        });
        if (opts?.sessionToken) {
          sessionTokenRef.current = createSessionToken();
        }

        const lat = detail?.location?.latitude ?? safeLat;
        const lng = detail?.location?.longitude ?? safeLng;
        const road = extractAddressComponent(detail?.addressComponents, 'route');
        const sublocality =
          extractAddressComponent(detail?.addressComponents, 'sublocality_level_1') ||
          extractAddressComponent(detail?.addressComponents, 'neighborhood');
        const city = extractAddressComponent(detail?.addressComponents, 'locality') || 'Jalpaiguri';
        const pincode = extractAddressComponent(detail?.addressComponents, 'postal_code');
        const title = detail?.displayName?.text || opts?.fallbackName || 'Selected Place';
        const category = detail?.primaryTypeDisplayName?.text || 'Point of Interest';
        const formattedAddress =
          detail?.formattedAddress || detail?.shortFormattedAddress || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        setInspectedPoint({
          kind: 'poi',
          title,
          category,
          formattedAddress,
          road,
          locality: sublocality || city,
          city,
          pincode,
          lat,
          lng,
          placeId: detail?.id || placeId,
          rating: detail?.rating,
          userRatingCount: detail?.userRatingCount,
          googleMapsUri: detail?.googleMapsUri,
          nearbyPlaces: [],
          landmarks: [],
          source: 'places-details',
          isLoading: false,
          error: null
        });
        setOpenInfoTarget('clicked');
        issueCamera({
          type: 'pan',
          center: { lat, lng },
          zoom: mapViewMode === '3d' ? 17.5 : 16,
          tilt: mapViewMode === '3d' ? 58 : 0
        });
      } catch (err: any) {
        if (err instanceof ApiClientError && err.status === 499) return;
        setInspectedPoint((prev) =>
          prev
            ? {
                ...prev,
                isLoading: false,
                error: err?.message || 'Unable to load place details.'
              }
            : null
        );
      }
    },
    [issueCamera, languageCode, mapViewMode, safeLat, safeLng]
  );

  // Debounced Places API (New) Autocomplete
  useEffect(() => {
    const trimmed = fullscreenSearch.trim();
    if (suppressNextAutocompleteRef.current) {
      suppressNextAutocompleteRef.current = false;
      return;
    }
    if (!isFullscreen || trimmed.length < 2) {
      setAutocompleteSuggestions([]);
      setIsAutocompleting(false);
      return;
    }

    const timer = setTimeout(async () => {
      autocompleteAbortRef.current?.abort();
      const controller = new AbortController();
      autocompleteAbortRef.current = controller;
      setIsAutocompleting(true);
      setSearchError(null);

      try {
        const res = await apiClient.autocompletePlaces(
          {
            input: trimmed,
            sessionToken: sessionTokenRef.current,
            languageCode,
            restrictToJalpaiguri: true,
            origin: { lat: safeLat, lng: safeLng }
          },
          { signal: controller.signal }
        );
        setAutocompleteSuggestions(res.suggestions || []);
      } catch (err: any) {
        if (err instanceof ApiClientError && err.status === 499) return;
        setSearchError(err?.message || 'Autocomplete temporarily unavailable.');
        setAutocompleteSuggestions([]);
      } finally {
        setIsAutocompleting(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [fullscreenSearch, isFullscreen, languageCode, safeLat, safeLng]);

  const handleSelectPrediction = async (prediction: AutocompletePredictionItem) => {
    const pred = prediction.placePrediction;
    if (!pred?.placeId) return;

    const label = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
    suppressNextAutocompleteRef.current = true;
    setFullscreenSearch(label);
    setAutocompleteSuggestions([]);
    setSearchResults([]);
    setSearchError(null);

    try {
      const detail = await apiClient.getPlaceDetails(pred.placeId, {
        sessionToken: sessionTokenRef.current
      });
      sessionTokenRef.current = createSessionToken();

      if (detail?.location) {
        const lat = detail.location.latitude;
        const lng = detail.location.longitude;
        const road = extractAddressComponent(detail.addressComponents, 'route');
        const sublocality =
          extractAddressComponent(detail.addressComponents, 'sublocality_level_1') ||
          extractAddressComponent(detail.addressComponents, 'neighborhood');
        const city = extractAddressComponent(detail.addressComponents, 'locality') || 'Jalpaiguri';
        const pincode = extractAddressComponent(detail.addressComponents, 'postal_code');
        const title = detail.displayName?.text || label;
        const category = detail.primaryTypeDisplayName?.text || 'Selected Place';
        const formattedAddress = detail.formattedAddress || detail.shortFormattedAddress || '';

        setInspectedPoint({
          kind: 'poi',
          title,
          category,
          formattedAddress,
          road,
          locality: sublocality || city,
          city,
          pincode,
          lat,
          lng,
          placeId: detail.id || pred.placeId,
          rating: detail.rating,
          userRatingCount: detail.userRatingCount,
          googleMapsUri: detail.googleMapsUri,
          nearbyPlaces: [],
          landmarks: [],
          source: 'places-autocomplete',
          isLoading: false,
          error: null
        });

        await selectDestination({
          placeId: detail.id || pred.placeId,
          name: title,
          address: detail.shortFormattedAddress || formattedAddress,
          category,
          lat,
          lng
        });
      }
    } catch (err: any) {
      setSearchError(err?.message || 'Unable to load details for selected place.');
    }
  };

  const performSearch = useCallback(
    async (queryText: string) => {
      const q = queryText.trim();
      if (!q) return;
      autocompleteAbortRef.current?.abort();
      setAutocompleteSuggestions([]);
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await apiClient.searchPlacesText({
          textQuery: q,
          lat: JALPAIGURI_SERVICE_REGION.lat,
          lng: JALPAIGURI_SERVICE_REGION.lng,
          radiusMeters: 8000,
          maxResultCount: 8,
          languageCode,
          restrictToJalpaiguri: true
        });
        const list = res.places || [];
        if (list.length === 0) {
          setSearchError(`No Jalpaiguri places found for "${q}". Try adding a nearby road or area name.`);
          setSearchResults([]);
          return;
        }
        setSearchResults(list);
        const first = list[0];
        if (first.location) {
          await selectDestination({
            placeId: first.id,
            name: first.displayName?.text || q,
            address: first.shortFormattedAddress || first.formattedAddress,
            category: first.primaryTypeDisplayName?.text || 'Place',
            lat: first.location.latitude,
            lng: first.location.longitude
          });
        }
      } catch (err: any) {
        console.error('Places Text Search failed:', err);
        setSearchError(err?.message || 'Google Places search unavailable.');
      } finally {
        setIsSearching(false);
      }
    },
    [languageCode, selectDestination]
  );

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      suppressNextAutocompleteRef.current = true;
      setFullscreenSearch(searchQuery);
      void performSearch(searchQuery);
    }
  }, [searchQuery, performSearch]);

  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    if (destination) {
      void fetchRouteToDestination(destination, mode);
    }
  };

  const applyReverseGeocodeToState = useCallback((res: ReverseGeocodeResponse, lat: number, lng: number) => {
    setInspectedPoint({
      kind: res.kind || (res.primaryPlace ? 'poi' : res.road ? 'road' : 'locality'),
      title: res.title || res.primaryPlace?.name || res.road || res.locality || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      category:
        res.category ||
        (res.primaryPlace ? res.primaryPlace.category || 'Point of Interest' : res.road ? 'Road / Street' : 'Area'),
      formattedAddress: res.name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      road: res.road || '',
      locality: res.locality || '',
      city: res.city || 'Jalpaiguri',
      pincode: res.pincode || '',
      lat,
      lng,
      placeId: res.placeId || res.primaryPlace?.placeId,
      rating: res.primaryPlace?.rating,
      userRatingCount: res.primaryPlace?.userRatingCount,
      googleMapsUri: res.primaryPlace?.googleMapsUri,
      nearbyPlaces: res.nearbyPlaces || [],
      landmarks: res.landmarks || [],
      source: res.source || 'google-geocoding-v4',
      isLoading: false,
      error: null
    });
    setOpenInfoTarget('clicked');
  }, []);

  const handleMapClick = async (ev: {
    detail?: { latLng?: { lat: number; lng: number } | null; placeId?: string | null };
  }) => {
    const latLng = ev?.detail?.latLng;
    const clickedPlaceId = ev?.detail?.placeId || undefined;
    if (!latLng) return;

    const { lat, lng } = latLng;
    const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}:${clickedPlaceId || ''}:${languageCode}`;
    const cached = tapCacheRef.current.get(cacheKey);
    if (cached) {
      applyReverseGeocodeToState(cached, lat, lng);
      return;
    }

    tapAbortRef.current?.abort();
    const controller = new AbortController();
    tapAbortRef.current = controller;

    // Immediate non-blocking loading feedback
    setInspectedPoint({
      kind: clickedPlaceId ? 'poi' : 'coordinate',
      title: clickedPlaceId ? 'Identifying place...' : 'Resolving street & nearby places...',
      category: 'Looking up location',
      formattedAddress: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      road: '',
      locality: '',
      city: 'Jalpaiguri',
      pincode: '',
      lat,
      lng,
      placeId: clickedPlaceId,
      nearbyPlaces: [],
      landmarks: [],
      source: 'loading',
      isLoading: true,
      error: null
    });
    setOpenInfoTarget('clicked');

    try {
      const response = await apiClient.reverseGeocode(lat, lng, {
        placeId: clickedPlaceId,
        language: languageCode,
        signal: controller.signal
      });
      if (response.success) {
        tapCacheRef.current.set(cacheKey, response);
        applyReverseGeocodeToState(response, lat, lng);
      } else {
        setInspectedPoint((prev) =>
          prev
            ? {
                ...prev,
                title: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
                category: 'Coordinates',
                isLoading: false,
                error: 'No named address found at these coordinates.'
              }
            : null
        );
      }
    } catch (err: any) {
      if (err instanceof ApiClientError && err.status === 499) return;
      setInspectedPoint((prev) =>
        prev
          ? {
              ...prev,
              title: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              category: 'Lookup Failed',
              isLoading: false,
              error: err?.message || 'Unable to identify this location right now.'
            }
          : null
      );
    }
  };

  const handleCenterOnMe = async () => {
    setActiveView('user');
    setIsLocating(true);
    const result = await requestCurrentLocation();
    setIsLocating(false);
    const targetLat = result?.location?.lat ?? safeLat;
    const targetLng = result?.location?.lng ?? safeLng;
    issueCamera({
      type: 'pan',
      center: { lat: targetLat, lng: targetLng },
      zoom: isWithinServiceRegion ? 15 : 13
    });
  };

  const handleCenterOnJalpaiguri = () => {
    setActiveView('jalpaiguri');
    issueCamera({
      type: 'pan',
      center: { lat: JALPAIGURI_SERVICE_REGION.lat, lng: JALPAIGURI_SERVICE_REGION.lng },
      zoom: 14
    });
  };

  const handleShowRouteOverview = () => {
    setActiveView('both');
    issueCamera({
      type: 'bounds',
      points: [
        { lat: safeLat, lng: safeLng },
        { lat: JALPAIGURI_SERVICE_REGION.lat, lng: JALPAIGURI_SERVICE_REGION.lng }
      ]
    });
  };

  const handleOpenNativeMap = () => {
    try {
      const payload = JSON.stringify({
        centerLat: inspectedPoint?.lat ?? destination?.lat ?? safeLat,
        centerLng: inspectedPoint?.lng ?? destination?.lng ?? safeLng,
        userLat: safeLat,
        userLng: safeLng,
        destinationLat: destination?.lat ?? inspectedPoint?.lat ?? null,
        destinationLng: destination?.lng ?? inspectedPoint?.lng ?? null,
        destinationName: destination?.name ?? inspectedPoint?.title ?? null,
        query: fullscreenSearch || ''
      });
      (window as any).AndroidGoogleAuth.openNativeMap(payload);
    } catch (e) {
      console.error('Unable to launch NativeMapActivity:', e);
    }
  };

  const clearRoute = () => {
    routeAbortRef.current?.abort();
    setOriginPoint(null);
    setDestination(null);
    setRouteAlternatives([]);
    setSelectedRouteIndex(0);
    setRoutePath([]);
    setEncodedRoutePolyline('');
    setRouteDescription('');
    setRouteDistanceText('');
    setRouteDurationText('');
    setRouteSteps([]);
    setAlongRoutePlaces([]);
    setJourneyStops([]);
    setShowJourneyTimeline(false);
    setRouteError(null);
    setRouteUsingOfflineCache(false);
    setShowSteps(false);
  };

  const mapContainerStyle = useMemo(
    () => (!isFullscreen ? { height: `${height}px` } : undefined),
    [isFullscreen, height]
  );

  const kindBadgeLabel = (kind: InspectedPoint['kind']) => {
    switch (kind) {
      case 'poi':
        return 'Named Place';
      case 'road':
        return 'Road / Street';
      case 'locality':
        return 'Locality';
      default:
        return 'Coordinates';
    }
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-white flex flex-col w-full h-full'
          : `bg-white border border-[#E8E4DA] rounded-3xl overflow-hidden shadow-xs flex flex-col ${className}`
      }
    >
      {/* Header Bar */}
      {isFullscreen ? (
        <div className="px-4 py-3 border-b border-[#F0ECE1] bg-white space-y-2.5 shrink-0 shadow-sm z-20 relative">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
              aria-label="Exit Fullscreen Map"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex-1 relative flex items-center bg-gray-100/80 rounded-full border border-gray-200/70 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all shadow-inner">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Kadamtala, hospitals, schools, shops..."
                className="w-full bg-transparent py-2.5 pl-10 pr-20 text-sm font-medium text-gray-900 focus:outline-none"
                value={fullscreenSearch}
                onChange={(e) => {
                  setFullscreenSearch(e.target.value);
                  if (!e.target.value.trim()) {
                    setAutocompleteSuggestions([]);
                    setSearchResults([]);
                    setSearchError(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && fullscreenSearch.trim()) {
                    void performSearch(fullscreenSearch);
                  }
                }}
              />
              {(isAutocompleting || isSearching) && (
                <Loader2 className="w-4 h-4 text-[#007AFF] animate-spin absolute right-11 top-1/2 -translate-y-1/2" />
              )}
              {fullscreenSearch && !isAutocompleting && !isSearching && (
                <button
                  onClick={() => {
                    setFullscreenSearch('');
                    setAutocompleteSuggestions([]);
                    setSearchResults([]);
                    setSearchError(null);
                  }}
                  className="absolute right-11 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => void performSearch(fullscreenSearch)}
                disabled={isSearching}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[#007AFF] text-white rounded-full hover:bg-blue-700 transition-colors shrink-0 shadow-sm cursor-pointer disabled:opacity-60"
                title="Search Google Places"
              >
                <Navigation className="w-4 h-4 ml-[1px]" />
              </button>
            </div>
            <button
              onClick={() => setLanguageCode((l) => (l === 'en' ? 'bn' : 'en'))}
              className="px-2.5 py-2 rounded-xl bg-[#FAF8F5] text-gray-800 border border-[#E8E4DA] text-xs font-extrabold cursor-pointer shrink-0"
              title="Switch English / বাংলা"
            >
              {languageCode === 'en' ? 'EN' : 'বাং'}
            </button>
            <button
              onClick={() => setShowSavedDrawer((s) => !s)}
              className={`px-2.5 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-1 cursor-pointer shrink-0 ${
                showSavedDrawer
                  ? 'bg-[#007AFF] text-white border-[#007AFF]'
                  : 'bg-[#FAF8F5] text-gray-800 border-[#E8E4DA]'
              }`}
              title="Saved Places"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{savedPlaces.length}</span>
            </button>
            {hasNativeMapBridge && (
              <button
                onClick={handleOpenNativeMap}
                className="px-2.5 py-2 rounded-xl bg-blue-50 text-[#007AFF] border border-blue-200 text-xs font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                title="Open native Android Google Maps"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Native</span>
              </button>
            )}
          </div>

          {/* Quick View Mode + Saved Places Drawer */}
          {showSavedDrawer && (
            <div className="rounded-2xl border border-[#E8E4DA] bg-[#FAF8F5] p-2.5 space-y-1.5 max-h-44 overflow-y-auto">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-600">
                  Saved Jalpaiguri Places ({savedPlaces.length})
                </p>
                <button onClick={() => setShowSavedDrawer(false)} className="text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {savedPlaces.length === 0 ? (
                <p className="text-xs text-gray-500">Tap any place on the map and press Save to bookmark it.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {savedPlaces.map((sp) => (
                    <button
                      key={sp.id}
                      onClick={() => {
                        setShowSavedDrawer(false);
                        void selectDestination({
                          placeId: sp.id,
                          name: sp.name,
                          address: sp.address,
                          category: sp.category,
                          lat: sp.lat,
                          lng: sp.lng
                        });
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-left hover:bg-blue-50 cursor-pointer"
                    >
                      <p className="text-xs font-extrabold text-gray-900 truncate">{sp.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{sp.address}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Live Places Autocomplete Suggestions */}
          {autocompleteSuggestions.length > 0 && (
            <div className="max-h-52 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg divide-y divide-gray-100">
              {autocompleteSuggestions.map((item, idx) => {
                const pred = item.placePrediction;
                if (!pred) return null;
                const main = pred.structuredFormat?.mainText?.text || pred.text?.text || 'Place';
                const secondary = pred.structuredFormat?.secondaryText?.text || '';
                const distM = pred.distanceMeters;
                return (
                  <button
                    key={pred.placeId || idx}
                    onClick={() => void handleSelectPrediction(item)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/70 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <MapPin className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-gray-900 truncate">{main}</p>
                        {secondary && <p className="text-[11px] text-gray-500 truncate">{secondary}</p>}
                      </div>
                    </div>
                    {typeof distM === 'number' && (
                      <span className="text-[10px] font-bold text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                        {formatRouteDistance(distM)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Text Search Results Dropdown */}
          {autocompleteSuggestions.length === 0 && searchResults.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg divide-y divide-gray-100">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  onClick={() => {
                    if (place.location) {
                      void selectDestination({
                        placeId: place.id,
                        name: place.displayName?.text || 'Selected Place',
                        address: place.shortFormattedAddress || place.formattedAddress,
                        category: place.primaryTypeDisplayName?.text || 'Place',
                        lat: place.location.latitude,
                        lng: place.location.longitude
                      });
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/60 flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 truncate">
                      {place.displayName?.text}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {place.shortFormattedAddress || place.formattedAddress}
                    </p>
                  </div>
                  {place.primaryTypeDisplayName?.text && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#007AFF] shrink-0">
                      {place.primaryTypeDisplayName.text}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {searchError && (
            <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5">
              {searchError}
            </p>
          )}
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-[#F0ECE1] flex items-center justify-between bg-white shrink-0 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#007AFF] flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-[#11241C] tracking-tight truncate">
                  Jalpaiguri Google Map
                </h3>
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
              </div>
              <p className="text-[10px] text-[#55685F] font-semibold truncate">
                Tap any road, landmark, or shop to identify
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E8E4DA] shrink-0">
            <button
              onClick={handleCenterOnMe}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                activeView === 'user' ? 'bg-[#007AFF] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
              }`}
              title="Focus on your real coordinates"
            >
              My GPS
            </button>
            <button
              onClick={handleCenterOnJalpaiguri}
              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                activeView === 'jalpaiguri' ? 'bg-[#007AFF] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
              }`}
              title="Focus on Jalpaiguri civic hub"
            >
              Jalpaiguri
            </button>
            {!isWithinServiceRegion && (
              <button
                onClick={handleShowRouteOverview}
                className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                  activeView === 'both' ? 'bg-[#007AFF] text-white shadow-2xs' : 'text-[#55685F] hover:text-[#11241C]'
                }`}
                title="View your distance to Jalpaiguri"
              >
                Route
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Container Viewport */}
      <div
        className={`relative w-full overflow-hidden bg-slate-100 ${isFullscreen ? 'flex-1' : ''}`}
        style={mapContainerStyle}
      >
        {isKeyLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-xs font-bold text-gray-500">
            <div className="w-6 h-6 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <span>Loading Google Maps...</span>
          </div>
        ) : !apiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-100">
            <MapPin className="w-6 h-6 text-[#007AFF] mb-1.5" />
            <p className="text-xs font-extrabold text-gray-800">Google Maps API Key Required</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Set GOOGLE_MAPS_API_KEY on the server or VITE_GOOGLE_MAPS_API_KEY in env.
            </p>
          </div>
        ) : (
          <MyJpgMapsProvider apiKey={apiKey}>
            <GoogleMapCanvas
              mapId={DEFAULT_GOOGLE_MAP_ID}
              defaultCenter={{ lat: safeLat, lng: safeLng }}
              defaultZoom={isWithinServiceRegion ? 15 : 12}
              mapTypeId={mapViewMode === 'standard' ? 'roadmap' : 'hybrid'}
              gestureHandling="greedy"
              disableDefaultUI={true}
              clickableIcons={true}
              internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
              onClick={handleMapClick}
              onContextmenu={handleMapClick}
              className="w-full h-full"
            >
              <MapCameraController command={cameraCommand} viewMode={mapViewMode} />

              <RemoteTrajectoryOverlay
                show={!isWithinServiceRegion && !destination}
                from={{ lat: safeLat, lng: safeLng }}
                to={{ lat: JALPAIGURI_SERVICE_REGION.lat, lng: JALPAIGURI_SERVICE_REGION.lng }}
              />

              {routePath.length >= 2 && (
                <RoutePolylineOverlay path={routePath} strokeColor="#007AFF" strokeWeight={5} fitBounds={true} />
              )}

              {/* Live User GPS Marker */}
              <AdvancedMarker
                position={{ lat: safeLat, lng: safeLng }}
                title={safeName}
                onClick={() => setOpenInfoTarget('user')}
              >
                <Pin background="#064E3B" borderColor="#FFFFFF" glyphColor="#60A5FA" />
              </AdvancedMarker>

              {/* Jalpaiguri Civic Hub Marker */}
              <AdvancedMarker
                position={{ lat: JALPAIGURI_SERVICE_REGION.lat, lng: JALPAIGURI_SERVICE_REGION.lng }}
                title="Jalpaiguri Civic Hub"
                onClick={() => setOpenInfoTarget('hub')}
              >
                <Pin background="#1E3A8A" borderColor="#FFFFFF" glyphColor="#FFFFFF" />
              </AdvancedMarker>

              {/* Destination Marker */}
              {destination && (
                <AdvancedMarker
                  position={{ lat: destination.lat, lng: destination.lng }}
                  title={destination.name}
                  onClick={() => setOpenInfoTarget('dest')}
                >
                  <Pin background="#2563EB" borderColor="#FFFFFF" glyphColor="#FFFFFF" scale={1.15} />
                </AdvancedMarker>
              )}

              {/* Places Along Route Markers */}
              {alongRoutePlaces.map((p) => {
                if (!p.location) return null;
                return (
                  <AdvancedMarker
                    key={p.id}
                    position={{ lat: p.location.latitude, lng: p.location.longitude }}
                    title={p.displayName?.text || 'Along route'}
                    onClick={() => {
                      setOpenInfoTarget(`along:${p.id}`);
                      void inspectPlaceById(p.id, { fallbackName: p.displayName?.text });
                    }}
                  >
                    <Pin background="#0F766E" borderColor="#FFFFFF" glyphColor="#FFFFFF" scale={0.85} />
                  </AdvancedMarker>
                );
              })}

              {/* Inspected Click Marker */}
              {inspectedPoint && (
                <AdvancedMarker
                  position={{ lat: inspectedPoint.lat, lng: inspectedPoint.lng }}
                  title={inspectedPoint.title}
                  onClick={() => setOpenInfoTarget('clicked')}
                >
                  <Pin background="#F59E0B" borderColor="#FFFFFF" glyphColor="#FFFFFF" />
                </AdvancedMarker>
              )}

              {openInfoTarget === 'user' && (
                <InfoWindow position={{ lat: safeLat, lng: safeLng }} onCloseClick={() => setOpenInfoTarget(null)}>
                  <div className="p-1 font-sans">
                    <p className="text-xs font-extrabold text-[#064E3B]">{safeName}</p>
                    <p className="text-[11px] text-gray-600">
                      {location?.locationSource === 'gps' ? 'Verified device GPS' : 'Active map location'}
                    </p>
                  </div>
                </InfoWindow>
              )}

              {openInfoTarget === 'hub' && (
                <InfoWindow
                  position={{ lat: JALPAIGURI_SERVICE_REGION.lat, lng: JALPAIGURI_SERVICE_REGION.lng }}
                  onCloseClick={() => setOpenInfoTarget(null)}
                >
                  <div className="p-1 font-sans">
                    <p className="text-xs font-extrabold text-[#1E3A8A]">Jalpaiguri Civic Hub</p>
                    <p className="text-[11px] text-gray-600">Municipality & District Headquarters</p>
                  </div>
                </InfoWindow>
              )}

              {openInfoTarget === 'dest' && destination && (
                <InfoWindow
                  position={{ lat: destination.lat, lng: destination.lng }}
                  onCloseClick={() => setOpenInfoTarget(null)}
                >
                  <div className="p-1 font-sans max-w-[210px]">
                    <p className="text-xs font-extrabold text-[#007AFF]">{destination.name}</p>
                    {destination.address && <p className="text-[10px] text-gray-600 mt-0.5">{destination.address}</p>}
                    {routeDistanceText && (
                      <p className="text-[11px] font-bold text-gray-800 mt-1">
                        {routeDistanceText} • {routeDurationText}
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}

              {openInfoTarget === 'clicked' && inspectedPoint && (
                <InfoWindow
                  position={{ lat: inspectedPoint.lat, lng: inspectedPoint.lng }}
                  onCloseClick={() => setOpenInfoTarget(null)}
                >
                  <div className="p-1 font-sans space-y-1 max-w-[220px]">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#007AFF]">
                      {inspectedPoint.category}
                    </p>
                    <p className="text-xs font-extrabold text-gray-900 leading-snug">{inspectedPoint.title}</p>
                    {inspectedPoint.road && inspectedPoint.title !== inspectedPoint.road && (
                      <p className="text-[10px] font-semibold text-gray-700">{inspectedPoint.road}</p>
                    )}
                    <p className="text-[10px] text-gray-500 line-clamp-2">{inspectedPoint.formattedAddress}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMapCanvas>

            {/* Street Explorer 360° Modal rendered inside MyJpgMapsProvider */}
            {streetExplorerTarget && (
              <StreetViewExplorerModal
                target={streetExplorerTarget}
                journeyStops={journeyStops}
                onClose={() => setStreetExplorerTarget(null)}
                onSelectTarget={(next) => setStreetExplorerTarget(next)}
              />
            )}
          </MyJpgMapsProvider>
        )}

        {/* Map View Mode Selector (Standard | Satellite | 3D) */}
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-gray-200 shadow-sm">
          {(
            [
              { id: 'standard', label: languageCode === 'bn' ? 'ম্যাপ' : 'Standard' },
              { id: 'satellite', label: languageCode === 'bn' ? 'স্যাটেলাইট' : 'Satellite' },
              { id: '3d', label: languageCode === 'bn' ? '৩ডি' : '3D' }
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMapViewMode(mode.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                mapViewMode === mode.id
                  ? 'bg-[#007AFF] text-white shadow-2xs'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Floating Map Zoom, Rotate 3D & GPS Controls */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 drop-shadow-sm">
          <button
            onClick={() => issueCamera({ type: 'zoomIn' })}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={() => issueCamera({ type: 'zoomOut' })}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4.5 h-4.5" />
          </button>
          {mapViewMode === '3d' && (
            <button
              onClick={() => issueCamera({ type: 'rotate3d' })}
              className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-[#007AFF] flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Rotate 3D Perspective"
              aria-label="Rotate 3D Perspective"
            >
              <RotateCw className="w-4.5 h-4.5" />
            </button>
          )}
          <button
            onClick={handleCenterOnMe}
            disabled={isLocating}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-[#007AFF] flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            title="Recenter on My Location"
            aria-label="Recenter on My Location"
          >
            <Crosshair className={`w-4.5 h-4.5 ${isLocating ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-800 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen Map' : 'Open Fullscreen Map'}
            aria-label={isFullscreen ? 'Exit Fullscreen Map' : 'Open Fullscreen Map'}
          >
            {!isFullscreen ? <Maximize2 className="w-4.5 h-4.5" /> : <X className="w-4.5 h-4.5" />}
          </button>
          {!isFullscreen && hasNativeMapBridge && (
            <button
              onClick={handleOpenNativeMap}
              className="w-9 h-9 rounded-xl bg-[#007AFF] text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all cursor-pointer shadow-sm"
              title="Open Native Google Maps"
              aria-label="Open Native Google Maps"
            >
              <Smartphone className="w-4.5 h-4.5" />
            </button>
          )}
        </div>

        {/* Action Toast Feedback */}
        {actionFeedback && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-14 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg whitespace-nowrap">
            {actionFeedback}
          </div>
        )}

        {/* Floating "You Are Here" Badge on Map */}
        <div className="absolute left-3 bottom-3 z-10 max-w-[78%] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
            <span className="text-[11px] font-extrabold text-[#11241C] truncate">
              You: {safeLocality} {mapViewMode === '3d' ? '• 3D' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Inspected Location Card (Places, Roads, Localities & Nearby POIs) */}
      {inspectedPoint && (
        <div className="p-3.5 bg-white border-t border-[#E8E4DA] space-y-2.5 shrink-0 max-h-[42vh] overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-blue-50 text-[#007AFF] border border-blue-100">
                  {inspectedPoint.kind === 'road' ? (
                    <Milestone className="w-3 h-3" />
                  ) : (
                    <Building2 className="w-3 h-3" />
                  )}
                  <span>{kindBadgeLabel(inspectedPoint.kind)}</span>
                </span>
                <span className="text-[11px] font-bold text-gray-500 truncate">{inspectedPoint.category}</span>
                {typeof inspectedPoint.rating === 'number' && (
                  <span className="text-[11px] font-extrabold text-amber-600">
                    ★ {inspectedPoint.rating.toFixed(1)}
                    {inspectedPoint.userRatingCount ? ` (${inspectedPoint.userRatingCount})` : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {inspectedPoint.isLoading && <Loader2 className="w-4 h-4 text-[#007AFF] animate-spin shrink-0" />}
                <h4 className="text-sm font-black text-[#0F172A] leading-tight break-words">
                  {inspectedPoint.title}
                </h4>
              </div>

              <div className="text-[11px] text-gray-600 space-y-0.5">
                {inspectedPoint.road && (
                  <p className="font-semibold text-gray-800">Road: {inspectedPoint.road}</p>
                )}
                {(inspectedPoint.locality || inspectedPoint.city || inspectedPoint.pincode) && (
                  <p>
                    {[inspectedPoint.locality, inspectedPoint.city, inspectedPoint.pincode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                {inspectedPoint.formattedAddress && (
                  <p className="text-gray-500 leading-snug">{inspectedPoint.formattedAddress}</p>
                )}
                <p className="text-[10px] font-mono text-gray-400">
                  {inspectedPoint.lat.toFixed(5)}, {inspectedPoint.lng.toFixed(5)} •{' '}
                  {formatDistanceFromKm(haversineKm(safeLat, safeLng, inspectedPoint.lat, inspectedPoint.lng))} from you
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                tapAbortRef.current?.abort();
                setInspectedPoint(null);
                setOpenInfoTarget(null);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer shrink-0"
              aria-label="Close place inspection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {inspectedPoint.error && (
            <p className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-2.5 py-1.5">
              {inspectedPoint.error}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() =>
                void selectDestination({
                  placeId: inspectedPoint.placeId,
                  name: inspectedPoint.title,
                  address: inspectedPoint.formattedAddress,
                  category: inspectedPoint.category,
                  lat: inspectedPoint.lat,
                  lng: inspectedPoint.lng
                })
              }
              className="px-3 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-blue-700 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </button>

            <button
              onClick={() =>
                setStreetExplorerTarget({
                  title: inspectedPoint.title,
                  subtitle: inspectedPoint.road || inspectedPoint.formattedAddress,
                  lat: inspectedPoint.lat,
                  lng: inspectedPoint.lng
                })
              }
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>Explore Street</span>
            </button>

            <button
              onClick={() => {
                setOriginPoint({
                  placeId: inspectedPoint.placeId,
                  name: inspectedPoint.title,
                  address: inspectedPoint.formattedAddress,
                  category: inspectedPoint.category,
                  lat: inspectedPoint.lat,
                  lng: inspectedPoint.lng
                });
                if (destination) {
                  void fetchRouteToDestination(destination, travelMode, {
                    placeId: inspectedPoint.placeId,
                    name: inspectedPoint.title,
                    lat: inspectedPoint.lat,
                    lng: inspectedPoint.lng
                  });
                } else {
                  setActionFeedback(`Origin set to ${inspectedPoint.title}`);
                  setTimeout(() => setActionFeedback(null), 2500);
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-gray-800 text-xs font-bold hover:bg-gray-100 cursor-pointer"
            >
              Set Start
            </button>

            <button
              onClick={() =>
                handleToggleSavePlace({
                  id: inspectedPoint.placeId || `${inspectedPoint.lat.toFixed(5)},${inspectedPoint.lng.toFixed(5)}`,
                  name: inspectedPoint.title,
                  address: inspectedPoint.formattedAddress,
                  category: inspectedPoint.category,
                  lat: inspectedPoint.lat,
                  lng: inspectedPoint.lng
                })
              }
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-gray-800 text-xs font-bold hover:bg-gray-100 cursor-pointer flex items-center gap-1"
            >
              {savedPlaces.some(
                (p) => Math.abs(p.lat - inspectedPoint.lat) < 0.0002 && Math.abs(p.lng - inspectedPoint.lng) < 0.0002
              ) ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>

            <button
              onClick={() =>
                void handleSharePlace(
                  inspectedPoint.title,
                  inspectedPoint.formattedAddress,
                  inspectedPoint.lat,
                  inspectedPoint.lng
                )
              }
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-gray-800 text-xs font-bold hover:bg-gray-100 cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => {
                setManualLocation({
                  name: inspectedPoint.title,
                  locality: inspectedPoint.locality || inspectedPoint.title,
                  lat: inspectedPoint.lat,
                  lng: inspectedPoint.lng,
                  city: inspectedPoint.city || 'Jalpaiguri'
                });
                setOpenInfoTarget(null);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DA] text-gray-800 text-xs font-bold hover:bg-gray-100 cursor-pointer"
            >
              Set View Area
            </button>

            {inspectedPoint.googleMapsUri && (
              <a
                href={inspectedPoint.googleMapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold inline-flex items-center gap-1 hover:bg-gray-200"
              >
                <span>Open Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Nearby Identified Places around Tapped Coordinate */}
          {inspectedPoint.nearbyPlaces.length > 0 && (
            <div className="pt-1.5 border-t border-[#F0ECE1] space-y-1.5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500">
                Nearby Places & Landmarks ({inspectedPoint.nearbyPlaces.length})
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {inspectedPoint.nearbyPlaces.map((np) => (
                  <button
                    key={np.placeId}
                    onClick={() => void inspectPlaceById(np.placeId, { fallbackName: np.name })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-blue-50 border border-[#E8E4DA] text-left cursor-pointer transition-colors flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-gray-900 truncate">{np.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{np.category}</p>
                    </div>
                    {np.distanceMeters && (
                      <span className="text-[11px] font-bold text-[#007AFF] shrink-0">
                        {np.distanceMeters} m
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Route, Alternatives, Journey Preview, Steps & Places Along Route Panel */}
      {destination && (
        <div className="p-3 bg-white border-t border-[#E8E4DA] space-y-2.5 shrink-0 max-h-[46vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#007AFF] flex items-center gap-1">
                <RouteIcon className="w-3 h-3" />
                <span>Google Routes Navigation</span>
                {routeUsingOfflineCache && (
                  <span className="ml-1 inline-flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                    <WifiOff className="w-2.5 h-2.5" />
                    Cached Steps
                  </span>
                )}
              </p>
              <div className="bg-[#FAF8F5] border border-[#E8E4DA] rounded-xl p-2 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-blue-600 shrink-0">Starting point:</span>
                  <span className="font-bold text-gray-900 truncate">{activeOrigin.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-extrabold text-rose-600 shrink-0">Destination:</span>
                  <span className="font-bold text-gray-900 truncate">{destination.name}</span>
                </div>
              </div>
              {routeDescription && (
                <p className="text-[10px] font-semibold text-gray-500 truncate">Via {routeDescription}</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleSwapOriginAndDestination}
                className="p-1.5 rounded-lg text-[#007AFF] bg-blue-50 hover:bg-blue-100 cursor-pointer"
                title="Swap Start & Destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={clearRoute}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                title="Clear route"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'DRIVE', label: 'Drive', icon: <Car className="w-3.5 h-3.5" /> },
                { id: 'TWO_WHEELER', label: '2-Wheeler', icon: <Bike className="w-3.5 h-3.5" /> },
                { id: 'WALK', label: 'Walk', icon: <Footprints className="w-3.5 h-3.5" /> },
                { id: 'BICYCLE', label: 'Cycle', icon: <Bike className="w-3.5 h-3.5" /> }
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => handleTravelModeChange(m.id)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  travelMode === m.id
                    ? 'bg-[#007AFF] text-white border-[#007AFF]'
                    : 'bg-[#FAF8F5] text-gray-700 border-[#E8E4DA] hover:bg-gray-100'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Alternative Route Options */}
          {routeAlternatives.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {routeAlternatives.map((alt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedRouteIndex(idx);
                    void applySelectedRouteOption(alt, destination);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border shrink-0 cursor-pointer ${
                    selectedRouteIndex === idx
                      ? 'bg-blue-50 border-[#007AFF] text-[#007AFF]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {alt.durationText} • {formatRouteDistance(alt.distanceMeters)}
                </button>
              ))}
            </div>
          )}

          {(travelMode === 'WALK' || travelMode === 'BICYCLE') && (
            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-900 font-medium">
              <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Walking and bicycling routes are in beta and might sometimes be missing sidewalks, pedestrian paths, or bike paths.
              </span>
            </div>
          )}

          {isRouting ? (
            <p className="text-xs font-semibold text-[#007AFF] flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Computing Google route & identifying places along route...</span>
            </p>
          ) : routeError ? (
            <p className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1.5">
              {routeError}
            </p>
          ) : (
            routeDistanceText && (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-blue-50/70 border border-blue-100 rounded-xl px-3 py-2 gap-2 flex-wrap">
                  <div className="text-xs font-black text-[#0F172A]">
                    {routeDurationText} <span className="font-semibold text-gray-500">({routeDistanceText})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {encodedRoutePolyline && (
                      <button
                        onClick={() => void handlePreviewJourney()}
                        disabled={isLoadingJourneyPreview}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-extrabold flex items-center gap-1 hover:bg-slate-800 cursor-pointer disabled:opacity-60"
                      >
                        {isLoadingJourneyPreview ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Eye className="w-3 h-3 text-sky-400" />
                        )}
                        <span>Preview Journey</span>
                      </button>
                    )}
                    {routeSteps.length > 0 && (
                      <button
                        onClick={() => setShowSteps((s) => !s)}
                        className="text-[11px] font-extrabold text-[#007AFF] flex items-center gap-1 cursor-pointer"
                      >
                        <span>{showSteps ? 'Hide steps' : `${routeSteps.length} steps`}</span>
                        {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Ordered Street View Journey Preview Timeline */}
                {showJourneyTimeline && (
                  <div className="space-y-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                        Street View Journey Preview ({journeyStops.filter((s) => s.streetViewAvailable).length}/{journeyStops.length} covered)
                      </p>
                      <button
                        onClick={() => setShowJourneyTimeline(false)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {isLoadingJourneyPreview ? (
                      <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#007AFF]" />
                        <span>Checking Street View stops along route...</span>
                      </p>
                    ) : journeyStops.length === 0 ? (
                      <p className="text-[11px] text-slate-500">No route stops available to preview.</p>
                    ) : (
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {journeyStops.map((stop) => (
                          <button
                            key={stop.stopIndex}
                            disabled={!stop.streetViewAvailable}
                            onClick={() =>
                              setStreetExplorerTarget({
                                title: stop.label,
                                subtitle: `${(stop.distanceFromStartMeters / 1000).toFixed(1)} km along route`,
                                lat: stop.panoLat ?? stop.lat,
                                lng: stop.panoLng ?? stop.lng,
                                panoId: stop.panoId,
                                heading: stop.headingDegrees
                              })
                            }
                            className={`px-2.5 py-1.5 rounded-xl border text-left shrink-0 max-w-[170px] ${
                              stop.streetViewAvailable
                                ? 'bg-white border-blue-200 hover:bg-blue-50 cursor-pointer'
                                : 'bg-slate-100 border-slate-200 opacity-70 cursor-not-allowed'
                            }`}
                          >
                            <p className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-[#007AFF]">
                              {stop.streetViewAvailable ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                              )}
                              <span>{stop.role}</span>
                            </p>
                            <p className="text-[11px] font-extrabold text-gray-900 truncate">{stop.label}</p>
                            <p className="text-[10px] text-gray-500 truncate">
                              {stop.streetViewAvailable ? 'Tap for 360° View' : 'No Street View'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showSteps && routeSteps.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-xl border border-[#E8E4DA] divide-y divide-[#F0ECE1] bg-[#FAF8F5]">
                    {routeSteps.map((step, idx) => (
                      <div key={idx} className="px-3 py-2 text-[11px] flex items-start justify-between gap-2">
                        <span className="text-gray-800 font-medium">
                          {idx + 1}. {step.navigationInstruction?.instructions || 'Continue'}
                        </span>
                        {typeof step.distanceMeters === 'number' && (
                          <span className="text-[10px] font-bold text-gray-500 shrink-0">
                            {formatRouteDistance(step.distanceMeters)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Places Along Route */}
                {(isLoadingAlongRoute || alongRoutePlaces.length > 0) && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                      {isLoadingAlongRoute
                        ? 'Scanning places along this route...'
                        : `Places Along Route (${alongRoutePlaces.length})`}
                    </p>
                    {alongRoutePlaces.length > 0 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {alongRoutePlaces.map((ap) => (
                          <button
                            key={ap.id}
                            onClick={() => void inspectPlaceById(ap.id, { fallbackName: ap.displayName?.text })}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-200/80 text-left shrink-0 max-w-[190px] cursor-pointer"
                          >
                            <p className="text-[11px] font-extrabold text-teal-950 truncate">
                              {ap.displayName?.text || 'Place'}
                            </p>
                            <p className="text-[10px] text-teal-800 truncate">
                              {ap.primaryTypeDisplayName?.text || ap.shortFormattedAddress || 'Along route'}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}

      {/* Footer Location Status & Distance Information */}
      {showDetails && !isFullscreen && (
        <div className="p-3 bg-[#FAF8F5] border-t border-[#E8E4DA] space-y-2">
          <div className="flex items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
              <span className="font-bold text-[#11241C] truncate">{safeName}</span>
            </div>

            {location?.locationSource === 'gps' ? (
              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>GPS {location.accuracy ? `±${location.accuracy}m` : 'Active'}</span>
              </span>
            ) : (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                Manual Selection
              </span>
            )}
          </div>

          {isWithinServiceRegion ? (
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-[11px] text-blue-900 font-semibold">
              <span>Within Jalpaiguri municipal service area</span>
              <span className="text-[10px] font-bold bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-md">
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
                  You are viewing MYJPG in remote citizen mode.
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
