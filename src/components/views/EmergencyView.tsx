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
      icon: <Ambulance className="w-7 h-7 text-[#D9383A]" />,
      number: '108',
      bg: 'bg-[#FFEBEA] border-[#FFCCD0]',
      textColor: 'text-[#D9383A]'
    },
    {
      id: 'em-police',
      label: 'Police',
      icon: <Shield className="w-7 h-7 text-[#0A58CA]" />,
      number: '112',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-fire',
      label: 'Fire',
      icon: <Flame className="w-7 h-7 text-[#DC2626]" />,
      number: '101',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-hospital',
      label: 'Hospital',
      icon: <PlusSquare className="w-7 h-7 text-[#15803D]" />,
      number: '03561-224001',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-blood',
      label: 'Blood Bank',
      icon: <Droplet className="w-7 h-7 text-[#D9383A]" />,
      number: '03561-224005',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-electricity',
      label: 'Electricity',
      icon: <Zap className="w-7 h-7 text-[#0A58CA]" />,
      number: '19121',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-water',
      label: 'Water',
      icon: <Waves className="w-7 h-7 text-[#0284C7]" />,
      number: '03561-224150',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    },
    {
      id: 'em-more',
      label: 'More Services',
      icon: <MoreHorizontal className="w-7 h-7 text-[#64748B]" />,
      number: '1077',
      bg: 'bg-white border-[#E8E4DA]',
      textColor: 'text-[#11241C]'
    }
  ];

  const handleTileClick = (number: string, label: string) => {
    const confirmCall = confirm(`Direct emergency dial for ${label}: ${number}\n\nCall now?`);
    if (confirmCall) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-28 max-w-md mx-auto select-none">
      {/* Header matching Screenshot 6 */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-[#E8E4DA]/40">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E4DA] flex items-center justify-center text-[#11241C] shadow-sm hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2]" />
        </button>

        <div onClick={() => navigate('home')} className="cursor-pointer">
          <JalpaiguriLogo size="sm" showText={false} />
        </div>

        <div
          onClick={() => navigate('profile')}
          className="w-9 h-9 rounded-full bg-[#063B2C] text-white flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
        >
          {user?.name ? user.name.charAt(0) : 'U'}
        </div>
      </header>

      <div className="p-5 space-y-6">
        {/* Emergency Assistance Heading with red alert icon */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-[#D9383A] stroke-[2.2]" />
            <h1 className="text-2xl font-extrabold text-[#11241C] tracking-tight">
              Emergency Assistance
            </h1>
          </div>
          <p className="text-xs text-[#55685F] leading-relaxed">
            Immediate access to critical services. In a life-threatening emergency, call the national emergency number directly.
          </p>
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
              <Navigation className="w-4 h-4 text-[#11241C] rotate-45" />
              <h2 className="text-base font-extrabold text-[#11241C]">
                Closest Services
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[#8C9B93] bg-[#EFECE6] px-2.5 py-0.5 rounded-full">
              Auto-detecting location...
            </span>
          </div>

          {/* Service Card 1: Jalpaiguri District Hospital */}
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEBEA] text-[#D9383A] flex items-center justify-center shrink-0">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C]">
                  Jalpaiguri District Hospital
                </h3>
                <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-[#55685F]" />
                    <span>2.4 km away</span>
                  </span>
                  <span>•</span>
                  <span className="text-[#063B2C] font-bold">Open 24/7</span>
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
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#11241C] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Service Card 2: Kotwali Police Station */}
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF2FC] text-[#0A58CA] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C]">
                  Kotwali Police Station
                </h3>
                <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#55685F]" />
                  <span>3.1 km away</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTileClick('03561-224100', 'Kotwali Police Station')}
                className="py-2.5 px-3 rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => alert('Navigating to Kotwali Police Station via Court Complex')}
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#11241C] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Directions</span>
              </button>
            </div>
          </div>

          {/* Service Card 3: Jalpaiguri Fire Station */}
          <div className="bg-white border border-[#E8E4DA] rounded-3xl p-4 shadow-xs space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-[#11241C]">
                  Jalpaiguri Fire Station
                </h3>
                <p className="text-xs font-semibold text-[#55685F] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#55685F]" />
                  <span>4.5 km away</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleTileClick('03561-224101', 'Fire Emergency')}
                className="py-2.5 px-3 rounded-2xl bg-[#063B2C] hover:bg-[#084D3A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </button>

              <button
                onClick={() => alert('Navigating to Fire Station via Station Road')}
                className="py-2.5 px-3 rounded-2xl bg-[#FAF8F5] border border-[#D2CEBE] text-[#11241C] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F3F0E6] active:scale-95 transition-all cursor-pointer"
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
