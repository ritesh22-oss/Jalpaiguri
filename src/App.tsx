import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: 'white', zIndex: 9999, position: 'absolute', inset: 0 }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.message}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}

import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNav } from './context/NavigationContext';
import { AppProvider, useApp } from './context/AppContext';
import { LocationProvider, useLocation } from './context/LocationContext';
import { SafetyProvider } from './context/SafetyContext';
import { ExpoProvider } from './context/ExpoContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ExpoDeviceShell } from './components/common/ExpoDeviceShell';

// Views
import { SplashScreen } from './components/views/SplashScreen';
import { OnboardingView } from './components/views/OnboardingView';
import { AuthView } from './components/views/AuthView';
import { PhoneAuthView } from './components/views/PhoneAuthView';
import { OTPView } from './components/views/OTPView';
import { ProfileSetupView } from './components/views/ProfileSetupView';
import { ProfileOnboardingView } from './components/views/ProfileOnboardingView';
import { HomeView } from './components/views/HomeView';
import { NearbyView } from './components/views/NearbyView';
import { DiscoverView } from './components/views/DiscoverView';
import { WorkersView } from './components/views/WorkersView';
import { WorkerDetailView } from './components/views/WorkerDetailView';
import { WorkerRequestModalView } from './components/views/WorkerRequestModalView';
import { ReportProblemView } from './components/views/ReportProblemView';
import { ReportTrackingView } from './components/views/ReportTrackingView';
import { AlertsMapView } from './components/views/AlertsMapView';
import { EmergencyView } from './components/views/EmergencyView';
import { MedicalView } from './components/views/MedicalView';
import { BloodView } from './components/views/BloodView';
import { JobsView } from './components/views/JobsView';
import { VehicleView } from './components/views/VehicleView';
import { RentalsView } from './components/views/RentalsView';
import { BusinessesView } from './components/views/BusinessesView';
import { GovernmentServicesView } from './components/views/GovernmentServicesView';
import { BanksAtmsView } from './components/views/BanksAtmsView';
import { TransportView } from './components/transport/TransportView';
import { CourierSectionView } from './components/courier/CourierView';
import { EducationView } from './components/education/EducationView';
import { LostFoundView } from './components/views/LostFoundView';
import { ChatView } from './components/views/ChatView';
import { GeminiChatView } from './components/views/GeminiChatView';
import { MapsExplorerView } from './components/views/MapsExplorerView';
import { ProfileView } from './components/views/ProfileView';
import { OfferServicesView } from './components/views/OfferServicesView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { FAQView } from './components/views/FAQView';
import { OutsideAreaView } from './components/views/OutsideAreaView';
import { LocationPermissionRequiredView } from './components/views/LocationPermissionRequiredView';
import { SafetySosView } from './components/views/SafetySosView';
import { SexualViolenceSupportView } from './components/views/SexualViolenceSupportView';
import { EmergencyBloodFinder } from './components/views/EmergencyBloodFinder';
import { CreateBloodRequestView } from './components/views/CreateBloodRequestView';
import { DonorSettingsView } from './components/views/DonorSettingsView';
import { DonorDetailsView } from './components/views/DonorDetailsView';
import { ThemeProvider } from './context/ThemeContext';

// Shop Marketplace & Merchant Platform

// Dining Marketplace & Restaurant Owner Platform
import { DiningMarketplaceView } from './components/dining/DiningMarketplaceView';
import { RestaurantDetailView } from './components/dining/RestaurantDetailView';
import { AddRestaurantWizardView } from './components/dining/AddRestaurantWizardView';
import { RestaurantDashboardView } from './components/dining/RestaurantDashboardView';

import { ShopMarketplaceView } from './components/shops/ShopMarketplaceView';
import { ShopDetailView } from './components/shops/ShopDetailView';
import { AddShopWizardView } from './components/shops/AddShopWizardView';
import { MerchantDashboardView } from './components/shops/MerchantDashboardView';
import { SmartShoppingSearchView } from './components/shops/SmartShoppingSearchView';
import { PujaPandalsView } from './components/views/PujaPandalsView';

// Common Components & Modals
import { BottomNav } from './components/common/BottomNav';
import { FiltersBottomSheet } from './components/common/FiltersBottomSheet';
import { LocationSelectorModal } from './components/common/LocationSelectorModal';
import { JPGAssistantModal } from './components/common/JPGAssistantModal';
import { Toast } from './components/common/Toast';
import { Loader2 } from 'lucide-react';
import { JPGLogo } from './components/common/JPGLogo';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { OfflineView } from './components/common/OfflineView';
import { BeautifulLoader } from './components/common/BeautifulLoader';
import { AppTour } from './components/common/AppTour';
import { TourLanguageModal } from './components/common/TourLanguageModal';

const AppContent: React.FC = () => {
  // 1. ALL HOOKS MUST BE AT THE VERY TOP, UNCONDITIONAL
  const { currentView, replaceView, navigate, goBack } = useNav();
  const { user, firebaseUser, isAuthenticated, isProfileComplete, isLoading, isRedirectPending } = useAuth();
  const { isWithinServiceRegion, serviceAreaStatus, status: locationStatus, location } = useLocation();
  const { pujaPandals, addPujaPandal, reportPandalInfo } = useApp();
  const { isBengali } = useLanguage();
  const { isOnline } = useOnlineStatus();

  // 1. Initial Routing Effect (From Splash)
  React.useEffect(() => {
    // We only take action if we are NOT loading AND we are currently on the splash screen
    if (!isLoading && currentView === 'splash') {
      console.log('[STARTUP FLOW] Initialization complete. Determining destination...');
      
      if (isAuthenticated) {
        if (isProfileComplete) {
          console.log('[STARTUP FLOW] Authenticated & Profile Complete -> Home');
          const isAdminLogin = localStorage.getItem('jpg_admin_login_detected') === 'true';
          if (isAdminLogin && user?.role === 'admin') {
            localStorage.removeItem('jpg_admin_login_detected');
            replaceView('admin-dashboard');
          } else {
            replaceView('home');
          }
        } else {
          console.log('[STARTUP FLOW] Authenticated but Profile Incomplete -> Profile Setup');
          replaceView('profile-setup');
        }
      } else {
        const hasOnboarded = localStorage.getItem('jpg_has_onboarded') === 'true';
        if (hasOnboarded) {
          console.log('[STARTUP FLOW] Not Authenticated (Onboarded) -> Auth');
          replaceView('auth');
        } else {
          console.log('[STARTUP FLOW] Not Authenticated (New User) -> Onboarding');
          replaceView('onboarding');
        }
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, currentView, replaceView, user?.role]);

  // 2. Auth Guard Effects (Prevent access to auth screens if already logged in)
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && isProfileComplete) {
      if (
        currentView === 'auth' ||
        currentView === 'phone-auth' ||
        currentView === 'otp' ||
        currentView === 'onboarding'
      ) {
        console.log('[AUTH GUARD] User already authenticated, redirecting to home');
        replaceView('home');
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, currentView, replaceView]);

  // 3. Profile Setup Guard
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !isProfileComplete) {
      if (
        currentView === 'home' ||
        currentView === 'nearby' ||
        currentView === 'discover' ||
        currentView === 'profile'
      ) {
        console.log('[AUTH GUARD] Profile incomplete, redirecting to profile setup');
        replaceView('profile-setup');
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, currentView, replaceView]);
  
  const hideBottomNavViews = [
    'splash',
    'onboarding',
    'auth',
    'phone-auth',
    'otp',
    'profile-setup',
    'profile-onboarding',
    'location-permission',
    'outside-area',
    'location-permission-required',
    'safety-sos',
    'sexual-violence-support',
    'chat',
    'ai-chat',
    'admin-dashboard',
    'add-shop'
  ];
  const showBottomNav = !hideBottomNavViews.includes(currentView);

  const isExemptView =
    currentView === 'outside-area' ||
    currentView === 'safety-sos' ||
    currentView === 'sexual-violence-support' ||
    currentView === 'splash';

  // 3. CONDITIONAL EARLY RETURNS (Must be AFTER all hooks)
  
  // Admin bypass
  if (user?.role === 'admin' && currentView === 'admin-dashboard') {
    sessionStorage.setItem('jpg_splash_shown', 'true');
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <AdminDashboardView />
        <Toast />
      </div>
    );
  }

  // Location bypass
  if (serviceAreaStatus === 'outside' && !isExemptView) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <OutsideAreaView onNavigate={navigate} />
        </main>
        <Toast />
      </div>
    );
  }

  if ((locationStatus === 'denied' || locationStatus === 'permission_denied') && !isExemptView) {
    return (
      <div className="w-full min-h-screen flex flex-col">
        <main className="flex-1 w-full">
          <LocationPermissionRequiredView onNavigate={navigate} />
        </main>
        <Toast />
      </div>
    );
  }

  // Loading / Redirect states
  if (isLoading) {
    if (isRedirectPending) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-6">
            <div className="relative flex flex-col items-center">
              <div className="relative mb-8">
                <BeautifulLoader size={120} className="scale-110" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <JPGLogo size="md" showText={false} outline={false} />
                </div>
              </div>
            </div>
            <div className="text-center space-y-3">
              <p className="text-sm font-black text-blue-600 dark:text-blue-400 animate-pulse tracking-[0.2em] uppercase">
                {isRedirectPending ? 'Authenticating' : 'Loading'}
              </p>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {isRedirectPending ? 'Completing Sign-in' : 'Loading App'}
              </h2>
            </div>
          </div>
        </div>
      );
    }
  }

  const renderView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashScreen />;
      case 'onboarding':
        return <OnboardingView />;
      case 'auth':
        return <AuthView />;
      case 'phone-auth':
        return <PhoneAuthView />;
      case 'otp':
        return <OTPView />;
      case 'profile-setup':
        return <ProfileSetupView />;
      case 'profile-onboarding':
      case 'location-permission':
        return <ProfileSetupView />;
      case 'outside-area':
        return <OutsideAreaView onNavigate={navigate} />;
      case 'location-permission-required':
        return <LocationPermissionRequiredView onNavigate={navigate} />;
      case 'safety-sos':
        return <SafetySosView onBack={goBack} onNavigate={navigate} />;
      case 'sexual-violence-support':
        return <SexualViolenceSupportView onBack={goBack} onNavigate={navigate} />;
      case 'home':
        return <HomeView />;
      case 'nearby':
        return <NearbyView />;
      case 'discover':
        return <DiscoverView />;
      case 'workers':
        return <WorkersView />;
      case 'worker-detail':
        return <WorkerDetailView />;
      case 'worker-request':
      case 'worker-request-tracking':
        return <WorkerRequestModalView />;
      case 'report-problem':
        return <ReportProblemView />;
      case 'report-tracking':
        return <ReportTrackingView />;
      case 'alerts':
        return <AlertsMapView />;
      case 'emergency':
        return <EmergencyView />;
      case 'medical':
      case 'doctor-detail':
      case 'hospital-detail':
      case 'pharmacy':
        return <MedicalView />;
      case 'blood':
      case 'blood-request':
      case 'blood-donors':
        return <BloodView />;
      case 'emergency-blood-finder':
        return <EmergencyBloodFinder />;
      case 'create-blood-request':
        return <CreateBloodRequestView />;
      case 'donor-settings':
        return <DonorSettingsView />;
      case 'donor-details':
        return <DonorDetailsView />;
      case 'jobs':
      case 'job-detail':
      case 'job-apply':
      case 'post-job':
        return <JobsView />;
      case 'vehicle':
      case 'vehicle-request':
      case 'animal':
        return <VehicleView />;
      case 'rentals':
      case 'rental-detail':
      case 'list-property':
        return <RentalsView />;

      case 'dining':
      case 'dining-marketplace':
        return <DiningMarketplaceView />;
      case 'restaurant-detail':
      case 'dining-detail':
        return <RestaurantDetailView />;
      case 'add-restaurant':
        return <AddRestaurantWizardView />;
      case 'restaurant-dashboard':
        return <RestaurantDashboardView />;

      case 'businesses':
      case 'shop-marketplace':
        return <ShopMarketplaceView />;
      case 'business-detail':
      case 'shop-detail':
        return <ShopDetailView />;
      case 'add-shop':
        return <AddShopWizardView />;
      case 'merchant-dashboard':
        return <MerchantDashboardView />;
      case 'smart-shopping-search':
        return <SmartShoppingSearchView />;
      case 'puja-pandals':
      case 'pandal-detail':
        return (
          <PujaPandalsView
            pandals={pujaPandals}
            userLocation={location}
            onBack={() => goBack()}
            onAddPandal={addPujaPandal}
            onReportPandal={reportPandalInfo}
          />
        );
      case 'transport':
        return <TransportView />;
      case 'courier':
        return <CourierSectionView />;
      case 'education':
        return <EducationView />;
      case 'government':
        return <GovernmentServicesView />;
      case 'banks-atms':
        return <BanksAtmsView />;
      case 'lost-found':
        return <LostFoundView />;
      case 'ai-chat':
        return <GeminiChatView />;
      case 'maps-explorer':
        return <MapsExplorerView />;
      case 'chat':
      case 'messages':
        return <GeminiChatView />;
      case 'profile':
      case 'volunteer':
      case 'settings':
      case 'notifications':
        return <ProfileView />;
      case 'offer-services':
        return <OfferServicesView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'faq':
        return <FAQView />;
      default:
        return <HomeView />;
    }
  };

  const isPostLogin = !['splash', 'onboarding', 'auth', 'phone-auth', 'otp', 'profile-setup', 'profile-onboarding'].includes(currentView);

  return (
    <div className="w-full min-h-screen min-h-[100dvh] bg-[#FAF8F5] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col relative transition-colors">
      <AnimatePresence>
        {!isOnline && <OfflineView />}
      </AnimatePresence>

      <main
        className={`flex-1 w-full ${isBengali ? 'font-bengali' : ''} ${!isOnline ? 'hidden' : ''}`}
        data-lang={isBengali ? 'bn' : 'en'}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full h-full flex flex-col"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showBottomNav && isOnline && <BottomNav />}

      {/* Global Modals & Sheets */}
      {isOnline && (
        <>
          <LocationSelectorModal />
          <FiltersBottomSheet />
          <JPGAssistantModal />
          <TourLanguageModal />
          <AppTour />
        </>
      )}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <ExpoProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <LocationProvider>
              <SafetyProvider>
                <NavigationProvider>
                  <AppProvider>
                    <ErrorBoundary><AppContent /></ErrorBoundary>
                  </AppProvider>
                </NavigationProvider>
              </SafetyProvider>
            </LocationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ExpoProvider>
  );
}
