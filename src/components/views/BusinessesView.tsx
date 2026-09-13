import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  Camera
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common/EmptyState';
import { UploadPlacePhotoModal } from '../common/UploadPlacePhotoModal';

export const BusinessesView: React.FC = () => {
  const { goBack } = useNav();
  const { shops } = useApp();
  const [uploadShop, setUploadShop] = useState<any | null>(null);
  const [customThumbs, setCustomThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
      setCustomThumbs(stored);
    } catch {}
  }, []);

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
          Local Businesses
        </h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-3">
        {shops.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Businesses Listed"
            description="Jalpaiguri's digital business directory is waiting for local shop owners to join. Are you a business owner?"
            actionLabel="Register My Shop"
            onAction={() => window.open('https://jalpaigurimunicipality.org/', '_blank')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {shops.map((b, idx) => {
              const thumbUrl = customThumbs[b.id];
              return (
                <div
                  key={b.id || idx}
                  className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {thumbUrl ? (
                        <img 
                          src={thumbUrl} 
                          alt={b.name} 
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#007AFF] dark:text-blue-300 flex items-center justify-center shrink-0">
                          <Store className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">{b.name}</h3>
                        <span className="text-xs font-semibold text-[#007AFF] dark:text-blue-400">{b.category}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#007AFF] dark:text-blue-400 bg-[#E6F4EA] dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-transparent dark:border-blue-800/40 shrink-0">
                      ★ {b.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#007AFF] dark:text-blue-400" />
                      <span>{b.locality}</span>
                    </span>
                    <span>{b.openingTime} - {b.closingTime}</span>
                  </div>

                  <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex items-center justify-between">
                    <button
                      onClick={() => setUploadShop(b)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                      title="Upload photo from camera or gallery"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>

                    <button
                      onClick={() => window.location.href = `tel:${(b.phone || b.ownerPhone).replace(/\s+/g, '')}`}
                      className="px-4 py-2 rounded-xl bg-[#D2EBE0] dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-blue-800/40 hover:bg-[#C2E4D5] dark:hover:bg-blue-900/60"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Store</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {uploadShop && (
        <UploadPlacePhotoModal
          placeId={uploadShop.id}
          placeName={uploadShop.name}
          category={`Business - ${uploadShop.category}`}
          isOpen={!!uploadShop}
          onClose={() => setUploadShop(null)}
          onUploaded={(url) => {
            setCustomThumbs(prev => ({ ...prev, [uploadShop.id]: url }));
          }}
        />
      )}
    </div>
  );
};
