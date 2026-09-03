import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Star,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { ExplorePlaceItem } from '../../types';

interface ExplorePlacesMapViewProps {
  places: ExplorePlaceItem[];
  userLat?: number;
  userLng?: number;
  onSelectPlace: (place: ExplorePlaceItem) => void;
}

export const ExplorePlacesMapView: React.FC<ExplorePlacesMapViewProps> = ({
  places,
  userLat = 26.5228,
  userLng = 88.7245,
  onSelectPlace
}) => {
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>(
    places[0]?.id || ''
  );

  const selectedPlace = places.find((p) => p.id === selectedPlaceId) || places[0];

  // Jalpaiguri coordinate bounds for SVG projection
  // Lat: 26.5000 to 26.5500
  // Lng: 88.6900 to 88.7550
  const minLat = 26.5000;
  const maxLat = 26.5500;
  const minLng = 88.6950;
  const maxLng = 88.7550;

  const projectToPercent = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    return {
      x: Math.min(Math.max(x, 6), 94),
      y: Math.min(Math.max(y, 6), 94)
    };
  };

  const userProj = projectToPercent(userLat, userLng);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E8E4DA] dark:border-white/10 shadow-xs flex flex-col h-[520px] bg-[#E9E5DC] dark:bg-[#0D1612]">
      {/* Map Canvas / Visual Area */}
      <div className="relative flex-1 w-full overflow-hidden select-none">
        {/* Background Map Styling (Light / Dark) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F5F2EA] via-[#EDE7DC] to-[#E2DCCE] dark:from-[#111C17] dark:via-[#14231D] dark:to-[#0C1411]">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-[radial-gradient(#063B2C_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Teesta River Embankment Curve */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20">
            <path
              d="M 85 0 Q 88 200 80 400 T 75 600"
              fill="none"
              stroke="#0284c7"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <text x="82%" y="15%" fill="#0284c7" fontSize="10" fontWeight="bold" transform="rotate(75, 82, 15)">
              Teesta River Basin
            </text>
          </svg>

          {/* NH31 Highway Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 dark:opacity-20">
            <path
              d="M 0 120 L 400 450"
              fill="none"
              stroke="#b45309"
              strokeWidth="5"
              strokeDasharray="6 4"
            />
          </svg>
        </div>

        {/* Map Top Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="bg-white/90 dark:bg-[#14221C]/90 backdrop-blur-xs border border-[#E8E4DA] dark:border-white/10 rounded-full px-3 py-1 shadow-xs flex items-center gap-1.5 text-xs font-bold text-[#063B2C] dark:text-[#5CE6B0]">
            <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
            <span>Jalpaiguri City Area</span>
            <span className="text-[10px] text-[#55685F] dark:text-[#8BA095] font-normal">
              ({places.length} pins)
            </span>
          </div>
        </div>

        {/* User Location Pin */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${userProj.x}%`, top: `${userProj.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75" />
            <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center" />
          </div>
        </div>

        {/* Place Markers */}
        {places.map((place) => {
          const { x, y } = projectToPercent(place.lat, place.lng);
          const isSelected = place.id === selectedPlaceId;

          return (
            <button
              key={place.id}
              onClick={() => setSelectedPlaceId(place.id)}
              className={`absolute z-20 -translate-x-1/2 -translate-y-full transition-all duration-200 cursor-pointer ${
                isSelected ? 'scale-110 z-30' : 'scale-90 hover:scale-100 opacity-90'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={place.name}
            >
              <div className="flex flex-col items-center">
                <div
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md flex items-center gap-1 whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C] ring-2 ring-white dark:ring-black'
                      : 'bg-white dark:bg-[#16241F] text-[#11241C] dark:text-white border border-[#E8E4DA] dark:border-white/15'
                  }`}
                >
                  <span>📍</span>
                  <span className="max-w-[90px] truncate">{place.name}</span>
                </div>
                <div
                  className={`w-2 h-2 rotate-45 -mt-1 ${
                    isSelected
                      ? 'bg-[#063B2C] dark:bg-[#34D399]'
                      : 'bg-white dark:bg-[#16241F]'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Place Card Preview */}
      {selectedPlace && (
        <div
          onClick={() => onSelectPlace(selectedPlace)}
          className="p-3 bg-white dark:bg-[#14221C] border-t border-[#E8E4DA] dark:border-white/10 flex items-center gap-3 cursor-pointer hover:bg-[#FAF8F5] dark:hover:bg-[#192A23] transition-colors"
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-xl bg-[#F0EBE1] dark:bg-[#0F1A16] overflow-hidden shrink-0 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center">
            {selectedPlace.photoUrl ? (
              <img
                src={selectedPlace.photoUrl}
                alt={selectedPlace.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-1">
                <span className="text-lg">📍</span>
                <span className="block text-[8px] font-mono text-[#55685F] dark:text-[#8BA095]">
                  Place ID
                </span>
              </div>
            )}
          </div>

          {/* Place Info */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#063B2C] dark:text-[#5CE6B0]">
              <span>{selectedPlace.category}</span>
              <span>•</span>
              <div className="flex items-center text-[#B45309] dark:text-[#FBBF24]">
                <Star className="w-3 h-3 fill-current inline" />
                <span className="ml-0.5">{selectedPlace.rating.toFixed(1)}</span>
              </div>
            </div>

            <h4 className="text-xs font-extrabold text-[#11241C] dark:text-white truncate">
              {selectedPlace.name}
            </h4>

            <p className="text-[10px] text-[#55685F] dark:text-[#A2B3AA] truncate">
              {selectedPlace.formattedAddress}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectPlace(selectedPlace);
            }}
            className="w-8 h-8 rounded-full bg-[#E6F4EA] dark:bg-[#1C3A2D] text-[#063B2C] dark:text-[#5CE6B0] flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
