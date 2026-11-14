import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMapCanvas,
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
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
  CloudRain,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNav } from '../../context/NavigationContext';
import {
  DEFAULT_GOOGLE_MAP_ID,
  GMP_SOLUTION_CHANNEL,
  MyJpgMapsProvider,
  useGoogleMapsApiKey
} from '../../utils/googleMapsHelpers';

const JALPAIGURI_CENTER = { lat: 26.5228, lng: 88.7245 };

export const JALPAIGURI_CORRIDORS = [
  {
    id: 'nh-27',
    name: 'NH-27 Teesta Bridge Bypass',
    shortName: 'NH-27 Bypass',
    type: 'Highway Transit',
    lat: 26.541,
    lng: 88.745,
    zoom: 15,
    desc: 'Major interstate freight and passenger corridor connecting Jalpaiguri to Siliguri & Guwahati.'
  },
  {
    id: 'dinbazar',
    name: 'Dinbazar Wholesale Market More',
    shortName: 'Dinbazar Market',
    type: 'Commercial Core',
    lat: 26.528,
    lng: 88.721,
    zoom: 16,
    desc: 'Dense commercial artery via DB Road with high auto-rickshaw and pedestrian density.'
  },
  {
    id: 'kadamtala',
    name: 'Kadamtala - Hospital Road Corridor',
    shortName: 'Kadamtala More',
    type: 'Emergency Route',
    lat: 26.523,
    lng: 88.729,
    zoom: 16,
    desc: 'Primary transit route between Sadar Hospital, central administrative offices, and railway gates.'
  },
  {
    id: 'mohitnagar',
    name: 'Mohitnagar - Raninagar Industrial Belt',
    shortName: 'Mohitnagar Belt',
    type: 'Industrial Link',
    lat: 26.536,
    lng: 88.742,
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
  onSelectCorridor?: (corridor: (typeof JALPAIGURI_CORRIDORS)[0]) => void;
}

const TrafficLayerController: React.FC<{ enabled: boolean; refreshTick: number }> = ({
  enabled,
  refreshTick
}) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const layerRef = useRef<google.maps.TrafficLayer | null>(null);

  useEffect(() => {
    if (!map || !mapsLib) return;
    if (!layerRef.current) {
      layerRef.current = new mapsLib.TrafficLayer();
    }

    if (enabled) {
      layerRef.current.setMap(null);
      layerRef.current.setMap(map);
    } else {
      layerRef.current.setMap(null);
    }

    return () => {
      layerRef.current?.setMap(null);
    };
  }, [map, mapsLib, enabled, refreshTick]);

  return null;
};

const TrafficCameraController: React.FC<{
  target: { lat: number; lng: number; zoom: number; seq: number } | null;
}> = ({ target }) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo({ lat: target.lat, lng: target.lng });
    map.setZoom(target.zoom);
  }, [map, target]);
  return null;
};

export const LiveTrafficWaterlogging: React.FC<LiveTrafficWaterloggingProps> = ({
  className = '',
  height = '48vh',
  showCorridorShortcuts = true,
  showTelemetryCard = true,
  onSelectCorridor
}) => {
  const { isDarkMode } = useTheme();
  const { navigate } = useNav();
  const { apiKey, isLoading: isKeyLoading } = useGoogleMapsApiKey();

  const [layers, setLayers] = useState({
    traffic: true,
    waterlogging: true,
    corridors: true,
    satellite: false
  });

  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const [activeCorridorId, setActiveCorridorId] = useState<string | null>(null);
  const [cameraTarget, setCameraTarget] = useState<{ lat: number; lng: number; zoom: number; seq: number } | null>(null);
  const seqRef = useRef(0);

  const [waterloggingData, setWaterloggingData] = useState<any>(null);
  const [isTelemetryLoading, setIsTelemetryLoading] = useState<boolean>(true);
  const autoRefreshTimerRef = useRef<any>(null);

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

  const handleSilentRefresh = useCallback(() => {
    setRefreshTick((t) => t + 1);
    setLastRefreshed(new Date());
    void fetchTelemetry();
  }, [fetchTelemetry]);

  useEffect(() => {
    autoRefreshTimerRef.current = setInterval(() => {
      handleSilentRefresh();
    }, 60000);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
    };
  }, [handleSilentRefresh]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    handleSilentRefresh();
    setTimeout(() => setIsRefreshing(false), 700);
  };

  const handlePanToCorridor = (corridor: (typeof JALPAIGURI_CORRIDORS)[0]) => {
    setActiveCorridorId(corridor.id);
    seqRef.current += 1;
    setCameraTarget({ lat: corridor.lat, lng: corridor.lng, zoom: corridor.zoom, seq: seqRef.current });
    if (onSelectCorridor) {
      onSelectCorridor(corridor);
    }
  };

  const handleRecenterTown = () => {
    setActiveCorridorId(null);
    seqRef.current += 1;
    setCameraTarget({ lat: JALPAIGURI_CENTER.lat, lng: JALPAIGURI_CENTER.lng, zoom: 14, seq: seqRef.current });
  };

  const activeCorridor = JALPAIGURI_CORRIDORS.find((c) => c.id === activeCorridorId) || null;
  const formattedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`relative flex flex-col rounded-3xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 bg-white dark:bg-[#1E293B] shadow-xs transition-colors duration-200 ${className}`}
    >
      {/* Top Component Bar */}
      <div className="px-4 py-3 bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 flex items-center justify-between z-20 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/15 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span>Live</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            <span>
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              isLayerMenuOpen
                ? 'bg-[#007AFF] dark:bg-[#60A5FA] text-white dark:text-[#0F172A] border-transparent'
                : 'bg-[#FAF8F5] dark:bg-[#020617] text-[#0F172A] dark:text-white border-[#E8E4DA] dark:border-white/10 hover:bg-[#F2EFE9] dark:hover:bg-white/5'
            }`}
            title="Toggle map layers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Layers</span>
            {isLayerMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-xl bg-[#FAF8F5] dark:bg-[#020617] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-[#007AFF] dark:hover:text-white active:scale-95 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh live road conditions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#007AFF] dark:text-[#60A5FA]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Layer Toggle Dropdown Drawer */}
      {isLayerMenuOpen && (
        <div className="px-4 py-3 bg-[#FAF8F5] dark:bg-[#020617] border-b border-[#E8E4DA] dark:border-white/10 z-20 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span>Active Map Layers</span>
            <span className="text-[10px] lowercase text-slate-400">toggle real-time overlays</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLayers((prev) => ({ ...prev, traffic: !prev.traffic }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.traffic
                  ? 'bg-white dark:bg-[#1E293B] border-blue-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                  <Navigation className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                  <span>Traffic Flow</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Google real-time speeds</p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.traffic ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            <button
              onClick={() => setLayers((prev) => ({ ...prev, waterlogging: !prev.waterlogging }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.waterlogging
                  ? 'bg-white dark:bg-[#1E293B] border-blue-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                  <Waves className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Waterlogging</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Drainage telemetry</p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.waterlogging ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            <button
              onClick={() => setLayers((prev) => ({ ...prev, corridors: !prev.corridors }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.corridors
                  ? 'bg-white dark:bg-[#1E293B] border-[#007AFF]/40 dark:border-[#60A5FA]/40 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                  <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                  <span>Corridors</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Artery hot spots</p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.corridors ? 'bg-[#007AFF] text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>

            <button
              onClick={() => setLayers((prev) => ({ ...prev, satellite: !prev.satellite }))}
              className={`p-2.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                layers.satellite
                  ? 'bg-white dark:bg-[#1E293B] border-amber-500/50 shadow-xs'
                  : 'bg-white/50 dark:bg-white/5 border-dashed border-[#E8E4DA] dark:border-white/10 opacity-70'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Satellite View</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Aerial terrain layer</p>
              </div>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${layers.satellite ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-white/10 text-transparent'}`}>
                ✓
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Map Stage Container */}
      <div className="relative w-full bg-slate-200 dark:bg-slate-900 overflow-hidden" style={{ height: formattedHeight }}>
        {isKeyLoading ? (
          <div className="w-full h-full bg-[#FAF8F5]/85 dark:bg-[#020617]/85 flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-6 h-6 text-[#007AFF] dark:text-[#60A5FA] animate-spin" />
            <p className="text-xs font-extrabold text-[#0F172A] dark:text-white">
              Connecting to Google Maps Traffic Layer...
            </p>
          </div>
        ) : !apiKey ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
            <h3 className="text-xs font-extrabold text-[#0F172A] dark:text-white">
              Live Traffic Offline
            </h3>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Configure GOOGLE_MAPS_API_KEY to view live Google Traffic Flow.
            </p>
          </div>
        ) : (
          <MyJpgMapsProvider apiKey={apiKey}>
            <GoogleMapCanvas
              mapId={DEFAULT_GOOGLE_MAP_ID}
              defaultCenter={JALPAIGURI_CENTER}
              defaultZoom={14}
              mapTypeId={layers.satellite ? 'hybrid' : 'roadmap'}
              colorScheme={isDarkMode ? 'DARK' : 'LIGHT'}
              gestureHandling="greedy"
              disableDefaultUI={false}
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={false}
              internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
              className="w-full h-full"
            >
              <TrafficLayerController enabled={layers.traffic} refreshTick={refreshTick} />
              <TrafficCameraController target={cameraTarget} />

              {layers.corridors &&
                JALPAIGURI_CORRIDORS.map((corridor) => (
                  <AdvancedMarker
                    key={corridor.id}
                    position={{ lat: corridor.lat, lng: corridor.lng }}
                    title={corridor.name}
                    onClick={() => handlePanToCorridor(corridor)}
                  >
                    <Pin
                      background={activeCorridorId === corridor.id ? '#2563EB' : '#007AFF'}
                      borderColor="#FFFFFF"
                      glyphColor="#FFFFFF"
                    />
                  </AdvancedMarker>
                ))}

              {layers.corridors && activeCorridor && (
                <InfoWindow
                  position={{ lat: activeCorridor.lat, lng: activeCorridor.lng }}
                  onCloseClick={() => setActiveCorridorId(null)}
                >
                  <div className="p-1 font-sans max-w-[210px]">
                    <p className="text-xs font-extrabold text-[#007AFF]">{activeCorridor.name}</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">{activeCorridor.desc}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMapCanvas>
          </MyJpgMapsProvider>
        )}

        {/* Floating Controls Over Map */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleRecenterTown}
            className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E8E4DA] dark:border-white/10 text-[#0F172A] dark:text-white text-xs font-bold shadow-md flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
            title="Recenter Jalpaiguri Town"
          >
            <Compass className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
            <span>Center Jalpaiguri</span>
          </button>
        </div>

        {/* Active Layer Tag Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {layers.traffic && (
            <div className="px-2.5 py-1 rounded-xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-md border border-[#E8E4DA] dark:border-white/10 shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="text-[10px] font-extrabold text-[#0F172A] dark:text-white">
                Traffic Active
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Traffic Flow Legend Bar */}
      {layers.traffic && (
        <div className="px-4 py-2 bg-white dark:bg-[#1E293B] border-t border-[#E8E4DA] dark:border-white/10 flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-500 dark:text-slate-400">Google Traffic Flow:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span className="text-slate-500 dark:text-slate-400">Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
              <span className="text-slate-500 dark:text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#EF4444]"></span>
              <span className="text-slate-500 dark:text-slate-400">Slow</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 rounded-full bg-[#7F1D1D]"></span>
              <span className="text-slate-500 dark:text-slate-400">Heavy</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Corridor Shortcuts */}
      {showCorridorShortcuts && (
        <div className="px-4 py-2.5 bg-[#FAF8F5] dark:bg-[#020617] border-t border-[#E8E4DA] dark:border-white/10">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Jalpaiguri Corridors
            </span>
            <span className="text-[10px] text-slate-400">Tap to inspect</span>
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
                      ? 'bg-[#007AFF] dark:bg-[#60A5FA] text-white dark:text-[#0F172A] shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#E2E8F0] border border-[#E8E4DA] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/5'
                  }`}
                >
                  {c.shortName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Telemetry Status Card */}
      {showTelemetryCard && layers.waterlogging && (
        <div className="p-3.5 bg-white dark:bg-[#1E293B] border-t border-[#E8E4DA] dark:border-white/10 space-y-2">
          {isTelemetryLoading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#007AFF] dark:text-[#60A5FA]" />
              <span>Querying Jalpaiguri telemetry feeds...</span>
            </div>
          ) : waterloggingData?.available ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#007AFF] dark:text-[#60A5FA]">
                <span>{waterloggingData.source || 'Municipal Telemetry'}</span>
                <span className="text-[10px] text-slate-400 font-normal">{waterloggingData.lastUpdated}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                  <h4 className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                    Live waterlogging data is currently unavailable.
                  </h4>
                  <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                    No official municipal sensor feeds are currently configured for Jalpaiguri. In accordance with strict civic data integrity standards, synthetic or simulated waterlogging markers are never displayed.
                  </p>
                </div>
              </div>

              {waterloggingData?.liveWeatherObservation && (
                <div className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-[#020617] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#60A5FA]" />
                    <span className="text-[11px] font-bold text-[#0F172A] dark:text-white">
                      Observed Precipitation
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-[#007AFF] dark:text-[#60A5FA]">
                    {waterloggingData.liveWeatherObservation.precipitation_mm} mm/h
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-[#F0ECE1] dark:border-white/5">
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Witnessing water congestion?
                </span>
                <button
                  onClick={() => navigate('report-problem', { preselectedCategory: 'Water / Drainage' })}
                  className="text-xs font-extrabold text-[#007AFF] dark:text-[#60A5FA] hover:underline flex items-center gap-1 cursor-pointer"
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
