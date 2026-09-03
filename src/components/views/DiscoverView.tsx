import React, { useState, useMemo } from 'react';
import {
  Search,
  Sparkles,
  Wrench,
  Stethoscope,
  Droplet,
  Briefcase,
  Car,
  Home as HomeIcon,
  Store,
  Landmark,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sun,
  Moon,
  Navigation,
  Waves,
  ShieldCheck,
  PhoneCall,
  Pill,
  ArrowRight
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export const DiscoverView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const directoryCategories = [
    {
      title: 'Civic & Road Telemetry',
      items: [
        {
          name: 'Live Traffic & Waterlogging',
          count: 'Real-time road flow',
          view: 'alerts' as const,
          icon: Navigation,
          isHighlight: true
        },
        {
          name: 'Report Civic Issue',
          count: 'Direct to ward inspector',
          view: 'report-problem' as const,
          icon: AlertTriangle
        },
        {
          name: 'Municipal Schemes',
          count: '12 government programs',
          view: 'government' as const,
          icon: Landmark
        },
        {
          name: 'Lost & Found Items',
          count: 'Community lost items',
          view: 'lost-found' as const,
          icon: MapPin
        }
      ]
    },
    {
      title: 'Home & Technical Services',
      items: [
        {
          name: 'Electricians',
          count: '14 verified in town',
          view: 'workers' as const,
          icon: Wrench
        },
        {
          name: 'Plumbers',
          count: '9 verified in town',
          view: 'workers' as const,
          icon: Wrench
        },
        {
          name: 'Carpenters & Furniture',
          count: '7 available today',
          view: 'workers' as const,
          icon: Wrench
        },
        {
          name: 'Painters & Masonry',
          count: '11 available today',
          view: 'workers' as const,
          icon: Wrench
        }
      ]
    },
    {
      title: 'Emergency & Healthcare',
      items: [
        {
          name: 'Specialist Doctors',
          count: '18 registered clinicians',
          view: 'medical' as const,
          icon: Stethoscope
        },
        {
          name: 'Blood Bank & Donors',
          count: '48 active donors',
          view: 'blood' as const,
          icon: Droplet
        },
        {
          name: '24x7 Emergency Pharmacies',
          count: '6 open in town',
          view: 'medical' as const,
          icon: Pill
        },
        {
          name: 'Ambulance & Hospital Desk',
          count: 'Instant dispatch',
          view: 'medical' as const,
          icon: PhoneCall
        }
      ]
    },
    {
      title: 'Livelihood & Commerce',
      items: [
        {
          name: 'Local Jobs & Vacancies',
          count: '15 open listings',
          view: 'jobs' as const,
          icon: Briefcase
        },
        {
          name: 'Auto / Toto Services',
          count: 'Station & Dinbazar routes',
          view: 'vehicle' as const,
          icon: Car
        },
        {
          name: 'Local Business Directory',
          count: '34 registered shops',
          view: 'businesses' as const,
          icon: Store
        },
        {
          name: 'House Rentals & Stays',
          count: '12 verified rentals',
          view: 'rentals' as const,
          icon: HomeIcon
        }
      ]
    }
  ];

  // Filter sections and items based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return directoryCategories;
    const query = searchQuery.toLowerCase().trim();
    return directoryCategories
      .map((sec) => ({
        ...sec,
        items: sec.items.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.count.toLowerCase().includes(query) ||
            sec.title.toLowerCase().includes(query)
        )
      }))
      .filter((sec) => sec.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0E1714] text-[#11241C] dark:text-[#E8F0EC] pb-28 max-w-md mx-auto select-none transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 dark:bg-[#0E1714]/95 backdrop-blur-md px-5 pt-6 pb-3 border-b border-[#E8E4DA] dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#11241C] dark:text-white">
              Discover
            </h1>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8]">
              Jalpaiguri civic & local ecosystem
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-white dark:bg-[#16221D] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#55685F] dark:text-[#9FB2A8] shadow-xs hover:bg-[#F2EFE9] dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#063B2C]" />
              )}
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6F4EA] dark:bg-[#1A382B] text-[#063B2C] dark:text-[#34D399] text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Jalpaigi</span>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="w-full bg-white dark:bg-[#16221D] border border-[#D2CEBE] dark:border-white/10 rounded-2xl px-3.5 py-3 flex items-center gap-2.5 shadow-xs focus-within:border-[#063B2C] dark:focus-within:border-[#34D399] transition-all">
          <Search className="w-4 h-4 text-[#55685F] dark:text-[#9FB2A8]" />
          <input
            type="text"
            placeholder="Search traffic, services, doctors, jobs, wards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-[#11241C] dark:text-white placeholder:text-[#8C9B93] dark:placeholder:text-[#64748B] focus:outline-none bg-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[#8C9B93] hover:text-[#11241C] dark:hover:text-white"
            >
              ×
            </button>
          )}
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Featured Live Traffic & Waterlogging Card */}
        <div
          onClick={() => navigate('alerts')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#063B2C] to-[#0A543F] dark:from-[#112E23] dark:to-[#0A1C15] text-white shadow-md border border-[#063B2C]/20 dark:border-white/10 space-y-3 cursor-pointer group active:scale-[0.99] transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-extrabold tracking-wide uppercase border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Live Telemetry</span>
            </span>
            <span className="text-[11px] font-bold text-emerald-200 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
              <span>Open Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Live Traffic & Waterlogging</span>
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
              Real-time Google Maps Traffic Layer on Jalpaiguri transit corridors + official waterlogging & precipitation telemetry.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-4 text-[11px] font-semibold text-emerald-200/90 border-t border-white/10">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>NH-27 & Teesta</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Dinbazar DB Road</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Kadamtala</span>
            </div>
          </div>
        </div>

        {/* Directory Categorized Sections */}
        {filteredCategories.map((sec, idx) => (
          <div key={idx} className="space-y-2.5">
            <h2 className="text-xs font-extrabold text-[#55685F] dark:text-[#9FB2A8] uppercase tracking-wider px-1">
              {sec.title}
            </h2>
            <div className="bg-white dark:bg-[#16221D] rounded-3xl border border-[#E8E4DA] dark:border-white/10 divide-y divide-[#F0ECE1] dark:divide-white/5 shadow-xs overflow-hidden">
              {sec.items.map((item, i) => {
                const IconComponent = item.icon || ChevronRight;
                return (
                  <div
                    key={i}
                    onClick={() => navigate(item.view)}
                    className="p-3.5 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#063B2C]/5 dark:bg-white/5 text-[#063B2C] dark:text-[#34D399] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white group-hover:text-[#063B2C] dark:group-hover:text-[#34D399] transition-colors">
                          {item.name}
                        </h3>
                        <span className="text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8]">
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8C9B93] group-hover:text-[#11241C] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
