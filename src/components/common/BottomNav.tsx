import React from 'react';
import { Home, Store, Compass, User, Droplet } from 'lucide-react';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
  const { currentView, navigate } = useNav();
  const { isBengali, t } = useLanguage();

  const isHomeActive = currentView === 'home';
  const isShopActive =
    currentView === 'shop-marketplace' ||
    currentView === 'businesses' ||
    currentView === 'shop-detail' ||
    currentView === 'business-detail' ||
    currentView === 'merchant-dashboard' ||
    currentView === 'add-shop' ||
    currentView === 'smart-shopping-search';

  const isBloodActive =
    currentView === 'blood' ||
    currentView === 'blood-request' ||
    currentView === 'blood-donors';

  const isDiscoverActive =
    currentView === 'discover' ||
    currentView === 'workers' ||
    currentView === 'jobs' ||
    currentView === 'medical' ||
    currentView === 'rentals' ||
    currentView === 'government' ||
    currentView === 'banks-atms' ||
    currentView === 'alerts';

  const isProfileActive =
    currentView === 'profile' ||
    currentView === 'settings' ||
    currentView === 'saved';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-gray-100 dark:border-white/10 px-2 py-1 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)] transition-colors w-full">
      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex items-center justify-around">
        {/* 1. Home */}
        <button
          id="nav-home"
          onClick={() => navigate('home')}
          className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all cursor-pointer group hover:scale-105 active:scale-95"
          title="Home"
        >
          <div className={`p-1 rounded-xl transition-colors ${isHomeActive ? 'text-[#007AFF] dark:text-[#38BDF8]' : 'text-[#64748B] dark:text-gray-400 group-hover:text-gray-900'}`}>
            <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isHomeActive ? 'text-[#007AFF] dark:text-[#38BDF8] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
            {t('common.home')}
          </span>
        </button>

        {/* 2. Shops / Marketplace */}
        <button
          id="nav-shops"
          onClick={() => navigate('shop-marketplace')}
          className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all cursor-pointer group hover:scale-105 active:scale-95"
          title="Shops"
        >
          <div className={`p-1 rounded-xl transition-colors ${isShopActive ? 'text-[#007AFF] dark:text-[#38BDF8]' : 'text-[#64748B] dark:text-gray-400 group-hover:text-gray-900'}`}>
            <Store className={`w-5 h-5 ${isShopActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isShopActive ? 'text-[#007AFF] dark:text-[#38BDF8] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
            {isBengali ? 'দোকান' : 'Shops'}
          </span>
        </button>

        {/* 3. Center Blood Button (🩸 Cool Light Red Circular Action) */}
        <button
          id="nav-blood"
          onClick={() => navigate('blood')}
          className="flex flex-col items-center justify-center py-0.5 px-1 min-w-[56px] transition-all -mt-4 cursor-pointer group"
          title="Blood Donation & Donors"
        >
          <div className="relative">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all group-active:scale-95 border-2 ${
                isBloodActive
                  ? 'bg-rose-200 dark:bg-rose-900/90 text-red-600 dark:text-red-400 ring-4 ring-rose-300/70 dark:ring-rose-800/60 border-red-500 dark:border-red-400 shadow-lg shadow-rose-500/30'
                  : 'bg-rose-100/90 dark:bg-rose-950/80 text-red-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/80 hover:bg-rose-200/90 dark:hover:bg-rose-900/80 shadow-md shadow-rose-500/15'
              }`}
            >
              <Droplet className="w-6 h-6 fill-red-600 text-red-600 dark:fill-red-500 dark:text-red-400 drop-shadow-xs animate-pulse" />
            </div>
            {/* Cool emergency live indicator badge */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-white dark:border-[#0F172A]"></span>
            </span>
          </div>
          <span
            className={`text-[11px] font-black tracking-tight mt-1 whitespace-nowrap ${
              isBloodActive ? 'text-red-600 dark:text-red-400' : 'text-red-700/90 dark:text-rose-300'
            }`}
          >
            {isBengali ? 'রক্ত' : 'Blood'}
          </span>
        </button>

        {/* 4. Discover */}
        <button
          id="nav-discover"
          onClick={() => navigate('discover')}
          className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all cursor-pointer group hover:scale-105 active:scale-95"
          title="Discover"
        >
          <div className={`p-1 rounded-xl transition-colors ${isDiscoverActive ? 'text-[#007AFF] dark:text-[#38BDF8]' : 'text-[#64748B] dark:text-gray-400 group-hover:text-gray-900'}`}>
            <Compass className={`w-5 h-5 ${isDiscoverActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isDiscoverActive ? 'text-[#007AFF] dark:text-[#38BDF8] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
            {t('common.discover')}
          </span>
        </button>

        {/* 5. Profile */}
        <button
          id="nav-profile"
          onClick={() => navigate('profile')}
          className="flex flex-col items-center justify-center py-1 px-2 min-w-[56px] transition-all cursor-pointer group hover:scale-105 active:scale-95"
          title="Profile"
        >
          <div className={`p-1 rounded-xl transition-colors ${isProfileActive ? 'text-[#007AFF] dark:text-[#38BDF8]' : 'text-[#64748B] dark:text-gray-400 group-hover:text-gray-900'}`}>
            <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          </div>
          <span className={`text-[11px] font-medium tracking-tight whitespace-nowrap ${isProfileActive ? 'text-[#007AFF] dark:text-[#38BDF8] font-bold' : 'text-[#64748B] dark:text-gray-400'}`}>
            {t('common.profile')}
          </span>
        </button>
      </div>
    </nav>
  );
};
