import React, { useState, useMemo, useEffect } from 'react';
import { 
  Bus, Train, Search, MapPin, Clock, ArrowRightLeft, 
  Filter, ChevronRight, Bookmark, RefreshCw, AlertCircle, CheckCircle2, Compass, X, Camera
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import { BUS_ROUTES, TRAIN_SERVICES, CORRIDORS } from '../../data/transportData';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

export const TransportView: React.FC = () => {
  const { goBack } = useNav();
  const { transports } = useApp();
  const { isBengali } = useLanguage();
  const [activeTab, setActiveTab] = useState<'ALL' | 'BUSES' | 'MINI' | 'TRAINS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filter, setFilter] = useState({ destination: 'ALL', station: 'ALL' });
  const [uploadItem, setUploadItem] = useState<any | null>(null);
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
      setCustomThumbs(stored);
    } catch {}
  }, []);

  const dbBuses = useMemo(() => transports.filter(t => t.type !== 'Train'), [transports]);
  const dbTrains = useMemo(() => transports.filter(t => t.type === 'Train'), [transports]);

  const busesToRender = useMemo(() => dbBuses.length > 0 ? dbBuses : BUS_ROUTES, [dbBuses]);
  const trainsToRender = useMemo(() => dbTrains.length > 0 ? dbTrains : TRAIN_SERVICES, [dbTrains]);

  const destinations = useMemo(() => {
    const all = [...busesToRender.map(r => r.destination), ...trainsToRender.map(t => t.destination)];
    return ['ALL', ...Array.from(new Set(all))];
  }, [busesToRender, trainsToRender]);

  const stations = useMemo(() => {
    const all = trainsToRender.map(t => t.stationCode || t.stationName);
    return ['ALL', ...Array.from(new Set(all))];
  }, [trainsToRender]);

  const transportData = useMemo(() => {
    let allBuses = busesToRender.filter(r => r.operator !== 'Mini Bus' && r.operator !== 'Toto/Auto/Bus' && r.type !== 'Mini Bus' && r.type !== 'Toto / Auto');
    let miniBuses = busesToRender.filter(r => r.operator === 'Mini Bus' || r.operator === 'Toto/Auto/Bus' || r.type === 'Mini Bus' || r.type === 'Toto / Auto');
    let trains = trainsToRender;

    let data: any[] = [];
    if (activeTab === 'ALL' || activeTab === 'BUSES') data = [...data, ...allBuses];
    if (activeTab === 'ALL' || activeTab === 'MINI') data = [...data, ...miniBuses];
    if (activeTab === 'ALL' || activeTab === 'TRAINS') data = [...data, ...trains];

    if (filter.destination !== 'ALL') {
        data = data.filter(item => item.destination === filter.destination);
    }
    if (filter.station !== 'ALL') {
        data = data.filter(item => item.stationCode === filter.station || !item.trainNumber);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(r => 
        (r.routeName || r.trainName || '').toLowerCase().includes(q) ||
        (r.origin || '').toLowerCase().includes(q) ||
        (r.destination || '').toLowerCase().includes(q) ||
        (r.stationName || '').toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeTab, searchQuery, filter, busesToRender, trainsToRender]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B132B] text-[#11241C] dark:text-white pb-24 transition-colors">
      <div className="bg-[#007AFF] text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-4">
          <button onClick={() => goBack()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer">
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black tracking-tight">Transport</h1>
            <p className="text-xs text-blue-100 opacity-90">Bus & train information across Jalpaiguri</p>
          </div>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="w-4 h-4 text-blue-900 absolute left-3 top-3.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buses, trains, routes or places..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white text-gray-900 text-xs font-bold focus:outline-none"
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['ALL', 'BUSES', 'MINI', 'TRAINS'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${activeTab === tab ? 'bg-[#007AFF] text-white shadow-xs' : 'bg-white dark:bg-[#111B2E] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-blue-900/30'}`}
            >
              {tab}
            </button>
          ))}
          <button onClick={() => setIsFilterModalOpen(true)} className="px-4 py-2 rounded-xl bg-white dark:bg-[#111B2E] flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-blue-900/30 shrink-0">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>

        <section>
          <h2 className="text-sm font-black mb-3">Transport Results</h2>
          <div className="space-y-3">
            {transportData.map((item, idx) => {
              const approvedThumbs = getAdminPlaceThumbnails(item.id);
              const activeThumb = approvedThumbs.length > 0 ? approvedThumbs[0] : customThumbs[item.id];
              return (
                <div key={idx} className="bg-white dark:bg-[#111B2E] p-4 rounded-2xl border border-gray-100 dark:border-blue-900/30 shadow-sm transition cursor-pointer space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {activeThumb ? (
                        <img 
                          src={activeThumb} 
                          alt={item.routeName || item.trainName} 
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shrink-0" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`p-2 rounded-xl ${item.trainNumber ? 'bg-indigo-50 text-indigo-600 dark:bg-blue-950/40 dark:text-blue-300' : 'bg-blue-50 text-[#007AFF] dark:bg-blue-950/40 dark:text-blue-300'}`}>
                          {item.trainNumber ? <Train className="w-5 h-5" /> : <Bus className="w-5 h-5" />}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">{item.routeName || item.trainName}</h3>
                        <p className="text-[11px] text-gray-500 dark:text-blue-200 font-semibold">{item.operator || item.stationName || 'Indian Railways'}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadItem(item);
                      }}
                      className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0"
                      title="Upload photo from camera or gallery"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Unified info grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500 bg-gray-50 dark:bg-blue-950/20 p-2 rounded-xl">
                    {item.trainNumber ? (
                        <>
                          <p>Arrives: <span className="font-bold text-gray-900 dark:text-white">{item.arrivalTime}</span></p>
                          <p>Departs: <span className="font-bold text-gray-900 dark:text-white">{item.departureTime}</span></p>
                          <p>Halt: <span className="font-bold text-gray-900 dark:text-white">{item.haltMinutes} min</span></p>
                          <p>Code: <span className="font-bold text-gray-900 dark:text-white">{item.stationCode}</span></p>
                        </>
                    ) : (
                        <>
                          <p>Dep: <span className="font-bold text-gray-900 dark:text-white">{item.departureTime}</span></p>
                          <p>Arr: <span className="font-bold text-gray-900 dark:text-white">{item.arrivalTime}</span></p>
                          <p>Fare: <span className="font-bold text-blue-600 dark:text-blue-300">{item.fare || 'N/A'}</span></p>
                          <p>Operates: <span className="font-bold text-gray-900 dark:text-white">{item.operatingDays?.join(', ')}</span></p>
                        </>
                    )}
                  </div>

                  {/* Approved Community Gallery */}
                  {approvedThumbs.length > 0 && (
                    <div className="space-y-1 pt-1.5 border-t border-gray-100 dark:border-white/5">
                      <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Verified Photos ({approvedThumbs.length})</span>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
                        {approvedThumbs.map((url, uidx) => (
                          <img
                            key={uidx}
                            src={url}
                            alt={`Verified transport photo ${uidx + 1}`}
                            className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-white/10 shrink-0 cursor-pointer"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white dark:bg-[#0B132B] w-full p-6 rounded-t-3xl h-[60vh] overflow-y-auto border-t border-blue-900/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)}><X className="w-6 h-6 text-gray-900 dark:text-white" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Destination</label>
                <select 
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#111B2E] text-sm font-bold text-gray-900 dark:text-white"
                  value={filter.destination}
                  onChange={(e) => setFilter({...filter, destination: e.target.value})}
                >
                  {destinations.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Station Code</label>
                <select 
                  className="w-full p-3 rounded-xl bg-gray-50 dark:bg-[#111B2E] text-sm font-bold text-gray-900 dark:text-white"
                  value={filter.station}
                  onChange={(e) => setFilter({...filter, station: e.target.value})}
                >
                  {stations.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="w-full py-3 rounded-xl bg-[#007AFF] text-white font-bold text-sm shadow-md"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadItem && (
        <UploadPlacePhotoModal
          placeId={uploadItem.id}
          placeName={uploadItem.routeName || uploadItem.trainName || 'Transport Route'}
          category={uploadItem.trainNumber ? 'Transport - Railways' : 'Transport - Buses'}
          isOpen={!!uploadItem}
          onClose={() => setUploadItem(null)}
          onUploaded={(url) => {
            setCustomThumbs(prev => ({ ...prev, [uploadItem.id]: url }));
          }}
        />
      )}
    </div>
  );
};
