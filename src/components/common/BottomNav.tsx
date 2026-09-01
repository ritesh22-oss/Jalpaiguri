import React from 'react';
import { Home, Compass, Radio, Bell, User, AlertTriangle } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { currentView, navigate } = useNav();
  const { notifications, localAlerts } = useApp();

  const unreadAlerts = localAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const isHomeActive = currentView === 'home';
  const isDiscoverActive = currentView === 'discover' || currentView === 'workers' || currentView === 'jobs' || currentView === 'medical' || currentView === 'rentals' || currentView === 'businesses' || currentView === 'government';
  const isHelpActive = currentView === 'vehicle' || currentView === 'blood' || currentView === 'report-problem' || currentView === 'animal' || currentView === 'volunteer';
  const isAlertsActive = currentView === 'alerts';
  const isProfileActive = currentView === 'profile' || currentView === 'settings' || currentView === 'saved';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E4DA] px-2 py-1.5 flex items-center justify-around max-w-md mx-auto shadow-lg">
      {/* Home */}
      <button
        id="nav-home"
        onClick={() => navigate('home')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isHomeActive ? 'text-[#063B2C]' : 'text-[#64748B]'}`}>
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${isHomeActive ? 'text-[#063B2C] font-bold' : 'text-[#64748B]'}`}>
          Home
        </span>
      </button>

      {/* Discover */}
      <button
        id="nav-discover"
        onClick={() => navigate('discover')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isDiscoverActive ? 'bg-[#063B2C] text-white px-3' : 'text-[#64748B]'}`}>
          <Compass className={`w-5 h-5 ${isDiscoverActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${isDiscoverActive ? 'text-[#063B2C] font-bold' : 'text-[#64748B]'}`}>
          Discover
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
            isHelpActive ? 'bg-[#063B2C] text-white ring-4 ring-[#E6F4EA]' : 'bg-[#063B2C] text-white'
          }`}>
            <Radio className="w-6 h-6 animate-pulse-subtle" />
          </div>
          {/* Subtle pulse badge */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#D9383A] border-2 border-white rounded-full"></span>
        </div>
        <span className={`text-[11px] font-bold tracking-tight mt-1 ${isHelpActive ? 'text-[#063B2C]' : 'text-[#063B2C]'}`}>
          Help
        </span>
      </button>

      {/* Alerts */}
      <button
        id="nav-alerts"
        onClick={() => navigate('alerts')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer relative"
      >
        <div className={`p-1 rounded-xl transition-colors ${isAlertsActive ? 'bg-[#063B2C] text-white px-3' : 'text-[#64748B]'}`}>
          <Bell className={`w-5 h-5 ${isAlertsActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        {unreadAlerts > 0 && !isAlertsActive && (
          <span className="absolute top-1 right-3.5 w-2 h-2 bg-[#D9383A] rounded-full"></span>
        )}
        <span className={`text-[11px] font-medium tracking-tight ${isAlertsActive ? 'text-[#063B2C] font-bold' : 'text-[#64748B]'}`}>
          Alerts
        </span>
      </button>

      {/* Profile */}
      <button
        id="nav-profile"
        onClick={() => navigate('profile')}
        className="flex flex-col items-center justify-center py-1 px-3 min-w-[56px] transition-all cursor-pointer"
      >
        <div className={`p-1 rounded-xl transition-colors ${isProfileActive ? 'text-[#063B2C]' : 'text-[#64748B]'}`}>
          <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        </div>
        <span className={`text-[11px] font-medium tracking-tight ${isProfileActive ? 'text-[#063B2C] font-bold' : 'text-[#64748B]'}`}>
          Profile
        </span>
      </button>
    </div>
  );
};
