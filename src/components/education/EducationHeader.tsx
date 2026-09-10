import React from 'react';
import { ChevronRight, Bell, User } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';

export const EducationHeader: React.FC = () => {
  const { goBack } = useNav();
  const { isBengali } = useLanguage();

  return (
    <div className="bg-[#007AFF] text-white pt-6 pb-6 px-4 rounded-b-3xl shadow-md">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <button onClick={() => goBack()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">{isBengali ? 'শিক্ষা' : 'Education'}</h1>
        </div>
        <div className="flex gap-2">
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"><Bell className="w-5 h-5"/></button>
            <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"><User className="w-5 h-5"/></button>
        </div>
      </div>
      <div className="max-w-2xl mx-auto mt-4 text-center">
        <p className="text-xs text-blue-100 opacity-90">
            {isBengali ? 'জলপাইগুড়ির স্কুল, কলেজ ও সুযোগ খুঁজুন' : 'Find schools, colleges, courses and educational opportunities in Jalpaiguri'}
        </p>
      </div>
    </div>
  );
};
