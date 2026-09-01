import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  MapPin,
  ExternalLink,
  Navigation,
  Sparkles,
  ShieldCheck,
  Building,
  HeartPulse,
  Pill,
  Car,
  Compass,
  Store,
  Fuel,
  Banknote,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLocation } from '../../context/LocationContext';
import { apiFetch } from '../../lib/firebase';

interface GroundedPlaceItem {
  title: string;
  uri: string;
  address?: string;
  snippets?: string[];
  category?: string;
}

export const MapsExplorerView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { location, requestCurrentLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [places, setPlaces] = useState<GroundedPlaceItem[]>([
    {
      title: 'Jalpaiguri District Sadar Hospital & Emergency',
      uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
      address: 'Hospital Road, Kadamtala, Jalpaiguri, WB 735101',
      category: 'Emergency & Health',
      snippets: ['Primary government medical center with 24x7 emergency & trauma care.']
    },
    {
      title: 'Dinbazar Wholesale Market',
      uri: 'https://maps.google.com/?q=Dinbazar+Market+Jalpaiguri',
      address: 'Dinbazar, Jalpaiguri, WB 735101',
      category: 'Commercial Hub',
      snippets: ['Historic wholesale and retail marketplace with daily essentials.']
    },
    {
      title: 'Rajbari Dighi & Baikunthapur Royal Palace',
      uri: 'https://maps.google.com/?q=Rajbari+Dighi+Jalpaiguri',
      address: 'Rajbari, Jalpaiguri, WB 735101',
      category: 'Heritage & Tourism',
      snippets: ['Heritage lake with historical architecture of the Raikat dynasty.']
    },
    {
      title: 'Kadamtala Bus & Toto Terminal',
      uri: 'https://maps.google.com/?q=Kadamtala+Jalpaiguri',
      address: 'Kadamtala More, Jalpaiguri, WB 735101',
      category: 'Transport Stand',
      snippets: ['Major junction connecting North Bengal transport, autos, and e-rickshaws.']
    }
  ]);

  const categories = [
    { id: 'All', label: 'All Places', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'Hospitals', label: 'Hospitals & Clinics', query: 'Emergency hospitals, clinics and healthcare in Jalpaiguri', icon: <HeartPulse className="w-3.5 h-3.5" /> },
    { id: 'Pharmacies', label: '24x7 Pharmacies', query: '24 hour pharmacies and chemist shops in Jalpaiguri', icon: <Pill className="w-3.5 h-3.5" /> },
    { id: 'Heritage', label: 'Tourism & Parks', query: 'Top tourist places, parks, Teesta river spots in Jalpaiguri', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'Transport', label: 'Toto & Bus Stands', query: 'Bus stands, railway stations and toto stands in Jalpaiguri', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'Fuel', label: 'Petrol Pumps', query: 'Petrol pumps and fuel stations in Jalpaiguri', icon: <Fuel className="w-3.5 h-3.5" /> },
    { id: 'ATMs', label: 'ATMs & Banks', query: 'SBI and major bank ATMs in Kadamtala and Dinbazar Jalpaiguri', icon: <Banknote className="w-3.5 h-3.5" /> }
  ];

  const fetchGroundedPlaces = async (queryText: string, catName: string) => {
    setLoading(true);
    try {
      const res = await apiFetch<{
        query: string;
        summary: string;
        places: GroundedPlaceItem[];
      }>('/api/gemini/maps-grounding', {
        method: 'POST',
        body: JSON.stringify({
          query: queryText,
          category: catName,
          userLocation: {
            latitude: location.lat || 26.5414,
            longitude: location.lng || 88.7196
          }
        })
      });

      if (res?.places && res.places.length > 0) {
        setPlaces(res.places);
        setSummary(res.summary || `Verified locations matching "${queryText}"`);
      } else {
        setSummary(res?.summary || `Showing verified landmarks for Jalpaiguri`);
      }
    } catch (err) {
      console.error('Maps grounding error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat: typeof categories[0]) => {
    setSelectedCategory(cat.id);
    if (cat.query) {
      setSearchQuery(cat.query);
      fetchGroundedPlaces(cat.query, cat.label);
    } else {
      setSearchQuery('');
      fetchGroundedPlaces('Major essential places and landmarks in Jalpaiguri', 'All Places');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    fetchGroundedPlaces(searchQuery.trim(), selectedCategory);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 max-w-md mx-auto select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#E8E4DA] shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="w-9 h-9 rounded-full bg-[#FAF8F5] border border-[#E8E4DA] flex items-center justify-center text-[#11241C] hover:bg-[#EFECE6] active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm font-extrabold text-[#11241C] flex items-center gap-1.5">
                <span>Google Maps Grounding</span>
                <span className="px-1.5 py-0.5 rounded-md bg-[#063B2C] text-[9px] font-bold text-white uppercase">
                  Live
                </span>
              </h2>
              <p className="text-[11px] font-semibold text-[#55685F]">
                Real-time verified places near 📍 {location.locality || 'Jalpaiguri'}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('ai-chat')}
            className="w-8 h-8 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center hover:bg-[#C8E6C9] transition-all cursor-pointer"
            title="Chat with Jalpaigi AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-3 relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals, shops, ATMs in Jalpaiguri..."
            className="w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-full pl-10 pr-24 py-2 text-xs font-semibold text-[#11241C] focus:outline-none focus:border-[#063B2C]"
          />
          <Search className="w-4 h-4 text-[#55685F] absolute left-3.5" />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 bg-[#063B2C] text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-[#084D3A] transition-all cursor-pointer flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Categories Carousel */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategorySelect(c)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#063B2C] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border border-[#E0DCD3] text-[#55685F] hover:bg-[#E6F4EA] hover:text-[#063B2C]'
              }`}
            >
              {c.icon}
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4">
        {/* Grounding Info Card */}
        <div className="bg-[#E6F4EA] border border-[#A7D7B9] rounded-2xl p-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-xl bg-[#063B2C] text-white shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-0.5">
            <h3 className="font-extrabold text-[#063B2C]">Google Maps Live Grounding</h3>
            <p className="text-[11px] text-[#11241C] leading-snug">
              Powered by Gemini with the <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-[10px]">googleMaps</code> tool to retrieve authentic geographical pins, addresses, and local reviews in Jalpaiguri.
            </p>
          </div>
        </div>

        {/* Summary if present */}
        {summary && (
          <div className="bg-white border border-[#E8E4DA] rounded-2xl p-3 text-xs text-[#11241C] leading-relaxed shadow-xs">
            <span className="font-extrabold text-[#063B2C]">AI Insights: </span>
            <span>{summary}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-[#A7D7B9] rounded-2xl p-6 text-center space-y-2 shadow-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#063B2C] mx-auto" />
            <div className="text-xs font-extrabold text-[#063B2C]">
              Querying Google Maps Grounding API…
            </div>
            <p className="text-[11px] text-[#55685F]">
              Retrieving verified places and coordinates near Jalpaiguri
            </p>
          </div>
        )}

        {/* Places List */}
        {!loading && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#55685F] px-1">
              <span>{places.length} Grounded Places</span>
              <span className="text-[10px] text-[#063B2C]">Tap for navigation</span>
            </div>

            {places.map((place, index) => (
              <div
                key={index}
                className="bg-white border border-[#E8E4DA] hover:border-[#063B2C] rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-xs text-[#11241C] flex items-center gap-1.5 leading-snug">
                      <span className="text-base">📍</span>
                      <span>{place.title}</span>
                    </h3>
                    {place.category && (
                      <span className="text-[9px] font-bold bg-[#E6F4EA] text-[#063B2C] px-2 py-0.5 rounded-full shrink-0">
                        {place.category}
                      </span>
                    )}
                  </div>

                  {place.address && (
                    <p className="text-[11px] font-semibold text-[#55685F] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#063B2C] shrink-0" />
                      <span>{place.address}</span>
                    </p>
                  )}

                  {place.snippets && place.snippets.length > 0 && (
                    <div className="bg-[#FAF8F5] border border-[#E8E4DA] rounded-xl p-2.5 text-[11px] text-[#55685F] italic leading-relaxed">
                      "{place.snippets[0]}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#F0ECE1]">
                  <a
                    href={place.uri || `https://maps.google.com/?q=${encodeURIComponent(place.title + ' Jalpaiguri')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#063B2C] text-white hover:bg-[#084D3A] active:scale-98 px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-75" />
                  </a>

                  <button
                    onClick={() => {
                      navigate('ai-chat');
                    }}
                    className="bg-[#FAF8F5] border border-[#D2CEBE] text-[#063B2C] hover:bg-[#E6F4EA] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="Ask AI about this place"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
