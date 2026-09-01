import React, { useState } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  Star
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';

export const BusinessesView: React.FC = () => {
  const { goBack } = useNav();

  const businesses = [
    {
      name: 'Sen Sweets & Confectioners',
      category: 'Sweets & Bakery',
      area: 'Kadamtala Crossing',
      phone: '+91 98320 11094',
      timing: '7:30 AM - 10:00 PM',
      rating: 4.9
    },
    {
      name: 'North Bengal Book Store',
      category: 'Books & Stationery',
      area: 'Silpasamiti Para',
      phone: '+91 94340 44921',
      timing: '9:00 AM - 8:30 PM',
      rating: 4.7
    },
    {
      name: 'Roy Hardware & Electricals',
      category: 'Hardware & Tools',
      area: 'Dinbazar Market',
      phone: '+91 98320 88219',
      timing: '8:30 AM - 9:00 PM',
      rating: 4.8
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center gap-3 border-b border-[#E8E4DA]/50">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-extrabold text-[#11241C] tracking-tight">
          Local Businesses
        </h1>
      </header>

      <div className="p-4 space-y-3">
        {businesses.map((b, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-2.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-[#11241C]">{b.name}</h3>
                <span className="text-xs font-semibold text-[#063B2C]">{b.category}</span>
              </div>
              <span className="text-xs font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                ★ {b.rating}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#55685F] font-semibold">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                <span>{b.area}</span>
              </span>
              <span>{b.timing}</span>
            </div>

            <div className="pt-2 border-t border-[#F0ECE1] flex justify-end">
              <button
                onClick={() => window.location.href = `tel:${b.phone.replace(/\s+/g, '')}`}
                className="px-4 py-2 rounded-xl bg-[#D2EBE0] text-[#063B2C] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Store</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
