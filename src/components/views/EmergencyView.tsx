import React from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Ambulance,
  Shield,
  Flame,
  PlusSquare,
  Droplet,
  Zap,
  Waves,
  MoreHorizontal,
  Navigation,
  Phone,
  Compass,
  MapPin
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useAuth } from '../../context/AuthContext';
import { JalpaiguriLogo } from '../common/JalpaiguriLogo';

export const EmergencyView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { user } = useAuth();

  const emergencyTiles = [
    {
      id: 'em-ambulance',
      label: 'Ambulance',
      icon: <Ambulance className="w-7 h-7 text-[#D9383A] dark:text-red-400" />,
      number: '108',
      bg: 'bg-[#FFEBEA] dark:bg-[#2A1516] border-[#FFCCD0] dark:border-red-900/40',
      textColor: 'text-[#D9383A] dark:text-red-400'
    },
    {
      id: 'em-police',
      label: 'Police',
      icon: <Shield className="w-7 h-7 text-[#0A58CA] dark:text-sky-400" />,
      number: '112',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-fire',
      label: 'Fire',
      icon: <Flame className="w-7 h-7 text-[#DC2626] dark:text-red-400" />,
      number: '101',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-hospital',
      label: 'Hospital',
      icon: <PlusSquare className="w-7 h-7 text-[#15803D] dark:text-emerald-400" />,
      number: '03561-224001',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-blood',
      label: 'Blood Bank',
      icon: <Droplet className="w-7 h-7 text-[#D9383A] dark:text-rose-400" />,
      number: '03561-224005',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-electricity',
      label: 'Electricity',
      icon: <Zap className="w-7 h-7 text-[#0A58CA] dark:text-blue-400" />,
      number: '19121',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-water',
      label: 'Water',
      icon: <Waves className="w-7 h-7 text-[#0284C7] dark:text-cyan-400" />,
      number: '03561-224150',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    },
    {
      id: 'em-more',
      label: 'More Services',
      icon: <MoreHorizontal className="w-7 h-7 text-[#64748B] dark:text-slate-400" />,
      number: '1077',
      bg: 'bg-white dark:bg-[#17231E] border-[#E8E4DA] dark:border-white/10',
      textColor: 'text-[#11241C] dark:text-white'
    }
  ];

  const handleTileClick = (number: string, label: string) => {
    const confirmCall = confirm(`Direct emergency dial for ${label}: ${number}\n\nCall now?`);
    if (confirmCall) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0F1A15] pb-28 max-w-md mx-auto select-none transition-colors">
      {/* Header matching Screenshot 6 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 dark:bg-[#0F1A15]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/40 dark:border-white/10 transition-colors">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-[#1F312A] active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <div onClick={() => navigate('home')} className="cursor-pointer">
          <JalpaiguriLogo size="sm" showText={false} />
        </div>

        <div
          onClick={() => navigate('profile')}
          className="w-9 h-9 rounded-full bg-[#063B2C] dark:bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
        >
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Emergency Assistance Heading with red alert icon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-7 h-7 text-[#D9383A] dark:text-red-400 stroke-[2.2]" />
              <h1 className="text-2xl font-extrabold text-[#11241C] dark:text-white tracking-tight">
                Emergency Assistance
              </h1>
            </div>
            <button
              onClick={() => navigate('safety-sos')}
              className="px-3 py-1 rounded-full bg-[#D92D20] text-white font-extrabold text-xs flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
            >
              <span>🆘 Safety SOS</span>
            </button>
          </div>
          <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] leading-relaxed">
            Immediate access to critical services. In a life-threatening emergency, call the national emergency number directly.
          </p>
        </div>

        {/* Prominent SAFETY SOS HUB CARD */}
        <div
          onClick={() => navigate('safety-sos')}
          className="bg-gradient-to-br from-[#FEF3F2] to-[#FFF0F0] dark:from-[#2A1516] dark:to-[#1F1012] border-2 border-[#FECDCA] dark:border-red-900/50 rounded-3xl p-5 shadow-sm space-y-3 cursor-pointer hover:border-[#D92D20] transition-all active:scale-98"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#D92D20] animate-ping" />
              <span className="text-xs font-black uppercase tracking-wider text-[#B42318] dark:text-red-400">
                Personal Safety System
              </span>
            </div>
            <span className="text-xs font-bold text-[#063B2C] dark:text-emerald-400 bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 px-2.5 py-0.5 rounded-full">
              Open Hub →
            </span>
          </div>

          <div>
            <h2 className="text-base font-black text-[#11241C] dark:text-white">
              🆘 Safety SOS: Hold-to-SOS & Contacts
            </h2>
            <p className="text-xs text-[#55685F] dark:text-[#A2B3AA] mt-1 leading-relaxed">
              Equipped with 1.5s hold-to-activate, Shake-to-SOS motion detection, verified trusted emergency contact notifications, and nearby community safety alerts.
            </p>
          </div>

          <div className="pt-1 flex items-center gap-2 text-xs font-bold flex-wrap">
            <span className="bg-white/80 dark:bg-[#17231E]/80 px-2.5 py-1 rounded-xl text-[#B42318] dark:text-red-400 border border-[#FECDCA] dark:border-red-900/40">
              • Hold for SOS
            </span>
            <span className="bg-white/80 dark:bg-[#17231E]/80 px-2.5 py-1 rounded-xl text-[#11241C] dark:text-white border border-[#E8E4DA] dark:border-white/10">
              • Shake Phone
            </span>
            <span className="bg-white/80 dark:bg-[#17231E]/80 px-2.5 py-1 rounded-xl text-[#063B2C] dark:text-emerald-400 border border-[#E8E4DA] dark:border-white/10">
              • 112 Dispatch
            </span>
          </div>
        </div>

        {/* Dedicated Sexual Violence & Assault Support Link */}
        <div
          onClick={() => navigate('sexual-violence-support')}
          className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 hover:border-[#063B2C] dark:hover:border-emerald-500 rounded-3xl p-4 shadow-xs flex items-center justify-between cursor-pointer transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F0] dark:bg-red-950/50 text-[#D92D20] dark:text-red-400 flex items-center justify-center shrink-0 border border-transparent dark:border-red-900/40">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                🛡️ Sexual Violence & Assault Support
              </h3>
              <p className="text-xs text-[#55685F] dark:text-[#A2B3AA]">
                Immediate safety triage, medical care, legal aid, private diary
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#063B2C] dark:text-emerald-400">View →</span>
        </div>

        {/* 8 Grid Emergency Tiles */}
        <div className="grid grid-cols-2 gap-3">
          {emergencyTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleTileClick(tile.number, tile.label)}
              className={`p-4 rounded-3xl border ${tile.bg} flex flex-col items-center justify-center text-center shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer min-h-[105px]`}
            >
              <div className="mb-2">{tile.icon}</div>
              <span className={`text-xs font-bold ${tile.textColor}`}>
                {tile.label}
              </span>
            </button>
          ))}
        </div>

        {/* Closest Services Section */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#11241C] dark:text-white rotate-45" />
              <h2 className="text-base font-extrabold text-[#11241C] dark:text-white">
                Closest Services
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#8C9B93] dark:text-[#A2B3AA] bg-[#EFECE6] dark:bg-[#17231E] px-2.5 py-0.5 rounded-full border border-transparent dark:border-white/10">
              Auto-detecting location...
            </span>
          </div>

          {/* Service Card 1: Jalpaiguri District Hospital */}
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEBEA] dark:bg-red-950/50 text-[#D9383A] dark:text-red-400 flex items-center justify-center shrink-0 border border-transparent dark:border-red-900/40">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Jalpaiguri District Hospital
                </h3>
                <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-[#55685F] dark:text-[#A2B3AA]" />
                    <span>2.4 km away</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#063B2C] dark:text-emerald-400 font-bold">Open 24/7</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTileClick('03561-224001', 'District Hospital Emergency')}
                className="py-2.5 px-3 rounded-2xl bg-[#B91C1C] hover:bg-[#991B1B] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => alert('Navigating to Jalpaiguri District Hospital via Hospital Road')}
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1C2C24] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Service Card 2: Kotwali Police Station */}
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF2FC] dark:bg-blue-950/50 text-[#0A58CA] dark:text-sky-400 flex items-center justify-center shrink-0 border border-transparent dark:border-blue-900/40">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Kotwali Police Station
                </h3>
                <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#55685F] dark:text-[#A2B3AA]" />
                  <span>3.1 km away</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTileClick('03561-224100', 'Kotwali Police Station')}
                className="py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => alert('Navigating to Kotwali Police Station via Court Complex')}
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1C2C24] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Service Card 3: Jalpaiguri Fire Station */}
          <div className="bg-white dark:bg-[#17231E] border border-[#E8E4DA] dark:border-white/10 rounded-3xl p-4 shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] dark:bg-red-950/50 text-[#DC2626] dark:text-red-400 flex items-center justify-center shrink-0 border border-transparent dark:border-red-900/40">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C] dark:text-white">
                  Jalpaiguri Fire Station
                </h3>
                <p className="text-xs font-semibold text-[#55685F] dark:text-[#A2B3AA] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#55685F] dark:text-[#A2B3AA]" />
                  <span>4.5 km away</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTileClick('03561-224101', 'Fire Emergency')}
                className="py-2.5 px-3 rounded-2xl bg-[#063B2C] dark:bg-emerald-600 hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => alert('Navigating to Fire Station via Station Road')}
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121E19] border border-[#D2CEBE] dark:border-white/10 text-[#11241C] dark:text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] dark:hover:bg-[#1C2C24] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
