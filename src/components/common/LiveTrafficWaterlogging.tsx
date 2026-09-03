import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layers,
  Navigation,
  Waves,
  RefreshCw,
  Compass,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
  CloudRain,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavigationContext';
import { loadGoogleMapsJsApi } from '../../utils/googleMapsLoader';

// Jalpaiguri Town Center & Strict Geographic Bounds
const JALPAIGURI_CENTER = { lat: 26.5228, lng: 88.7245 };
const JALPAIGURI_BOUNDS = {
  north: 26.5850,
  south: 26.4650,
  west: 88.6600,
  east: 88.7950
};

// Google Maps Night Mode Style for high-contrast traffic overlay
const DARK_MAP_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#18241e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#18241e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8fa89b' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c4d7cd' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#7e968a' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#1a3326' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5b856e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#273830' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1c2822' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334b3e' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#23342b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0f293b' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4d758f' }]
  }
];

// Key Transit Corridors in Jalpaiguri
export const JALPAIGURI_CORRIDORS = [
  {
    id: 'nh-27',
    name: 'NH-27 Teesta Bridge Bypass',
    shortName: 'NH-27 Bypass',
    type: 'Highway Transit',
    lat: 26.5410,
    lng: 88.7450,
    zoom: 15,
    desc: 'Major interstate freight and passenger corridor connecting Jalpaiguri to Siliguri & Guwahati.'
  },
  {
    id: 'dinbazar',
    name: 'Dinbazar Wholesale Market More',
    shortName: 'Dinbazar Market',
    type: 'Commercial Core',
    lat: 26.5280,
    lng: 88.7210,
    zoom: 16,
    desc: 'Dense commercial artery via DB Road with high auto-rickshaw and pedestrian density.'
  },
  {
    id: 'kadamtala',
    name: 'Kadamtala - Hospital Road Corridor',
    shortName: 'Kadamtala More',
    type: 'Emergency Route',
    lat: 26.5230,
    lng: 88.7290,
    zoom: 16,
    desc: 'Primary transit route between Sadar Hospital, central administrative offices, and railway gates.'
  },
  {
    id: 'mohitnagar',
    name: 'Mohitnagar - Raninagar Industrial Belt',
    shortName: 'Mohitnagar Belt',
    type: 'Industrial Link',
    lat: 26.5360,
    lng: 88.7420,
    zoom: 15,
    desc: 'Link connecting central municipality to warehouse parks, tea processing, and railway yards.'
  }
];

export interface LiveTrafficWaterloggingProps {
  className?: string;
  height?: string | number;
  showControls?: boolean;
  showCorridorShortcuts?: boolean;
  showTelemetryCard?: boolean;
  onSelectCorridor?: (corridor: typeof JALPAIGURI_CORRIDORS[0]) => void;
}

export const LiveTrafficWaterlogging: React.FC<LiveTrafficWaterloggingProps> = ({
  className = '',
  height = '48vh',
  showControls = true,
  showCorridorShortcuts = true,
  showTelemetryCard = true,
  onSelectCorridor
}) => {
  const { isDarkMode } = useTheme();
  const { navigate } = useNav();

  // Layer Toggles
  const [layers, setLayers] = useState({
    traffic: true,
    waterlogging: true,
    corridors: true,
    satellite: false
  });

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [mapEngineStatus, setMapEngineStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeCorridorId, setActiveCorridorId] = useState<string | null>(null);

  // Waterlogging Telemetry State
  const [waterloggingData, setWaterloggingData] = useState<any>(null);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState<boolean>(true);

  // Map DOM and Instance References
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstanceRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const corridorMarkersRef = useRef<any[]>([]);
  const autoRefreshTimerRef = useRef<any>(null);

  // 1. Query Real Waterlogging & Precipitation Telemetry from Backend
  const fetchTelemetry = useCallback(async () => {
    setIsTelemetryLoading(true);
    try {
      const resp = await fetch('/api/alerts/waterlogging-live');
      if (resp.ok) {
        const data = await resp.json();
        setWaterloggingData(data);
      } else {
        setWaterloggingData({
          available: false,
          message: 'Live waterlogging data is currently unavailable.',
          reason: 'Unable to connect to municipal telemetry feed.'
        });
      }
    } catch {
      setWaterloggingData({
        available: false,
        message: 'Live waterlogging data is currently unavailable.',
        reason: 'Service temporarily unreachable.'
      });
    } finally {
      setIsTelemetryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // 2. Initialize Google Maps JavaScript API with Real-time Traffic Layer
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        setMapEngineStatus('loading');
        const googleMaps = await loadGoogleMapsJsApi();
        if (isCancelled || !mapContainerRef.current) return;

        // If map is already initialized, update styling and map type
        if (googleMapInstanceRef.current) {
          googleMapInstanceRef.current.setOptions({
            styles: layers.satellite ? [] : (isDarkMode ? DARK_MAP_STYLE : []),
            mapTypeId: layers.satellite ? googleMaps.MapTypeId.HYBRID : googleMaps.MapTypeId.ROADMAP
          });
          setMapEngineStatus('ready');
          return;
        }

        const mapOptions: any = {
          center: JALPAIGURI_CENTER,
          zoom: 14,
          restriction: {
            latLngBounds: JALPAIGURI_BOUNDS,
            strictBounds: true
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          zoomControlOptions: {
            position: googleMaps.ControlPosition.RIGHT_BOTTOM
          },
          styles: isDarkMode ? DARK_MAP_STYLE : []
        };

        const map = new googleMaps.Map(mapContainerRef.current, mapOptions);
        googleMapInstanceRef.current = map;

        // Initialize Traffic Layer
        const trafficLayer = new googleMaps.TrafficLayer();
        if (layers.traffic) {
          trafficLayer.setMap(map);
        }
        trafficLayerRef.current = trafficLayer;

        // Add Corridor Markers if enabled
        renderCorridorMarkers(googleMaps, map);

        setMapEngineStatus('ready');
        setLastRefreshed(new Date());
      } catch (err) {
        console.error('Failed to load Google Maps Traffic component:', err);
        if (!isCancelled) {
          setMapEngineStatus('error');
        }
      }
    }

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [isDarkMode]);

  // Helper to render corridor markers on map
  const renderCorridorMarkers = (googleMaps: any, map: any) => {
    // Clear old markers
    corridorMarkersRef.current.forEach((m) => m.setMap(null));
    corridorMarkersRef.current = [];

    if (!layers.corridors) return;

    JALPAIGURI_CORRIDORS.forEach((corridor) => {
      const marker = new googleMaps.Marker({
        position: { lat: corridor.lat, lng: corridor.lng },
        map: map,
        title: corridor.name,
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#063B2C',
          fillOpacity: 0.95,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });

      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div style="padding: 6px; font-family: sans-serif; max-width: 200px;">
            <strong style="color: #063B2C; font-size: 13px;">${corridor.name}</strong>
            <p style="font-size: 11px; margin: 4px 0 0; color: #555;">${corridor.desc}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        setActiveCorridorId(corridor.id);
        if (onSelectCorridor) onSelectCorridor(corridor);
      });

      corridorMarkersRef.current.push(marker);
    });
  };

  // 3. React to Layer State Changes
  useEffect(() => {
    if (!googleMapInstanceRef.current) return;
    const map = googleMapInstanceRef.current;

    // Traffic Layer Toggle
    if (trafficLayerRef.current) {
      if (layers.traffic) {
        trafficLayerRef.current.setMap(map);
      } else {
        trafficLayerRef.current.setMap(null);
      }
    }

    // Basemap satellite vs roadmap
    if ((window as any).google?.maps) {
      const googleMaps = (window as any).google.maps;
      map.setMapTypeId(layers.satellite ? googleMaps.MapTypeId.HYBRID : googleMaps.MapTypeId.ROADMAP);
      map.setOptions({
        styles: layers.satellite ? [] : (isDarkMode ? DARK_MAP_STYLE : [])
      });

      // Update corridor markers visibility
      renderCorridorMarkers(googleMaps, map);
    }
  }, [layers, isDarkMode]);

  // 4. Auto-refresh traffic layer every 60 seconds
  useEffect(() => {
    autoRefreshTimerRef.current = setInterval(() => {
      handleSilentRefresh();
    }, 60000);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, []);

  // Silent refresh for periodic updates
  const handleSilentRefresh = () => {
    if (trafficLayerRef.current && googleMapInstanceRef.current && layers.traffic) {
      trafficLayerRef.current.setMap(null);
      trafficLayerRef.current.setMap(googleMapInstanceRef.current);
      setLastRefreshed(new Date());
    }
    fetchTelemetry();
  };

  // User-facing manual refresh handler
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    handleSilentRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  // Pan to specific corridor
  const handlePanToCorridor = (corridor: typeof JALPAIGURI_CORRIDORS[0]) => {
    setActiveCorridorId(corridor.id);
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo({ lat: corridor.lat, lng: corridor.lng });
      googleMapInstanceRef.current.setZoom(corridor.zoom);
    }
    if (onSelectCorridor) {
      onSelectCorridor(corridor);
    }
  };

  // Recenter Jalpaiguri Town
  const handleRecenterTown = () => {
    setActiveCorridorId(null);
    if (googleMapInstanceRef.current) {
      googleMapInstanceRef.current.panTo(JALPAIGURI_CENTER);
      googleMapInstanceRef.current.setZoom(14);
    }
  };

  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#16221D] shadow-xs transition-colors duration-200 ${className}`}>
      {/* Top Component Bar: Live Status + Timestamp + Layer Switcher + Refresh */}
      <div className="px-4 py-3 bg-white/95 dark:bg-[#16221D]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 flex items-center justify-between z-20 gap-2">
        {/* 'Live' Status Indicator & Timestamp */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Live</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8]">
            <Clock className="w-3 h-3 text-[#55685F] dark:text-[#9FB2A8]" />
            <span>
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Action Controls: Layer Switcher & Refresh */}
        <div className="flex items-center gap-1.5">
          {/* Layer Switcher Toggle Button */}
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isLayerMenuOpen
                ? 'bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C] border-transparent'
                : 'bg-[#FAF8F5] dark:bg-[#0E1714] text-[#11241C] dark:text-white border-[#E8E4DA] dark:border-white/10 hover:bg-[#F2EFE9] dark:hover:bg-white/5'
            }`}
            title="Toggle map layers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Layers</span>
            {isLayerMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1714] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#55685F] dark:text-[#9FB2A8] hover:text-[#063B2C] dark:hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh live road conditions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#063B2C] dark:text-[#34D399]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Layer Toggle Dropdown Drawer */}
      {isLayerMenuOpen && (
        <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#0E1714] border-b border-[#E8E4DA] dark:border-white/10 z-20 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-[#55685F] dark:text-[#9FB2A8]">
            <span>Active Map Layers</span>
            <span className="text-[10px] lowercase text-[#8C9B93]">toggle real-time overlays</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Layer 1: Google Maps Traffic */}
            <button
              onClick={() => setLayers((prev) => ({ ...prev, traffic: !prev.traffic }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.traffic
                  ? 'bg-white dark:bg-[#16221D] border-emerald-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#11241C] dark:text-white">
                  <Navigation className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
                  <span>Traffic Flow</span>
                </div>
                <p className="text-[10px] text-[#55685F] dark:text-[#9FB2A8]">
                  Google real-time speeds
                </p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.traffic ? 'bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            {/* Layer 2: Waterlogging Telemetry */}
            <button
              onClick={() => setLayers((prev) => ({ ...prev, waterlogging: !prev.waterlogging }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.waterlogging
                  ? 'bg-white dark:bg-[#16221D] border-blue-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#11241C] dark:text-white">
                  <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Waterlogging</span>
                </div>
                <p className="text-[10px] text-[#55685F] dark:text-[#9FB2A8]">
                  Drainage telemetry
                </p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.waterlogging ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            {/* Layer 3: Key Transit Corridors */}
            <button
              onClick={() => setLayers((prev) => ({ ...prev, corridors: !prev.corridors }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.corridors
                  ? 'bg-white dark:bg-[#16221D] border-[#063B2C]/40 dark:border-[#34D399]/40 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#11241C] dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
                  <span>Corridors</span>
                </div>
                <p className="text-[10px] text-[#55685F] dark:text-[#9FB2A8]">
                  Artery hot spots
                </p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.corridors ? 'bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C]' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            {/* Layer 4: Satellite Hybrid Basemap */}
            <button
              onClick={() => setLayers((prev) => ({ ...prev, satellite: !prev.satellite }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.satellite
                  ? 'bg-white dark:bg-[#16221D] border-amber-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#11241C] dark:text-white">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Satellite View</span>
                </div>
                <p className="text-[10px] text-[#55685F] dark:text-[#9FB2A8]">
                  Aerial terrain layer
                </p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.satellite ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Map Stage Container */}
      <div
        className="relative w-full bg-[#E3EDF3] dark:bg-[#121A16] overflow-hidden"
        style={{ height: formattedHeight }}
      >
        {/* Google Maps Container */}
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          id="google-maps-live-traffic-canvas"
        />

        {/* Map Loading State Overlay */}
        {mapEngineStatus === 'loading' && (
          <div className="absolute inset-0 bg-[#FAF8F5]/85 dark:bg-[#0E1714]/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-6 h-6 text-[#063B2C] dark:text-[#34D399] animate-spin" />
            <p className="text-xs font-extrabold text-[#11241C] dark:text-white">
              Connecting to Google Maps Traffic Layer...
            </p>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8]">
              Loading live transit conditions in Jalpaiguri
            </p>
          </div>
        )}

        {/* Map Load Error State */}
        {mapEngineStatus === 'error' && (
          <div className="absolute inset-0 bg-[#FAF8F5]/95 dark:bg-[#0E1714]/95 p-6 flex flex-col items-center justify-center text-center gap-3 z-10">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                Google Maps Traffic Unavailable
              </h3>
              <p className="text-[11px] text-[#55685F] dark:text-[#9FB2A8] mt-1 max-w-xs">
                Ensure <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[10px]">GOOGLE_MAPS_API_KEY</code> is set in settings.
              </p>
            </div>
            <button
              onClick={handleManualRefresh}
              className="px-3 py-1.5 rounded-xl bg-[#063B2C] text-white text-xs font-bold active:scale-95"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Floating Controls Over Map */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5">
          {/* Recenter Button */}
          <button
            onClick={handleRecenterTown}
            className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#16221D]/95 backdrop-blur-md border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Recenter Jalpaiguri Town"
          >
            <Compass className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
            <span>Center Jalpaiguri</span>
          </button>
        </div>

        {/* Active Layer Tag Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {layers.traffic && (
            <div className="px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[#16221D]/95 backdrop-blur-md border border-[#E8E4DA] dark:border-white/10 shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[10px] font-extrabold text-[#11241C] dark:text-white">
                Traffic Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Flow Legend Bar */}
      {layers.traffic && (
        <div className="px-4 py-2 bg-white dark:bg-[#16221D] border-t border-[#E8E4DA] dark:border-white/10 flex items-center justify-between text-[10px] font-bold">
          <span className="text-[#55685F] dark:text-[#9FB2A8]">Google Traffic Flow:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span className="text-[#55685F] dark:text-[#9FB2A8]">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <span className="text-[#55685F] dark:text-[#9FB2A8]">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#EF4444]"></span>
              <span className="text-[#55685F] dark:text-[#9FB2A8]">Slow</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#7F1D1D]"></span>
              <span className="text-[#55685F] dark:text-[#9FB2A8]">Heavy</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Corridor Shortcuts */}
      {showCorridorShortcuts && (
        <div className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#0E1714] border-t border-[#E8E4DA] dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55685F] dark:text-[#9FB2A8]">
              Jalpaiguri Corridors
            </span>
            <span className="text-[10px] text-[#8C9B93]">Tap to inspect</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {JALPAIGURI_CORRIDORS.map((c) => {
              const isActive = activeCorridorId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => handlePanToCorridor(c)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C] shadow-xs'
                      : 'bg-white dark:bg-[#16221D] text-[#11241C] dark:text-[#E8F0EC] border border-[#E8E4DA] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/5'
                  }`}
                >
                  {c.shortName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Telemetry Status Card (Waterlogging Real-Data Disclosure) */}
      {showTelemetryCard && layers.waterlogging && (
        <div className="p-3.5 bg-white dark:bg-[#16221D] border-t border-[#E8E4DA] dark:border-white/10 space-y-2">
          {isTelemetryLoading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#55685F] dark:text-[#9FB2A8]">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#063B2C] dark:text-[#34D399]" />
              <span>Querying Jalpaiguri telemetry feeds...</span>
            </div>
          ) : waterloggingData?.available ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#063B2C] dark:text-[#34D399]">
                <span>{waterloggingData.source || 'Municipal Telemetry'}</span>
                <span className="text-[10px] text-[#8C9B93] font-normal">{waterloggingData.lastUpdated}</span>
              </div>
              <p className="text-[11px] text-[#55685F] dark:text-[#9FB2A8]">
                {waterloggingData.attribution}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                    Live waterlogging data is currently unavailable.
                  </h4>
                  <p className="text-[10px] leading-relaxed text-[#55685F] dark:text-[#9FB2A8]">
                    No official municipal sensor feeds are currently configured for Jalpaiguri. In accordance with strict civic data integrity standards, synthetic or simulated waterlogging markers are never displayed.
                  </p>
                </div>
              </div>

              {/* Observed Real-time Rainfall from Open-Meteo */}
              {waterloggingData?.liveWeatherObservation && (
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#0E1714] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
                    <span className="text-[11px] font-bold text-[#11241C] dark:text-white">
                      Observed Precipitation
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#063B2C] dark:text-[#34D399]">
                    {waterloggingData.liveWeatherObservation.precipitation_mm} mm/h
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE1] dark:border-white/5">
                <span className="text-[10px] text-[#55685F] dark:text-[#9FB2A8]">
                  Witnessing water congestion?
                </span>
                <button
                  onClick={() => navigate('report-problem', { preselectedCategory: 'Water / Drainage' })}
                  className="text-xs font-extrabold text-[#063B2C] dark:text-[#34D399] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Report Water Issue</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
