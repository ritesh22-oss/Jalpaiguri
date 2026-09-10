import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';

// Map handler to update map viewport and marker
const MapHandler = ({ place, marker }: { place: google.maps.places.PlaceResult | null, marker: any }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }
    marker.position = place.geometry?.location || null;
  }, [map, place, marker]);

  return null;
};

// Place Search helper
const PlaceSearch = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) => {
  const [query, setQuery] = useState('');
  const places = useMapsLibrary('places');
  const map = useMap();

  const handleSearch = () => {
    if (!places || !map || !query) return;
    
    const service = new places.PlacesService(map);
    const request = {
      query: query,
      fields: ['geometry', 'name', 'formatted_address', 'place_id']
    };

    service.textSearch(request, (results, status) => {
      if (status === places.PlacesServiceStatus.OK && results && results[0]) {
        onPlaceSelect(results[0]);
      } else {
        alert("Couldn't find that location. Try a more specific place name.");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search for a place..." 
        className="p-2 border rounded-md" 
      />
      <button onClick={handleSearch} className="bg-blue-500 text-white p-2 rounded-md">Search</button>
    </div>
  );
};

export const GooglePlacesMap: React.FC<{className?: string}> = ({ className }) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl ${className}`}>
        <p className="text-gray-500 font-medium text-sm">Google Maps Unavailable</p>
        <p className="text-gray-400 text-xs mt-1">Configure VITE_GOOGLE_MAPS_API_KEY</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <APIProvider
        apiKey={apiKey}
        solutionChannel="gmp_mcp_codeassist_v1_aistudio">
        <Map
          mapId={'DEMO_MAP_ID'}
          defaultZoom={13}
          defaultCenter={{ lat: 26.5077, lng: 88.4477 }}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          className="w-full h-full"
        >
          <AdvancedMarker ref={markerRef} position={null} />
        </Map>
        <MapControl position={ControlPosition.TOP_CENTER}>
          <div className="bg-white p-2 rounded-lg shadow-md m-2">
            <PlaceSearch onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>
        <MapHandler place={selectedPlace} marker={marker} />
      </APIProvider>
    </div>
  );
};
