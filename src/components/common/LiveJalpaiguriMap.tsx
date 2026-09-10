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
  AlertCircle,
  X,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useNav } from '../../context/NavigationContext';
import { JALPAIGURI_SERVICE_REGION } from '../../data/jalpaiguriLocalities';
import apiClient from '../../services/apiClient';

interface LiveJalpaiguriMapProps {
  className?: string;
  height?: number;
  showDetails?: boolean;
  searchQuery?: string;
}

export const LiveJalpaiguriMap: React.FC<LiveJalpaiguriMapProps> = ({
  className = '',
  height = 220,
  showDetails = true,
  searchQuery = ''
}) => {
  const { location, requestCurrentLocation, status, isWithinServiceRegion, distanceToServiceRegionKm, setManualLocation } = useLocation();
  const { navigate } = useNav();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const jalpaiguriMarkerRef = useRef<L.Marker | null>(null);
  const connectingLineRef = useRef<L.Polyline | null>(null);
  const routeLayerRef = useRef<L.GeoJSON | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);

  const [activeView, setActiveView] = useState<'user' | 'jalpaiguri' | 'both' | 'search'>('user');
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSearch, setFullscreenSearch] = useState(searchQuery || '');
  const [destination, setDestination] = useState<{name: string, lat: number, lng: number} | null>(null);

  const isFullscreenRef = useRef(isFullscreen);
  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);


  const handleSetDestination = async (lat: number, lng: number, name: string) => {
    setDestination({ lat, lng, name });
    
    // Add destination marker
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setLatLng([lat, lng]);
      destinationMarkerRef.current.getPopup()?.setContent(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563EB; font-size: 13px;">📍 ${name}</strong>
          <p style="margin: 2px 0 0; font-size: 11px; color: #374151;">Destination</p>
        </div>
      `);
      destinationMarkerRef.current.openPopup();
    } else {
      const destIcon = L.divIcon({
        className: 'dest-location-pin',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background: rgba(37, 99, 235, 0.35); animation: ping-slow 2s infinite;"></div>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #1E40AF; border: 3px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background: #60A5FA;"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });
      const marker = L.marker([lat, lng], { icon: destIcon }).addTo(mapInstanceRef.current!);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563EB; font-size: 13px;">📍 ${name}</strong>
          <p style="margin: 2px 0 0; font-size: 11px; color: #374151;">Destination</p>
        </div>
      `);
      destinationMarkerRef.current = marker;
      marker.openPopup();
    }

    // Fetch route from location to destination
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${lng},${lat}?overview=full&geometries=geojson`);
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        if (routeLayerRef.current) {
          routeLayerRef.current.remove();
        }
        
        routeLayerRef.current = L.geoJSON(data.routes[0].geometry, {
          style: {
            color: '#2563EB',
            weight: 5,
            opacity: 0.8
          }
        }).addTo(mapInstanceRef.current!);
        
        const bounds = L.latLngBounds([
          [location.lat, location.lng],
          [lat, lng]
        ]);
        mapInstanceRef.current!.fitBounds(bounds, { padding: [40, 40], animate: true });
      }
    } catch (e) {
      console.error("Route fetching failed", e);
    }
  };

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

      // Manual Location Selection on Map Click
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const response = await apiClient.reverseGeocode(lat, lng);
          const shortName = response.success ? response.name : 'Selected Location';
          
          if (isFullscreenRef.current) {
            handleSetDestination(lat, lng, shortName);
          } else {
            setManualLocation({
              name: shortName,
              locality: response.success ? response.locality : 'Selected Location',
              lat,
              lng,
              city: response.success ? response.city : 'Jalpaiguri'
            });
            setActiveView('user');
          }
        } catch (err) {
          if (isFullscreenRef.current) {
            handleSetDestination(lat, lng, "Selected Location");
          } else {
            setManualLocation({
              name: "Selected Location",
              locality: "Selected Location",
              lat,
              lng
            });
            setActiveView('user');
          }
        }
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);
    }

    return () => {
      userMarkerRef.current = null;
      jalpaiguriMarkerRef.current = null;
      connectingLineRef.current = null;
      destinationMarkerRef.current = null;
      routeLayerRef.current = null;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
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
            <div style="width: 6px; height: 6px; border-radius: 9999px; background: #60A5FA;"></div>
          </div>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([location.lat, location.lng]);
      userMarkerRef.current.getPopup()?.setContent(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #064E3B; font-size: 13px;">📍 ${location.name}</strong>
        </div>
      `);
      if (activeView === 'user') {
        userMarkerRef.current.openPopup();
      }
    } else {
      const marker = L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #064E3B; font-size: 13px;">📍 ${location.name}</strong>
        </div>
      `);
      userMarkerRef.current = marker;
      if (activeView === 'user') {
        marker.openPopup();
      }
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

  const performSearch = async (query: string) => {
    if (!query || !mapInstanceRef.current) return;
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Jalpaiguri, West Bengal, India')}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const searchLat = parseFloat(lat);
        const searchLng = parseFloat(lon);
        
        const map = mapInstanceRef.current!;
        let shortName = display_name ? display_name.split(',')[0] : 'Search Result';
        
        // Try to reverse geocode to get a better name if it's too long or generic
        try {
          const revRes = await apiClient.reverseGeocode(searchLat, searchLng);
          if (revRes.success) {
            shortName = revRes.name;
          }
        } catch (e) {
          // fallback to display_name
        }

        if (isFullscreen) {
          handleSetDestination(searchLat, searchLng, shortName);
        } else {
          setManualLocation({
            name: shortName,
            locality: shortName,
            lat: searchLat,
            lng: searchLng,
            city: 'Jalpaiguri'
          });
          setActiveView('user');
          map.setView([searchLat, searchLng], 15, { animate: true });
        }
      }
    } catch (e) {
      console.error("Search failed", e);
    }
  };

  useEffect(() => {
    if (searchQuery) performSearch(searchQuery);
  }, [searchQuery]);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 150);
  };

  return (
    <div className={isFullscreen 
      ? "fixed inset-0 z-50 bg-white flex flex-col w-full h-full" 
      : `bg-white border border-[#E8E4DA] rounded-3xl overflow-hidden shadow-xs flex flex-col ${className}`
    }>
      {/* Header Bar */}
      {isFullscreen ? (
        <div className="px-4 py-3 border-b border-[#F0ECE1] bg-white flex items-center gap-3 shrink-0 shadow-sm z-10 relative">
          <button onClick={toggleFullscreen} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer shrink-0">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div className="flex-1 relative flex items-center bg-gray-100/80 rounded-full border border-gray-200/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:bg-white transition-all shadow-inner">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search destination..."
              className="w-full bg-transparent py-2.5 pl-10 pr-12 text-sm font-medium focus:outline-none"
              value={fullscreenSearch}
              onChange={(e) => setFullscreenSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && fullscreenSearch.trim()) {
                  performSearch(fullscreenSearch);
                }
              }}
            />
            <button 
              onClick={() => performSearch(fullscreenSearch)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shrink-0 shadow-sm"
              title="Navigate"
            >
              <Navigation className="w-4 h-4 ml-[1px]" />
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 border-b border-[#F0ECE1] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#E6F4EA] text-[#007AFF] flex items-center justify-center">
              <Compass className="w-4 h-4 text-[#007AFF]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-[#11241C] tracking-tight">
                  Live Jalpaiguri Civic Map
                </h3>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
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
                onClick={() => setActiveView('both')}
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
      <div className={`relative w-full overflow-hidden ${isFullscreen ? 'flex-1' : ''}`} style={!isFullscreen ? { height: `${height}px` } : {}}>
        <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#E5E7EB]" />

        {/* Floating Controls Overlay */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 drop-shadow-sm">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-700 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4.5 h-4.5" />
          </button>
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
            onClick={toggleFullscreen}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 text-gray-800 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm"
            title="Open Fullscreen Map"
            aria-label="Open Fullscreen Map"
          >
            {!isFullscreen ? (
              <Maximize2 className="w-4.5 h-4.5" />
            ) : (
              <X className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Floating "You Are Here" Badge on Map */}
        <div className="absolute left-3 bottom-3 z-10 max-w-[78%] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
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
              <MapPin className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
              <span className="font-bold text-[#11241C] truncate">
                {location.name}
              </span>
            </div>

            {location.locationSource === 'gps' ? (
              <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
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
