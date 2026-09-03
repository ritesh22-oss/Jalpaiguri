import React from 'react';
import {
  ArrowLeft,
  Car,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

export const VehicleView: React.FC = () => {
  const { goBack } = useNav();

  const mechanics = [
    {
      name: 'Maa Tara Auto Garage & Towing',
      category: '4-Wheeler & Towing',
      area: 'NH-27 Bypass, Mohitnagar',
      phone: '+91 98320 77412',
      timing: '24/7 Breakdown',
      rating: 4.8
    },
    {
      name: 'Biswas Two Wheeler Workshop',
      category: 'Bike & Scooter Specialist',
      area: 'Kadamtala Market Road',
      phone: '+91 94340 33819',
      timing: '8:00 AM - 9:00 PM',
      rating: 4.7
    },
    {
      name: 'Jalpaiguri Town Toto Union Stand',
      category: 'Electric Rickshaw Transport',
      area: 'Jalpaiguri Town Railway Station',
      phone: '+91 98320 00192',
      timing: 'Round the clock',
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E4DA]/50 dark:border-white/10 transition-colors">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
          Vehicle & Mechanics
        </h1>
      </header>

      <div className="p-4 space-y-4">
        {/* 24/7 Breakdown Hotline */}
        <div className="bg-[#FAF2EC] dark:bg-[#251A14] border border-[#F3E2D5] dark:border-orange-950/40 rounded-3xl p-4 shadow-xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 text-white flex items-center justify-center">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">Highway Towing & Breakdown</h3>
              <p className="text-[11px] text-[#55685F] dark:text-[#A2B3AA]">NH-27 & Teesta Bridge corridor</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = 'tel:9832077412'}
            className="px-3.5 py-2 rounded-xl bg-[#063B2C] dark:bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Call Now
          </button>
        </div>

        {/* Directory */}
        <div className="space-y-3">
          {mechanics.map((m, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-2.5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-[#11241C] dark:text-white">{m.name}</h4>
                  <span className="text-xs font-semibold text-[#063B2C] dark:text-emerald-400">{m.category}</span>
                </div>
                <span className="text-xs font-bold text-[#063B2C] dark:text-emerald-400 bg-[#E6F4EA] dark:bg-emerald-950/60 border border-transparent dark:border-emerald-800/40 px-2 py-0.5 rounded-full">
                  ★ {m.rating}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#55685F] dark:text-[#A2B3AA] font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-emerald-400" />
                  <span>{m.area}</span>
                </span>
                <span>{m.timing}</span>
              </div>

              <div className="pt-2 border-t border-[#F0ECE1] dark:border-white/10 flex justify-end">
                <button
                  onClick={() => window.location.href = `tel:${m.phone.replace(/\s+/g, '')}`}
                  className="px-4 py-2 rounded-xl bg-[#D2EBE0] dark:bg-emerald-950/60 text-[#063B2C] dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-transparent dark:border-emerald-800/40 hover:bg-[#C2E4D5] dark:hover:bg-emerald-900/60"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Provider</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
