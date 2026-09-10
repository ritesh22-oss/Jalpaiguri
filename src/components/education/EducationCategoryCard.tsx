import React from 'react';
import { BookOpen, GraduationCap, MapPin, Search, Calendar } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export const EducationCategoryCard: React.FC<Props> = ({ icon, title, description, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white dark:bg-[#17231E] p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-blue-300 transition text-left space-y-2"
    >
      <div className="p-2.5 rounded-xl bg-blue-50 text-[#007AFF] dark:bg-blue-950/40 w-fit">
        {icon}
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-[11px] text-gray-500 font-medium">{description}</p>
    </button>
  );
};
