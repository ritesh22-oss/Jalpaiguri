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

// Place Autocomplete component
const PlaceAutocomplete = ({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void }) => {
  const [placeAutocomplete, setPlaceAutocomplete] =
    useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address']
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <input ref={inputRef} placeholder="Search for a place..." className="p-2 border rounded-md" />
    </div>
  );
};

export const GooglePlacesMap: React.FC<{className?: string}> = ({ className }) => {
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <div className={className}>
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}>
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
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>
        <MapHandler place={selectedPlace} marker={marker} />
      </APIProvider>
    </div>
  );
};
