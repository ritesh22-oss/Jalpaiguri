import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ViewType } from '../types';

interface NavigationStackItem {
  view: ViewType;
  params?: Record<string, any>;
}

const isFileOrigin = (): boolean =>
  typeof window !== 'undefined' && window.location.protocol === 'file:';

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

const parseRouteString = (routeStr: string): NavigationStackItem | null => {
  const cleanPath = routeStr.replace(/^#?\/+|\/+$/g, '').split('?')[0];
  if (!cleanPath || cleanPath === 'index.html' || cleanPath.startsWith('android_asset')) {
    return null;
  }
  const [head, section] = cleanPath.split('/');
  const pathMapping: Record<string, ViewType> = {
    shops: 'shop-marketplace',
    blood: 'blood',
    discover: 'discover',
    profile: 'profile',
    home: 'home',
    notifications: 'notifications',
    'admin-notifications': 'admin-notifications',
    auth: 'auth',
    onboarding: 'onboarding'
  };
  if (head === 'admin-dashboard') {
    return {
      view: 'admin-dashboard',
      params: section ? { section: decodeURIComponent(section) } : {}
    };
  }
  const view = pathMapping[head] || (head as ViewType);
  return { view: view || 'home' };
};

const itemFromLocation = (): NavigationStackItem | null => {
  if (typeof window === 'undefined') return null;
  if (window.location.hash && window.location.hash.startsWith('#/')) {
    const fromHash = parseRouteString(window.location.hash);
    if (fromHash) return fromHash;
  }
  if (isFileOrigin()) {
    return null;
  }
  return parseRouteString(window.location.pathname);
};

const formatHistoryUrl = (view: ViewType, params?: Record<string, any>): string => {
  const route = pathFor(view, params);
  if (isFileOrigin()) {
    return `#${route}`;
  }
  return route;
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
      const fromLoc = itemFromLocation();
      if (fromLoc) return [fromLoc];

      const savedView = sessionStorage.getItem('jpg_current_view') as ViewType | null;
      const savedParamsRaw = sessionStorage.getItem('jpg_current_params');
      const savedParams = savedParamsRaw ? JSON.parse(savedParamsRaw) : undefined;
      if (savedView && savedView !== 'splash') {
        return [{ view: savedView, params: savedParams }];
      }
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

  useEffect(() => {
    if (currentView && currentView !== 'splash') {
      try {
        sessionStorage.setItem('jpg_current_view', currentView);
        sessionStorage.setItem('jpg_current_params', JSON.stringify(params || {}));
      } catch (e) {}
    }
  }, [currentView, params]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as NavigationStackItem | null;
      const next = state?.view ? state : itemFromLocation() || { view: 'home' as ViewType };
      setHistory([{ view: next.view, params: next.params }]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => [...prev, { view, params: newParams }]);
    try {
      window.history.pushState({ view, params: newParams }, '', formatHistoryUrl(view, newParams));
    } catch (e) {
      console.warn('[MYJPG ROUTER] pushState warning:', e);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    if (history.length > 1) {
      window.history.back();
    } else {
      const home: NavigationStackItem = { view: 'home' };
      setHistory([home]);
      try {
        window.history.replaceState(home, '', formatHistoryUrl(home.view));
      } catch (e) {}
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [history.length]);

  const resetToHome = useCallback(() => {
    setHistory([{ view: 'home' }]);
    try {
      window.history.replaceState({ view: 'home' }, '', formatHistoryUrl('home'));
    } catch (e) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const replaceView = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { view, params: newParams };
      return copy;
    });
    try {
      window.history.replaceState({ view, params: newParams }, '', formatHistoryUrl(view, newParams));
    } catch (e) {
      console.warn('[MYJPG ROUTER] replaceState warning:', e);
    }
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
