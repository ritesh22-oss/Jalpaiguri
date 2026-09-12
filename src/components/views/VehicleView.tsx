import React, { useState } from 'react';
import {
  ArrowLeft,
  Car,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Wrench,
  Camera,
  PlusSquare,
  Heart
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';
import { getAdminPlaceThumbnails } from '../../utils/placesPhotoClient';

export const VehicleView: React.FC = () => {
  const { goBack, currentView } = useNav();
  const { vehicles, animals } = useApp();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [uploadEntity, setUploadEntity] = useState<any | null>(null);

  const isAnimalView = currentView === 'animal';

  const mechanics = [
    {
      id: 'mech-1',
      name: 'Maa Tara Auto Garage & Towing',
      category: '4-Wheeler & Towing',
      area: 'NH-27 Bypass, Mohitnagar',
      phone: '+91 98320 77412',
      timing: '24/7 Breakdown',
      rating: 4.8
    },
    {
      id: 'mech-2',
      name: 'Biswas Two Wheeler Workshop',
      category: 'Bike & Scooter Specialist',
      area: 'Kadamtala Market Road',
      phone: '+91 94340 33819',
      timing: '8:00 AM - 9:00 PM',
      rating: 4.7
    },
    {
      id: 'mech-3',
      name: 'Jalpaiguri Town Toto Union Stand',
      category: 'Electric Rickshaw Transport',
      area: 'Jalpaiguri Town Railway Station',
      phone: '+91 98320 00192',
      timing: 'Round the clock',
      rating: 4.9
    }
  ];

  const animalServices = [
    {
      id: 'anim-1',
      name: 'Jalpaiguri Veterinary Hospital (Polyclinic)',
      category: 'Veterinary Hospital',
      area: 'Hospital Road, Jalpaiguri',
      phone: '+91 3561 230052',
      timing: '9:00 AM - 4:00 PM',
      rating: 4.6
    },
    {
      id: 'anim-2',
      name: 'Paws & Claws Pet Clinic',
      category: 'Private Clinic',
      area: 'Kadamtala near Post Office',
      phone: '+91 98321 44556',
      timing: '10:00 AM - 8:00 PM',
      rating: 4.8
    },
    {
      id: 'anim-3',
      name: 'Animal Rescue & Shelter Jalpaiguri (NGO)',
      category: 'Animal NGO/Rescue',
      area: 'Rajbari Para, Jalpaiguri',
      phone: '+91 94341 88990',
      timing: '24/7 Rescue helpline',
      rating: 4.9
    }
  ];

  const dbData = isAnimalView ? animals : vehicles;
  const staticData = isAnimalView ? animalServices : mechanics;
  const dataToRender = dbData && dbData.length > 0 ? dbData : staticData;

  const categories = isAnimalView 
    ? ['All', 'Veterinary Hospital', 'Private Clinic', 'Animal NGO/Rescue']
    : ['All', '4-Wheeler & Towing', 'Bike & Scooter Specialist', 'Electric Rickshaw Transport'];

  const filteredData = dataToRender.filter((item) => {
    const itemLocality = item.locality || item.area || '';
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || itemLocality.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 select-none transition-colors">
      <header className="w-full sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
            {isAnimalView ? 'Animal Services & Vets' : 'Vehicle & Mechanics'}
          </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Search Input */}
        <div className="bg-white dark:bg-[#17231E] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs transition-colors">
          <Camera className="w-4 h-4 text-[#55685F] dark:text-[#A2B3AA]" />
          <input
            type="text"
            placeholder={isAnimalView ? "Search veterinarians, animal shelters..." : "Search auto garage, towing, mechanics..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#A2B3AA] bg-transparent focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#007AFF] dark:bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#17231E] text-[#11241C] dark:text-white border border-[#D2CEBE] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-[#1F312A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dynamic High-Priority Hotline banner */}
        {!isAnimalView ? (
          <div className="bg-[#FAF2EC] dark:bg-[#251A14] border border-[#F3E2D5] dark:border-orange-950/40 rounded-3xl p-4 shadow-xs flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#007AFF] dark:bg-blue-600 text-white flex items-center justify-center">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">Highway Towing & Breakdown</h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">NH-27 & Teesta Bridge corridor</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = 'tel:9832077412'}
              className="px-3.5 py-2 rounded-xl bg-[#007AFF] dark:bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Call Now
            </button>
          </div>
        ) : (
          <div className="bg-[#FFEBEA] dark:bg-[#2E1616] border border-[#FFD0CD] dark:border-rose-950/40 rounded-3xl p-4 shadow-xs flex items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">24/7 Stray Animal Rescue</h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">Free rescue, first aid & ambulance</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = 'tel:9434188990'}
              className="px-3.5 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-rose-600"
            >
              Rescue Helpline
            </button>
          </div>
        )}

        {/* Directory Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredData.map((item) => {
            const approvedThumbs = getAdminPlaceThumbnails(item.id);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white leading-snug">{item.name}</h4>
                      <span className="text-xs font-semibold text-[#007AFF] dark:text-blue-400">{item.category}</span>
                    </div>
                    <span className="text-xs font-bold text-[#007AFF] dark:text-blue-400 bg-[#E6F4EA] dark:bg-blue-950/60 border border-transparent dark:border-blue-800/40 px-2 py-0.5 rounded-full">
                      ★ {item.rating || 4.5}
                    </span>
                  </div>

                  {/* Approved Images Gallery */}
                  {approvedThumbs.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-black tracking-wider text-gray-400">Verified Photos</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {approvedThumbs.map((url, uidx) => (
                          <img
                            key={uidx}
                            src={url}
                            alt="Site Thumb"
                            className="w-full h-12 rounded-xl object-cover border border-[#E8E4DA] dark:border-white/10"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                      <span>{item.locality || item.area || 'Jalpaiguri'}</span>
                    </span>
                    <span>{item.timing || '9:00 AM - 6:00 PM'}</span>
                  </div>

                  <div className="flex justify-start">
                    <button
                      onClick={() => setUploadEntity(item)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:text-[#007AFF] dark:text-gray-400 dark:hover:text-[#38BDF8] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all bg-gray-50 dark:bg-white/5 active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Contribute Photo</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex justify-end">
                  <button
                    onClick={() => window.location.href = `tel:${item.phone.replace(/\s+/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-[#D2EBE0] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-blue-800/40 hover:bg-[#C2E4D5] dark:hover:bg-blue-900/60"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Provider</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {uploadEntity && (
        <UploadPlacePhotoModal
          placeId={uploadEntity.id}
          placeName={uploadEntity.name}
          category={isAnimalView ? 'Animal' : 'Vehicle'}
          isOpen={!!uploadEntity}
          onClose={() => setUploadEntity(null)}
        />
      )}
    </div>
  );
};
