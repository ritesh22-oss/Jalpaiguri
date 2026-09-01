import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  MapPin,
  Sparkles,
  AlertTriangle,
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
  FileSpreadsheet,
  ChevronRight,
  ShieldCheck,
  Star,
  Clock,
  Radio
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';

export const HomeView: React.FC = () => {
  const { navigate, setIsAssistantOpen } = useNav();
  const { user } = useAuth();
  const { workers, doctors, localAlerts, civicReports, isRealtimeConnected, refreshData } = useApp();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const placeholders = [
    'Find an electrician...',
    'Need a doctor?',
    'Need blood support?',
    'Find a local job...',
    'Need a mechanic?',
    'Report waterlogging...'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const quickServices = [
    { id: 'srv-workers', label: 'Workers', icon: <Wrench className="w-5 h-5 text-[#063B2C]" />, view: 'workers' as const, bg: 'bg-[#E6F4EA]' },
    { id: 'srv-medical', label: 'Medical', icon: <Stethoscope className="w-5 h-5 text-[#0A58CA]" />, view: 'medical' as const, bg: 'bg-[#EBF2FC]' },
    { id: 'srv-blood', label: 'Blood', icon: <Droplet className="w-5 h-5 text-[#D9383A]" />, view: 'blood' as const, bg: 'bg-[#FFEBEA]' },
    { id: 'srv-jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5 text-[#854D0E]" />, view: 'jobs' as const, bg: 'bg-[#FEF9C3]' },
    { id: 'srv-vehicle', label: 'Vehicle', icon: <Car className="w-5 h-5 text-[#475569]" />, view: 'vehicle' as const, bg: 'bg-[#F1F5F9]' },
    { id: 'srv-animal', label: 'Animal Help', icon: <PawPrint className="w-5 h-5 text-[#15803D]" />, view: 'animal' as const, bg: 'bg-[#DCFCE7]' },
    { id: 'srv-pharmacy', label: 'Pharmacy', icon: <Pill className="w-5 h-5 text-[#0891B2]" />, view: 'medical' as const, bg: 'bg-[#CFFAFE]' },
    { id: 'srv-rentals', label: 'Rentals', icon: <HomeIcon className="w-5 h-5 text-[#7C3AED]" />, view: 'rentals' as const, bg: 'bg-[#F3E8FF]' },
    { id: 'srv-businesses', label: 'Businesses', icon: <Store className="w-5 h-5 text-[#BE123C]" />, view: 'businesses' as const, bg: 'bg-[#FFE4E6]' },
    { id: 'srv-govt', label: 'Government', icon: <Landmark className="w-5 h-5 text-[#334155]" />, view: 'government' as const, bg: 'bg-[#F1F5F9]' },
    { id: 'srv-lostfound', label: 'Lost & Found', icon: <HelpCircle className="w-5 h-5 text-[#D97706]" />, view: 'lost-found' as const, bg: 'bg-[#FEF3C7]' },
    { id: 'srv-report', label: 'Report Problem', icon: <AlertTriangle className="w-5 h-5 text-[#D9383A]" />, view: 'report-problem' as const, bg: 'bg-[#FEE2E2]' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 max-w-md mx-auto select-none">
      {/* Top Welcome Header */}
      <div className="bg-white px-5 pt-6 pb-4 border-b border-[#E8E4DA] sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <JalpaiguriLogo size="sm" showText={false} />
            <div>
              <h2 className="text-base font-extrabold text-[#11241C] tracking-tight flex items-center gap-1.5">
                <span>{user ? `Good day, ${user.name.split(' ')[0]}` : 'Welcome, Citizen'}</span>
                <span>👋</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  onClick={() => navigate(user ? 'profile' : 'auth')}
                  className="flex items-center gap-1 text-xs font-semibold text-[#55685F] cursor-pointer hover:text-[#063B2C]"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#063B2C]" />
                  <span className="truncate max-w-[130px]">{user?.location || 'Jalpaiguri, WB'}</span>
                </div>
                <div
                  onClick={() => refreshData()}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E6F4EA] text-[#063B2C] text-[10px] font-bold cursor-pointer hover:bg-[#C8E6C9] transition-colors"
                  title="Real-time data stream active. Tap to sync now."
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  <span>Live Stream</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions: AI Assistant & Profile/Auth Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="w-9 h-9 rounded-full bg-[#E6F4EA] text-[#063B2C] flex items-center justify-center hover:bg-[#C8E6C9] active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Jalpaigi AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>
            {user ? (
              <div
                onClick={() => navigate('profile')}
                className="w-9 h-9 rounded-full bg-[#063B2C] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:ring-2 hover:ring-[#A7D7B9]"
                title="View Profile"
              >
                {user.name ? user.name.charAt(0) : 'J'}
              </div>
            ) : (
              <button
                onClick={() => navigate('auth')}
                className="text-xs font-extrabold text-white bg-[#063B2C] px-3 py-2 rounded-full flex items-center gap-1 shadow-xs hover:bg-[#084D3A] cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Search Bar */}
        <div
          onClick={() => navigate('discover')}
          className="relative w-full bg-[#FAF8F5] border border-[#D2CEBE] rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xs cursor-pointer hover:border-[#063B2C] transition-all"
        >
          <Search className="w-4 h-4 text-[#55685F]" />
          <span className="text-xs font-medium text-[#73827B] flex-1">
            {placeholders[placeholderIndex]}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAssistantOpen(true);
            }}
            className="text-[#55685F] hover:text-[#063B2C]"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Emergency Urgent Help Banner matching theme */}
        <div className="bg-gradient-to-r from-[#FFEBEA] to-[#FFF5F5] border border-[#FFCCD0] rounded-3xl p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D9383A] text-white flex items-center justify-center shadow-sm shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#8A1A1C] tracking-tight">
                Need urgent help?
              </h3>
              <p className="text-[11px] text-[#632021] font-medium">
                Ambulance, Hospital, Police & Fire
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('medical')}
            className="bg-[#D9383A] hover:bg-[#B92628] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
          >
            Emergency
          </button>
        </div>

        {/* 12 Quick Services Icon Grid */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight">
              City Services
            </h3>
            <button
              onClick={() => navigate('discover')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {quickServices.map((srv) => (
              <button
                key={srv.id}
                id={srv.id}
                onClick={() => navigate(srv.view)}
                className="bg-white border border-[#E8E4DA] rounded-2xl p-2.5 flex flex-col items-center justify-center text-center shadow-xs hover:border-[#063B2C] hover:shadow-sm active:scale-95 transition-all cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-xl ${srv.bg} flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105`}>
                  {srv.icon}
                </div>
                <span className="text-[11px] font-bold text-[#11241C] leading-tight line-clamp-1">
                  {srv.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Nearby for You Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight">
              Nearby for You
            </h3>
            <button
              onClick={() => navigate('workers')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer"
            >
              See all workers
            </button>
          </div>

          <div className="space-y-3">
            {workers.length === 0 ? (
              <div
                onClick={() => navigate('offer-services')}
                className="bg-white border border-dashed border-[#CBD5E1] rounded-3xl p-5 text-center shadow-xs hover:border-[#063B2C] transition-all cursor-pointer"
              >
                <div className="text-xs font-bold text-[#11241C] mb-1">
                  Are you a skilled professional in Jalpaiguri?
                </div>
                <p className="text-[11px] text-[#55685F] mb-3">
                  List your services (Electrician, Plumber, Painter, etc.) to get direct calls from neighbors.
                </p>
                <span className="inline-block bg-[#063B2C] text-white text-xs font-bold px-4 py-1.5 rounded-full">
                  List Your Service Now
                </span>
              </div>
            ) : (
              workers.slice(0, 2).map((worker) => (
                <div
                  key={worker.id}
                  onClick={() => navigate('worker-detail', { workerId: worker.id })}
                  className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs flex items-center gap-3.5 hover:border-[#063B2C] transition-all cursor-pointer"
                >
                  <img
                    src={worker.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-[#E8E4DA]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-extrabold text-sm text-[#11241C] truncate">
                        {worker.name}
                      </h4>
                      <span className="text-[11px] font-bold text-[#063B2C] bg-[#E6F4EA] px-2 py-0.5 rounded-full shrink-0">
                        ★ {worker.rating}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#55685F] mt-0.5">
                      {worker.profession} • {worker.distance}
                    </p>
                    <p className="text-[11px] font-medium text-[#11241C] mt-1">
                      {worker.startingPrice}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8C9B93]" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Local Alerts Ticker */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-extrabold text-[#11241C] tracking-tight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#D9383A]" />
              <span>Local Updates</span>
            </h3>
            <button
              onClick={() => navigate('alerts')}
              className="text-xs font-bold text-[#063B2C] hover:underline cursor-pointer"
            >
              Open Map
            </button>
          </div>

          {localAlerts.length > 0 ? (
            <div
              onClick={() => navigate('alerts')}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs hover:border-[#063B2C] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#D9383A] bg-[#FFEBEA] px-2.5 py-0.5 rounded-full">
                  {localAlerts[0].category}
                </span>
                <span className="text-[#8C9B93] font-medium">{localAlerts[0].timeAgo}</span>
              </div>
              <h4 className="font-extrabold text-sm text-[#11241C]">
                {localAlerts[0].title}
              </h4>
              <p className="text-xs text-[#55685F] mt-1 line-clamp-2">
                {localAlerts[0].description} ({localAlerts[0].confirmedCount} citizens confirmed). Tap to see live map.
              </p>
            </div>
          ) : (
            <div
              onClick={() => navigate('alerts')}
              className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs hover:border-[#063B2C] transition-all cursor-pointer text-center"
            >
              <p className="text-xs font-semibold text-[#55685F]">
                No active traffic or weather hazards reported right now in Jalpaiguri.
              </p>
              <span className="text-[11px] font-bold text-[#063B2C] underline mt-1 inline-block">
                View Community Map & Report
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
