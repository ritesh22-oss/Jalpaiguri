import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  ControlPosition,
  MapControl,
  Marker,
  Map,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { apiClient } from '../../services/apiClient';

// Map handler to update map viewport and marker
const MapHandler = ({ place }: { place: google.maps.places.PlaceResult | null }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
      // Apply terrain view for immersive spatial experience
      setTimeout(() => {
        map.setMapTypeId('terrain');
      }, 100);
    } else if (place.geometry?.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
      setTimeout(() => {
        map.setMapTypeId('terrain');
      }, 100);
    }
  }, [map, place]);

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
        placeholder="Search for a location (Terrain View)..." 
        className="p-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-800 font-semibold focus:border-blue-500 transition-colors shadow-sm" 
      />
      <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm">Search</button>
    </div>
  );
};

export const GooglePlacesMap: React.FC<{className?: string}> = ({ className }) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envKey) {
          setApiKey(envKey);
          setLoading(false);
          return;
        }
        
        const res = await apiClient.getGoogleMapsKey();
        if (res.apiKey) {
          setApiKey(res.apiKey);
        }
      } catch (err) {
        console.error("Failed to load Maps API key", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKey();
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl ${className}`}>
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-2xl ${className}`}>
        <p className="text-gray-500 font-medium text-sm">Google Maps Unavailable</p>
        <p className="text-gray-400 text-xs mt-1">Configure VITE_GOOGLE_MAPS_API_KEY</p>
      </div>
    );
  }

  const markerPosition = selectedPlace?.geometry?.location;

  return (
    <div className={className}>
      <APIProvider
        apiKey={apiKey}
        solutionChannel="gmp_mcp_codeassist_v1_aistudio">
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: 26.5077, lng: 88.4477 }}
          gestureHandling={'greedy'}
          disableDefaultUI={false}
          mapTypeId={'terrain'}
          className="w-full h-full rounded-2xl overflow-hidden shadow-xs"
        >
          {markerPosition && <Marker position={markerPosition} />}
        </Map>
        <MapControl position={ControlPosition.TOP_CENTER}>
          <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-gray-200 m-4">
            <PlaceSearch onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>
        <MapHandler place={selectedPlace} />
      </APIProvider>
    </div>
  );
};
