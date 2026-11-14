import React, { useEffect, useState } from 'react';
import {
  AdvancedMarker,
  ControlPosition,
  InfoWindow,
  Map as GoogleMapCanvas,
  MapControl,
  Pin,
  useMap
} from '@vis.gl/react-google-maps';
import { apiClient, GooglePlaceNewResult } from '../../services/apiClient';
import {
  DEFAULT_GOOGLE_MAP_ID,
  GMP_SOLUTION_CHANNEL,
  JALPAIGURI_CORE_CENTER,
  MyJpgMapsProvider,
  useGoogleMapsApiKey
} from '../../utils/googleMapsHelpers';

const MapHandler = ({ place }: { place: GooglePlaceNewResult | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place?.location) return;
    map.panTo({ lat: place.location.latitude, lng: place.location.longitude });
    map.setZoom(16);
  }, [map, place]);

  return null;
};

const PlaceSearch = ({
  onResults,
  onPlaceSelect
}: {
  onResults: (places: GooglePlaceNewResult[]) => void;
  onPlaceSelect: (place: GooglePlaceNewResult | null) => void;
}) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setErrorText(null);
    try {
      const res = await apiClient.searchPlacesText({
        textQuery: q,
        lat: JALPAIGURI_CORE_CENTER.lat,
        lng: JALPAIGURI_CORE_CENTER.lng,
        radiusMeters: 25000,
        maxResultCount: 8
      });
      const list = res.places || [];
      onResults(list);
      if (list.length > 0) {
        onPlaceSelect(list[0]);
      } else {
        setErrorText(`No results found for "${q}". Try another Jalpaiguri landmark.`);
      }
    } catch (err: any) {
      setErrorText(err?.message || 'Unable to search Google Places right now.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleSearch()}
          placeholder="Search Jalpaiguri places..."
          className="p-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-800 font-semibold focus:border-blue-500 transition-colors shadow-sm bg-white"
        />
        <button
          onClick={() => void handleSearch()}
          disabled={searching}
          className="bg-[#007AFF] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-60"
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>
      {errorText && <p className="text-xs font-semibold text-amber-700 px-1">{errorText}</p>}
    </div>
  );
};

export const GooglePlacesMap: React.FC<{ className?: string }> = ({ className = 'h-96 w-full' }) => {
  const { apiKey, isLoading } = useGoogleMapsApiKey();
  const [places, setPlaces] = useState<GooglePlaceNewResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceNewResult | null>(null);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl ${className}`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl ${className}`}>
        <p className="text-gray-600 font-semibold text-sm">Google Maps Unavailable</p>
        <p className="text-gray-400 text-xs mt-1">Configure GOOGLE_MAPS_API_KEY</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <MyJpgMapsProvider apiKey={apiKey}>
        <GoogleMapCanvas
          mapId={DEFAULT_GOOGLE_MAP_ID}
          defaultZoom={14}
          defaultCenter={JALPAIGURI_CORE_CENTER}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeId="roadmap"
          internalUsageAttributionIds={[GMP_SOLUTION_CHANNEL]}
          className="w-full h-full rounded-2xl overflow-hidden shadow-xs"
        >
          {places.map((p) =>
            p.location ? (
              <AdvancedMarker
                key={p.id}
                position={{ lat: p.location.latitude, lng: p.location.longitude }}
                title={p.displayName?.text}
                onClick={() => setSelectedPlace(p)}
              >
                <Pin
                  background={selectedPlace?.id === p.id ? '#007AFF' : '#EA4335'}
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                />
              </AdvancedMarker>
            ) : null
          )}

          {selectedPlace?.location && (
            <InfoWindow
              position={{
                lat: selectedPlace.location.latitude,
                lng: selectedPlace.location.longitude
              }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-1 font-sans max-w-[200px]">
                <p className="text-xs font-extrabold text-gray-900">{selectedPlace.displayName?.text}</p>
                {selectedPlace.shortFormattedAddress && (
                  <p className="text-[11px] text-gray-600 mt-0.5">{selectedPlace.shortFormattedAddress}</p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMapCanvas>

        <MapControl position={ControlPosition.TOP_CENTER}>
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-200 m-4">
            <PlaceSearch onResults={setPlaces} onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>

        <MapHandler place={selectedPlace} />
      </MyJpgMapsProvider>
    </div>
  );
};
