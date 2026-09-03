import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  Sun,
  Moon,
  ShieldAlert,
  CheckCircle2,
  X,
  Navigation,
  Waves,
  ArrowRight
} from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { LiveTrafficWaterlogging } from '../common/LiveTrafficWaterlogging';

export const AlertsMapView: React.FC = () => {
  const { navigate } = useNav();
  const { localAlerts, confirmLocalAlert } = useApp();
  const { isDarkMode, toggleTheme } = useTheme();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TRAFFIC' | 'WATERLOGGING' | 'NOTICES'>('ALL');
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  return (
    <div className="relative min-h-screen bg-[#FAF8F5] dark:bg-[#0E1714] text-[#11241C] dark:text-[#E8F0EC] pb-28 max-w-md mx-auto select-none transition-colors duration-200">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 dark:bg-[#0E1714]/95 backdrop-blur-md px-4 pt-5 pb-3 border-b border-[#E8E4DA] dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-[#11241C] dark:text-white">
                Live Traffic & Waterlogging
              </h1>
            </div>
            <p className="text-[11px] font-semibold text-[#55685F] dark:text-[#9FB2A8] flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-[#063B2C] dark:text-[#34D399]" />
              <span>Jalpaiguri Municipal Region</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl bg-white dark:bg-[#16221D] border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#55685F] dark:text-[#9FB2A8] shadow-xs hover:bg-[#F2EFE9] dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#063B2C]" />}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {[
            { id: 'ALL', label: 'All Overlays' },
            { id: 'TRAFFIC', label: 'Live Traffic' },
            { id: 'WATERLOGGING', label: 'Waterlogging' },
            { id: 'NOTICES', label: 'Road Notices' }
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C] shadow-xs'
                    : 'bg-white dark:bg-[#16221D] text-[#55685F] dark:text-[#9FB2A8] border border-[#E8E4DA] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        {/* Real-time Google Maps Traffic & Waterlogging Component */}
        {(activeFilter === 'ALL' || activeFilter === 'TRAFFIC' || activeFilter === 'WATERLOGGING') && (
          <LiveTrafficWaterlogging
            height="46vh"
            showControls={true}
            showCorridorShortcuts={true}
            showTelemetryCard={activeFilter !== 'TRAFFIC'}
          />
        )}

        {/* Official Municipal Notices & Civic Advisories */}
        {(activeFilter === 'ALL' || activeFilter === 'NOTICES') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#55685F] dark:text-[#9FB2A8] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#063B2C] dark:text-[#34D399]" />
                <span>Official Municipal Road Advisories</span>
              </h2>
            </div>

            {localAlerts.length === 0 ? (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#16221D] border border-[#E8E4DA] dark:border-white/10 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white">
                  No Active Road Advisories
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#9FB2A8]">
                  All municipal roadways in Jalpaiguri are currently operating under standard scheduled flow.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {localAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedNotice(alert)}
                    className="p-4 rounded-3xl bg-white dark:bg-[#16221D] border border-[#E8E4DA] dark:border-white/10 shadow-xs space-y-2.5 cursor-pointer hover:border-[#063B2C] dark:hover:border-[#34D399] transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="px-2 py-0.5 rounded-full bg-[#063B2C]/10 dark:bg-[#34D399]/10 text-[#063B2C] dark:text-[#34D399] text-[10px] font-extrabold uppercase">
                          {alert.category}
                        </span>
                        <h3 className="text-xs font-extrabold text-[#11241C] dark:text-white mt-1">
                          {alert.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold text-[#8C9B93] shrink-0">
                        {alert.timeAgo}
                      </span>
                    </div>

                    <p className="text-xs text-[#55685F] dark:text-[#9FB2A8] line-clamp-2">
                      {alert.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-bold text-[#55685F] dark:text-[#9FB2A8] pt-1 border-t border-[#F0ECE1] dark:border-white/5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#063B2C] dark:text-[#34D399]" />
                        {alert.area}
                      </span>
                      <span className="text-[#063B2C] dark:text-[#34D399]">
                        {alert.confirmedCount} citizens noted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-[#16221D] rounded-3xl p-5 w-full max-w-sm shadow-2xl border border-[#E8E4DA] dark:border-white/10 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#063B2C]/10 dark:bg-[#34D399]/10 text-[#063B2C] dark:text-[#34D399] text-[10px] font-extrabold uppercase">
                  {selectedNotice.category}
                </span>
                <h3 className="text-sm font-extrabold text-[#11241C] dark:text-white mt-1">
                  {selectedNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#55685F] dark:text-[#9FB2A8] hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#55685F] dark:text-[#9FB2A8] leading-relaxed">
              {selectedNotice.description}
            </p>

            <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#0E1714] border border-[#E8E4DA] dark:border-white/10 space-y-1">
              <p className="text-[11px] font-bold text-[#11241C] dark:text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#063B2C] dark:text-[#34D399]" />
                <span>{selectedNotice.area}</span>
              </p>
              <p className="text-[10px] text-[#8C9B93]">
                Reported {selectedNotice.timeAgo} • Verified for Jalpaiguri
              </p>
            </div>

            <button
              onClick={() => {
                confirmLocalAlert(selectedNotice.id);
                setSelectedNotice(null);
              }}
              className="w-full py-3 rounded-2xl bg-[#063B2C] dark:bg-[#34D399] text-white dark:text-[#063B2C] text-xs font-bold shadow-md active:scale-95 transition-all"
            >
              Acknowledge Advisory
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
