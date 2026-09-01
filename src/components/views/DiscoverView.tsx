import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Wrench,
  Stethoscope,
  Droplet,
  Briefcase,
  Car,
  PawPrint,
  Pill,
  Home as HomeIcon,
  Store,
  Landmark,
  HelpCircle,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const DiscoverView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { workers, doctors, civicReports } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const directoryCategories = [
    { title: 'Home Services', items: [
      { name: 'Electricians', count: '14 nearby', view: 'workers' as const },
      { name: 'Plumbers', count: '9 nearby', view: 'workers' as const },
      { name: 'Carpenters', count: '7 nearby', view: 'workers' as const },
      { name: 'Painters & Masonry', count: '11 nearby', view: 'workers' as const }
    ]},
    { title: 'Emergency & Health', items: [
      { name: 'Specialist Doctors', count: '18 registered', view: 'medical' as const },
      { name: 'Blood Bank & Donors', count: '48 active donors', view: 'blood' as const },
      { name: '24x7 Pharmacies', count: '6 open now', view: 'medical' as const },
      { name: 'Ambulance Support', count: 'Instant call', view: 'medical' as const }
    ]},
    { title: 'Civic & Community', items: [
      { name: 'Road & Water Alerts', count: '3 active notices', view: 'alerts' as const },
      { name: 'Report Civic Issue', count: 'Direct to ward', view: 'report-problem' as const },
      { name: 'Municipal Schemes', count: '12 programs', view: 'government' as const },
      { name: 'Lost & Found Items', count: '8 active items', view: 'lost-found' as const }
    ]},
    { title: 'Livelihood & Commerce', items: [
      { name: 'Local Jobs & Vacancies', count: '15 open roles', view: 'jobs' as const },
      { name: 'Auto / Toto Services', count: 'Station & Dinbazar', view: 'vehicle' as const },
      { name: 'Shop & Business Directory', count: '34 listed', view: 'businesses' as const },
      { name: 'House Rentals & Stays', count: '12 properties', view: 'rentals' as const }
    ]}
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-5 pt-6 pb-3 border-b border-[#E8E4DA]/50 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
            Discover
          </h1>
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F4EA] text-[#063B2C] text-xs font-bold shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Jalpaigi</span>
          </button>
        </div>

        {/* Search input */}
        <div className="w-full bg-white border border-[#D2CEBE] rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs">
          <Search className="w-4 h-4 text-[#55685F]" />
          <input
            type="text"
            placeholder="Search all services, doctors, jobs, alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] placeholder:text-[#8C9B93] focus:outline-none"
          />
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Directory Categorized Sections */}
        {directoryCategories.map((sec, idx) => (
          <div key={idx} className="space-y-2.5">
            <h2 className="text-xs font-extrabold text-[#55685F] uppercase tracking-wider px-1">
              {sec.title}
            </h2>
            <div className="bg-white rounded-3xl border border-[#E8E4DA] divide-y divide-[#F0ECE1] shadow-xs overflow-hidden">
              {sec.items.map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(item.view)}
                  className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                >
                  <div>
                    <h3 className="text-xs font-extrabold text-[#11241C]">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#55685F]">
                      {item.count}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#8C9B93]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
