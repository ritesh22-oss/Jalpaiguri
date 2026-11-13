import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ViewType } from '../types';

interface NavigationStackItem {
  view: ViewType;
  params?: Record<string, any>;
}

const pathFor = (view: ViewType, params?: Record<string, any>) => {
  const pathMapping: Partial<Record<ViewType, string>> = {
    'shop-marketplace': '/shops',
    'blood': '/blood',
    'discover': '/discover',
    'profile': '/profile',
    'home': '/home',
    'notifications': '/notifications',
    'admin-notifications': '/admin-notifications'
  };

  if (view === 'admin-dashboard') {
    const section = typeof params?.section === 'string' ? params.section : '';
    return section ? `/admin-dashboard/${encodeURIComponent(section)}` : '/admin-dashboard';
  }
  return pathMapping[view] || `/${view}`;
};

const itemFromPath = (pathname: string): NavigationStackItem | null => {
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  if (!cleanPath) return null;
  const [head, section] = cleanPath.split('/');
  const pathMapping: Record<string, ViewType> = {
    shops: 'shop-marketplace', blood: 'blood', discover: 'discover', profile: 'profile',
    home: 'home', notifications: 'notifications', 'admin-notifications': 'admin-notifications',
    auth: 'auth', onboarding: 'onboarding'
  };
  if (head === 'admin-dashboard') {
    return { view: 'admin-dashboard', params: section ? { section: decodeURIComponent(section) } : {} };
  }
  const view = pathMapping[head] || (head as ViewType);
  // The app's route switch provides the safe visual fallback for legacy paths. Unknown
  // external paths deliberately resolve to home rather than leaving a blank screen.
  return { view: view || 'home' };
};

interface NavigationContextType {
  currentView: ViewType;
  params: Record<string, any>;
  navParams: Record<string, any>;
  activeParams: Record<string, any>;
  navigate: (view: ViewType, params?: Record<string, any>) => void;
  goBack: () => void;
  resetToHome: () => void;
  replaceView: (view: ViewType, params?: Record<string, any>) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<NavigationStackItem[]>(() => {
    try {
      // The address bar is canonical. This is essential for direct admin-section URLs
      // and avoids an old session value overriding a pasted/deep-linked URL.
      const fromPath = itemFromPath(window.location.pathname);
      if (fromPath) return [fromPath];

      const savedView = sessionStorage.getItem('jpg_current_view') as ViewType | null;
      if (savedView && savedView !== 'splash') return [{ view: savedView }];
    } catch (e) {
      console.warn('[MYJPG ROUTER] Error initializing route:', e);
    }

    return [{ view: 'splash' }];
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentItem = history[history.length - 1] || { view: 'home' };
  const currentView = currentItem.view;
  const params = currentItem.params || {};

  // Persist the current screen; URL writes are made by the navigation actions below so
  // browser Back/Forward retains meaningful entries instead of being overwritten.
  useEffect(() => {
    if (currentView && currentView !== 'splash') {
      try {
        sessionStorage.setItem('jpg_current_view', currentView);
      } catch (e) {}
    }
  }, [currentView]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as NavigationStackItem | null;
      const next = state?.view ? state : itemFromPath(window.location.pathname) || { view: 'home' as ViewType };
      setHistory([{ view: next.view, params: next.params }]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => [...prev, { view, params: newParams }]);
    window.history.pushState({ view, params: newParams }, '', pathFor(view, newParams));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      window.history.back();
    } else {
      const home: NavigationStackItem = { view: 'home' };
      setHistory([home]);
      window.history.replaceState(home, '', pathFor(home.view));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [history.length]);

  const resetToHome = useCallback(() => {
    setHistory([{ view: 'home' }]);
    window.history.replaceState({ view: 'home' }, '', pathFor('home'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const replaceView = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { view, params: newParams };
      return copy;
    });
    window.history.replaceState({ view, params: newParams }, '', pathFor(view, newParams));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        params,
        navParams: params,
        activeParams: params,
        navigate,
        goBack,
        resetToHome,
        replaceView,
        isFilterOpen,
        setIsFilterOpen,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isAssistantOpen,
        setIsAssistantOpen,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNav = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNav must be used within a NavigationProvider');
  }
  return context;
};
