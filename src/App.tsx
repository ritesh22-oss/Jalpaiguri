import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationProvider, useNav } from './context/NavigationContext';
import { AppProvider, useApp } from './context/AppContext';

// Views
import { SplashScreen } from './components/views/SplashScreen';
import { OnboardingView } from './components/views/OnboardingView';
import { AuthView } from './components/views/AuthView';
import { ProfileOnboardingView } from './components/views/ProfileOnboardingView';
import { HomeView } from './components/views/HomeView';
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
import { ProfileView } from './components/views/ProfileView';
import { OfferServicesView } from './components/views/OfferServicesView';
import { AdminDashboardView } from './components/views/AdminDashboardView';

// Common Components
import { BottomNav } from './components/common/BottomNav';
import { FiltersBottomSheet } from './components/common/FiltersBottomSheet';
import { JalpaigiAssistantModal } from './components/common/JalpaigiAssistantModal';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { currentView } = useNav();
  const { user } = useAuth();

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
      case 'otp':
        return <AuthView />;
      case 'profile-onboarding':
      case 'location-permission':
        return <ProfileOnboardingView />;
      case 'home':
        return <HomeView />;
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
      case 'chat':
      case 'messages':
        return <ChatView />;
      case 'profile':
      case 'volunteer':
      case 'settings':
      case 'notifications':
        return <ProfileView />;
      case 'offer-services':
        return <OfferServicesView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      default:
        return <HomeView />;
    }
  };

  // Determine if BottomNav should be visible
  const hideBottomNavViews = ['splash', 'onboarding', 'auth', 'profile-onboarding', 'chat', 'admin-dashboard'];
  const showBottomNav = !hideBottomNavViews.includes(currentView);

  return (
    <div className="min-h-screen bg-[#F0ECE1] flex justify-center text-[#11241C] font-sans antialiased">
      <div className="w-full max-w-md min-h-screen bg-[#FAF8F5] shadow-2xl relative flex flex-col justify-between overflow-x-hidden">
        <main className="flex-1 w-full">{renderView()}</main>

        {showBottomNav && <BottomNav />}

        {/* Global Modals & Sheets */}
        <FiltersBottomSheet />
        <JalpaigiAssistantModal />
        <Toast />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}
