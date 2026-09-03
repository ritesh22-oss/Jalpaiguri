import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNav } from './context/NavigationContext';
import { AppProvider, useApp } from './context/AppContext';
import { LocationProvider } from './context/LocationContext';
import { ExpoProvider } from './context/ExpoContext';
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
import { LostFoundView } from './components/views/LostFoundView';
import { ChatView } from './components/views/ChatView';
import { GeminiChatView } from './components/views/GeminiChatView';
import { MapsExplorerView } from './components/views/MapsExplorerView';
import { ProfileView } from './components/views/ProfileView';
import { OfferServicesView } from './components/views/OfferServicesView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { FAQView } from './components/views/FAQView';
import { ThemeProvider } from './context/ThemeContext';

// Common Components & Modals
import { BottomNav } from './components/common/BottomNav';
import { FiltersBottomSheet } from './components/common/FiltersBottomSheet';
import { LocationSelectorModal } from './components/common/LocationSelectorModal';
import { JalpaigiAssistantModal } from './components/common/JalpaigiAssistantModal';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { currentView, replaceView } = useNav();
  const { user, isAuthenticated, isProfileComplete, isLoading } = useAuth();

  // Automatic auth state transition: if user is authenticated but has not completed profile setup
  // and is currently on auth/onboarding views, smoothly navigate them to profile-setup immediately
  React.useEffect(() => {
    if (!isLoading && isAuthenticated && !isProfileComplete) {
      if (currentView === 'auth' || currentView === 'phone-auth' || currentView === 'onboarding') {
        replaceView('profile-setup');
      }
    }
  }, [isLoading, isAuthenticated, isProfileComplete, currentView, replaceView]);

  // If user switched to admin role and is on admin dashboard
  if (user?.role === 'admin' && currentView === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-[#FAF8F5]">
        <AdminDashboardView />
        <Toast />
      </div>
    );
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
      case 'businesses':
      case 'business-detail':
        return <BusinessesView />;
      case 'government':
        return <GovernmentServicesView />;
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

  // Determine if BottomNav should be visible
  const hideBottomNavViews = [
    'splash',
    'onboarding',
    'auth',
    'phone-auth',
    'otp',
    'profile-setup',
    'profile-onboarding',
    'location-permission',
    'chat',
    'ai-chat',
    'admin-dashboard'
  ];
  const showBottomNav = !hideBottomNavViews.includes(currentView);

  return (
    <ExpoDeviceShell>
      <main className="flex-1 w-full">{renderView()}</main>

      {showBottomNav && <BottomNav />}

      {/* Global Modals & Sheets */}
      <LocationSelectorModal />
      <FiltersBottomSheet />
      <JalpaigiAssistantModal />
      <Toast />
    </ExpoDeviceShell>
  );
};

export default function App() {
  return (
    <ExpoProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <NavigationProvider>
              <AppProvider>
                <AppContent />
              </AppProvider>
            </NavigationProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ExpoProvider>
  );
}
