import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ViewType } from '../types';

interface NavigationStackItem {
  view: ViewType;
  params?: Record<string, any>;
}

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
      // Direct explicit deep links (e.g., /admin-dashboard) can be supported if specifically accessed, otherwise default to splash
      const path = window.location.pathname;
      if (path && path !== '/' && path !== '') {
        const cleanPath = path.replace(/^\//, '');
        if (cleanPath === 'admin-dashboard') return [{ view: 'admin-dashboard' }];
        if (cleanPath === 'auth') return [{ view: 'auth' }];
        if (cleanPath === 'onboarding') return [{ view: 'onboarding' }];
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

  // Sync current view to sessionStorage and URL pathname on view change
  useEffect(() => {
    if (currentView && currentView !== 'splash') {
      try {
        sessionStorage.setItem('jpg_current_view', currentView);
        const pathMapping: Record<string, string> = {
          'shop-marketplace': '/shops',
          'blood': '/blood',
          'discover': '/discover',
          'profile': '/profile',
          'home': '/home',
          'notifications': '/notifications',
          'admin-notifications': '/admin-notifications'
        };
        const urlPath = pathMapping[currentView] || `/${currentView}`;
        window.history.replaceState(null, '', urlPath);
      } catch (e) {}
    }
  }, [currentView]);

  const navigate = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => [...prev, { view, params: newParams }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) {
        return prev.slice(0, -1);
      }
      return [{ view: 'home' }];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const resetToHome = useCallback(() => {
    setHistory([{ view: 'home' }]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const replaceView = useCallback((view: ViewType, newParams?: Record<string, any>) => {
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { view, params: newParams };
      return copy;
    });
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
