import React, { useEffect, useRef, useState } from 'react';
import { AdvancedMarker, Map as GoogleMapCanvas, Pin, useMapsLibrary } from '@vis.gl/react-google-maps';
import { ArrowLeft, Compass, EyeOff, Loader2, MapPin, Navigation, RefreshCcw, X } from 'lucide-react';
import apiClient, { JourneyPreviewStop } from '../../services/apiClient';
import { DEFAULT_GOOGLE_MAP_ID, GMP_SOLUTION_CHANNEL } from '../../utils/googleMapsHelpers';

export interface StreetExplorerTarget {
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  heading?: number;
  panoId?: string | null;
}

interface StreetViewExplorerModalProps {
  target: StreetExplorerTarget;
  journeyStops?: JourneyPreviewStop[];
  onClose: () => void;
  onSelectTarget?: (next: StreetExplorerTarget) => void;
}

export const StreetViewExplorerModal: React.FC<StreetViewExplorerModalProps> = ({
  target,
  journeyStops = [],
  onClose,
  onSelectTarget
}) => {
  const streetViewLib = useMapsLibrary('streetView');
  const panoContainerRef = useRef<HTMLDivElement | null>(null);
  const panoInstanceRef = useRef<google.maps.StreetViewPanorama | null>(null);

  const [status, setStatus] = useState<'checking' | 'ready' | 'unavailable' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nearestPano, setNearestPano] = useState<{
    lat: number;
    lng: number;
    panoId?: string | null;
    distanceMeters?: number;
  } | null>(null);
  const [livePosition, setLivePosition] = useState<{ lat: number; lng: number }>({
    lat: target.lat,
    lng: target.lng
  });
  const [liveDescription, setLiveDescription] = useState<string>(target.subtitle || target.title);
  const [captureDate, setCaptureDate] = useState<string | null>(null);
  const [copyrightText, setCopyrightText] = useState<string>('© Google');

  const loadPanorama = async () => {
    if (!streetViewLib || !panoContainerRef.current) return;

    setStatus('checking');
    setErrorMessage(null);
    setNearestPano(null);
    setLivePosition({ lat: target.lat, lng: target.lng });
    setLiveDescription(target.subtitle || target.title);

    let resolvedPano: {
      lat: number;
      lng: number;
      panoId?: string | null;
      date?: string | null;
      copyright?: string;
    } | null = null;

    if (target.panoId) {
      resolvedPano = { lat: target.lat, lng: target.lng, panoId: target.panoId };
    } else {
      try {
        const meta = await apiClient.getStreetViewMetadata(target.lat, target.lng, { radius: 80 });
        if (meta.available && typeof meta.lat === 'number' && typeof meta.lng === 'number') {
          resolvedPano = {
            lat: meta.lat,
            lng: meta.lng,
            panoId: meta.panoId,
            date: meta.date,
            copyright: meta.copyright
          };
        } else if (meta.status === 'ZERO_RESULTS') {
          if (meta.nearestPano) {
            setNearestPano({
              lat: meta.nearestPano.lat,
              lng: meta.nearestPano.lng,
              panoId: meta.nearestPano.panoId,
              distanceMeters: meta.nearestPano.distanceFromQueryMeters
            });
          }
          setStatus('unavailable');
          return;
        }
      } catch {
        // Fall back to Maps JS StreetViewService below
      }
    }

    if (!resolvedPano) {
      const svService = new streetViewLib.StreetViewService();
      const tryGetPano = (radius: number, source: google.maps.StreetViewSource) =>
        new Promise<google.maps.StreetViewPanoramaData | null>((resolve) => {
          svService.getPanorama(
            {
              location: { lat: target.lat, lng: target.lng },
              radius,
              source,
              preference: google.maps.StreetViewPreference.NEAREST
            },
            (data, svStatus) => {
              if (svStatus === google.maps.StreetViewStatus.OK && data?.location?.latLng) {
                resolve(data);
              } else {
                resolve(null);
              }
            }
          );
        });

      let data =
        (await tryGetPano(85, google.maps.StreetViewSource.OUTDOOR)) ||
        (await tryGetPano(85, google.maps.StreetViewSource.DEFAULT));

      if (!data) {
        const wider = await tryGetPano(350, google.maps.StreetViewSource.DEFAULT);
        if (wider?.location?.latLng) {
          setNearestPano({
            lat: wider.location.latLng.lat(),
            lng: wider.location.latLng.lng(),
            panoId: wider.location.pano
          });
        }
        setStatus('unavailable');
        return;
      }

      const loc = data.location?.latLng;
      if (loc) {
        resolvedPano = {
          lat: loc.lat(),
          lng: loc.lng(),
          panoId: data.location?.pano || null,
          date: (data as any).imageDate || null,
          copyright: data.copyright || '© Google'
        };
      }
    }

    if (!resolvedPano || !panoContainerRef.current) {
      setStatus('unavailable');
      return;
    }

    setLivePosition({ lat: resolvedPano.lat, lng: resolvedPano.lng });
    if (resolvedPano.date) setCaptureDate(resolvedPano.date);
    if (resolvedPano.copyright) setCopyrightText(resolvedPano.copyright);

    try {
      const pano =
        panoInstanceRef.current ||
        new streetViewLib.StreetViewPanorama(panoContainerRef.current, {
          addressControl: false,
          enableCloseButton: false,
          fullscreenControl: false,
          linksControl: true,
          panControl: true,
          zoomControl: true,
          showRoadLabels: true,
          motionTracking: false
        });

      panoInstanceRef.current = pano;

      if (resolvedPano.panoId) {
        pano.setPano(resolvedPano.panoId);
      } else {
        pano.setPosition({ lat: resolvedPano.lat, lng: resolvedPano.lng });
      }

      pano.setPov({
        heading: typeof target.heading === 'number' ? target.heading : 0,
        pitch: 2
      });

      pano.addListener('position_changed', () => {
        const pos = pano.getPosition();
        if (pos) {
          setLivePosition({ lat: pos.lat(), lng: pos.lng() });
        }
      });

      pano.addListener('pano_changed', () => {
        const loc = pano.getLocation();
        if (loc?.description || loc?.shortDescription) {
          setLiveDescription(loc.description || loc.shortDescription || target.title);
        }
      });

      setStatus('ready');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to initialize Street View panorama.');
      setStatus('error');
    }
  };

  useEffect(() => {
    let cancelled = false;
    void loadPanorama().catch((err) => {
      if (!cancelled) {
        setErrorMessage(err?.message || 'Failed to load Street View.');
        setStatus('error');
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelled = true;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [streetViewLib, target.lat, target.lng, target.panoId, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col w-full h-full">
      {/* Top Header: [← Back]   STREET EXPLORER   [Close] */}
      <div className="px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-white/10 text-white flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-black tracking-wide uppercase">Street Explorer</h3>
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-xs sm:max-w-md">
              {target.title} • {liveDescription}
              {captureDate ? ` (${captureDate})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (panoInstanceRef.current) {
                panoInstanceRef.current.setPov({ heading: target.heading ?? 0, pitch: 2 });
                panoInstanceRef.current.setZoom(1);
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
            title="Reset view"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-red-600/80 text-white cursor-pointer transition-colors"
            title="Close Street Explorer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Panorama Canvas + States */}
      <div className="relative flex-1 w-full bg-slate-900 overflow-hidden">
        <div ref={panoContainerRef} className="w-full h-full" />

        {status === 'checking' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-white p-6 text-center z-10">
            <Loader2 className="w-7 h-7 text-sky-400 animate-spin" />
            <p className="text-sm font-extrabold">Loading Google Street View 360° Panorama...</p>
            <p className="text-xs text-slate-300">
              {target.title} ({target.lat.toFixed(5)}, {target.lng.toFixed(5)})
            </p>
          </div>
        )}

        {(status === 'unavailable' || status === 'error') && (
          <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-6 text-center text-white z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center mb-3">
              <EyeOff className="w-7 h-7 text-amber-400" />
            </div>
            <h4 className="text-base font-black">
              {status === 'error'
                ? 'Unable to Load Street View'
                : 'Street View imagery is unavailable at this location'}
            </h4>
            <p className="text-xs text-slate-300 mt-1.5 max-w-sm leading-relaxed">
              {errorMessage ||
                'Google has not captured street-level panoramic photographs at these exact coordinates.'}
            </p>
            <div className="flex items-center gap-2.5 mt-5 flex-wrap justify-center">
              <button
                onClick={() => void loadPanorama()}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              {nearestPano && onSelectTarget && (
                <button
                  onClick={() =>
                    onSelectTarget({
                      title: `${target.title} (Nearest View)`,
                      subtitle: nearestPano.distanceMeters
                        ? `${nearestPano.distanceMeters} m away`
                        : 'Nearest covered road',
                      lat: nearestPano.lat,
                      lng: nearestPano.lng,
                      panoId: nearestPano.panoId
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>
                    Open Nearest Street View
                    {nearestPano.distanceMeters ? ` (${nearestPano.distanceMeters} m)` : ''}
                  </span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer"
              >
                Return to Map
              </button>
            </div>
          </div>
        )}

        {/* Mini-map showing active Street View position */}
        {status === 'ready' && (
          <div className="absolute right-3 bottom-12 sm:bottom-4 w-36 h-28 sm:w-44 sm:h-32 rounded-2xl overflow-hidden border-2 border-white/80 shadow-2xl z-10 bg-white">
            <GoogleMapCanvas
              mapId={DEFAULT_GOOGLE_MAP_ID}
              center={livePosition}
              zoom={16}
              disableDefaultUI={true}
              gestureHandling="none"
              internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
              className="w-full h-full"
            >
              <AdvancedMarker position={livePosition}>
                <Pin background="#007AFF" borderColor="#FFFFFF" glyphColor="#FFFFFF" scale={0.75} />
              </AdvancedMarker>
            </GoogleMapCanvas>
          </div>
        )}

        {/* Google Copyright Attribution */}
        <div className="absolute left-3 bottom-3 z-10 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-white/90 font-medium">
          {copyrightText}
        </div>
      </div>

      {/* Journey Preview Stop Strip when launched from Route Preview */}
      {journeyStops.length > 0 && onSelectTarget && (
        <div className="px-3 py-2.5 bg-slate-950 border-t border-white/10 flex items-center gap-2 overflow-x-auto shrink-0 z-20">
          {journeyStops.map((stop) => {
            const isCurrent =
              Math.abs((stop.panoLat ?? stop.lat) - target.lat) < 0.00025 &&
              Math.abs((stop.panoLng ?? stop.lng) - target.lng) < 0.00025;
            return (
              <button
                key={stop.stopIndex}
                disabled={!stop.streetViewAvailable}
                onClick={() =>
                  onSelectTarget({
                    title: stop.label,
                    subtitle: `${(stop.distanceFromStartMeters / 1000).toFixed(1)} km along route`,
                    lat: stop.panoLat ?? stop.lat,
                    lng: stop.panoLng ?? stop.lng,
                    panoId: stop.panoId,
                    heading: stop.headingDegrees
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-left shrink-0 border transition-all ${
                  !stop.streetViewAvailable
                    ? 'bg-white/5 border-white/10 text-slate-500 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-[#007AFF] border-sky-300 text-white cursor-pointer'
                    : 'bg-white/10 hover:bg-white/20 border-white/15 text-white cursor-pointer'
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{stop.role}</span>
                </p>
                <p className="text-[11px] font-bold truncate max-w-[140px]">{stop.label}</p>
                {!stop.streetViewAvailable && (
                  <p className="text-[9px] text-amber-400">No Street View</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
