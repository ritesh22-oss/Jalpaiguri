import React from 'react';
import { Home, Compass, Radio, Bell, User } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { currentView, navigate } = useNav();
  const { notifications, localAlerts } = useApp();
  const { t } = useLanguage();

  const unreadAlerts = localAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const isHomeActive = currentView === 'home';
  const isDiscoverActive = currentView === 'discover' || currentView === 'workers' || currentView === 'jobs' || currentView === 'medical' || currentView === 'rentals' || currentView === 'businesses' || currentView === 'government';
  const isHelpActive = currentView === 'vehicle' || currentView === 'blood' || currentView === 'report-problem' || currentView === 'animal' || currentView === 'volunteer';
  const isAlertsActive = currentView === 'alerts';
  const isProfileActive = currentView === 'profile' || currentView === 'settings' || currentView === 'saved';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#15211B]/95 backdrop-blur-md border-t border-[#E8E4DA] dark:border-white/10 px-2 py-1.5 flex items-center justify-around max-w-md mx-auto shadow-lg transition-colors">
      {/* Home */}
      <button
        id="nav-home"
        onClick={() => navigate('home')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isHomeActive ? 'text-[#063B2C] dark:text-[#4ECCA3]' : 'text-[#64748B] dark:text-gray-400'}`}>
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isHomeActive ? 'text-[#063B2C] dark:text-[#4ECCA3] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
          {t('common.home')}
        </span>
      </button>

      {/* Discover */}
      <button
        id="nav-discover"
        onClick={() => navigate('discover')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isDiscoverActive ? 'bg-[#063B2C] text-white dark:bg-[#1C4532] dark:text-[#4ECCA3] px-3' : 'text-[#64748B] dark:text-gray-400'}`}>
          <Compass className={`w-5 h-5 ${isDiscoverActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isDiscoverActive ? 'text-[#063B2C] dark:text-[#4ECCA3] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
          {t('common.discover')}
        </span>
      </button>

      {/* Center Help/SOS Button */}
      <button
        id="nav-help"
        onClick={() => navigate('blood')}
        className="flex flex-col items-center justify-center py-0.5 px-2 min-w-[56px] transition-all -mt-3 cursor-pointer group"
      >
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform group-active:scale-95 ${
            isHelpActive ? 'bg-[#063B2C] text-white ring-4 ring-[#E6F4EA] dark:ring-[#1E3A2B]' : 'bg-[#063B2C] text-white'
          }`}>
            <Radio className="w-6 h-6 animate-pulse-subtle" />
          </div>
          {/* Subtle pulse badge */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#D9383A] border-2 border-white dark:border-[#15211B] rounded-full"></span>
        </div>
        <span className={`text-[11px] font-bold tracking-tight mt-1 whitespace-nowrap ${isHelpActive ? 'text-[#063B2C] dark:text-[#4ECCA3]' : 'text-[#063B2C] dark:text-[#4ECCA3]'}`}>
          {t('common.help')}
        </span>
      </button>

      {/* Alerts */}
      <button
        id="nav-alerts"
        onClick={() => navigate('alerts')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer relative"
      >
        <div className={`p-1 rounded-xl transition-colors ${isAlertsActive ? 'bg-[#063B2C] text-white dark:bg-[#1C4532] dark:text-[#4ECCA3] px-3' : 'text-[#64748B] dark:text-gray-400'}`}>
          <Bell className={`w-5 h-5 ${isAlertsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        {unreadAlerts > 0 && !isAlertsActive && (
          <span className="absolute top-1 right-3.5 w-2 h-2 bg-[#D9383A] rounded-full"></span>
        )}
        <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isAlertsActive ? 'text-[#063B2C] dark:text-[#4ECCA3] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
          {t('common.alerts')}
        </span>
      </button>

      {/* Profile */}
      <button
        id="nav-profile"
        onClick={() => navigate('profile')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isProfileActive ? 'text-[#063B2C] dark:text-[#4ECCA3]' : 'text-[#64748B] dark:text-gray-400'}`}>
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isProfileActive ? 'text-[#063B2C] dark:text-[#4ECCA3] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
          {t('common.profile')}
        </span>
      </button>
    </div>
  );
};
