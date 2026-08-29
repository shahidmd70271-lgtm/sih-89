import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Landing Page Components
import { HeroSection } from './components/landing/HeroSection';
import { PopularServicesSection } from './components/landing/PopularServicesSection';
import { WhySahaayakSection } from './components/landing/WhySahaayakSection';

// Customer Components
import { CustomerSidebar } from './components/customer/CustomerSidebar';
import { CustomerDashboardOverview } from './components/customer/CustomerDashboardOverview';
import { ServiceSearchCatalog } from './components/customer/ServiceSearchCatalog';
import { CustomerBookingsList } from './components/customer/CustomerBookingsList';
import { WorkerProfileModal } from './components/customer/WorkerProfileModal';
import { BookingModal } from './components/customer/BookingModal';
import { EmergencyBookingModal } from './components/customer/EmergencyBookingModal';
import { MessagesModal } from './components/customer/MessagesModal';
import { CallModal } from './components/customer/CallModal';

// Worker Components
import { WorkerSidebar } from './components/worker/WorkerSidebar';
import { WorkerDashboardOverview } from './components/worker/WorkerDashboardOverview';
import { WorkerJobsView } from './components/worker/WorkerJobsView';
import { WorkerScheduleView } from './components/worker/WorkerScheduleView';
import { WorkerActiveJobTracker } from './components/worker/WorkerActiveJobTracker';
import { WorkerEarningsSection } from './components/worker/WorkerEarningsSection';
import { WorkerWelfareSection } from './components/worker/WorkerWelfareSection';
import { WorkerProfileView } from './components/worker/WorkerProfileView';
import { WorkerJoinModal } from './components/worker/WorkerJoinModal';

// Admin Components
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboardOverview } from './components/admin/AdminDashboardOverview';
import { AdminVerificationQueue } from './components/admin/AdminVerificationQueue';
import { AdminCooperativeSocieties } from './components/admin/AdminCooperativeSocieties';
import { AdminAnalyticsView } from './components/admin/AdminAnalyticsView';
import { AdminAIDemandForecast } from './components/admin/AdminAIDemandForecast';

function AppContent() {
  const {
    currentRole,
    activeView,
    isWorkerJoinModalOpen,
    setIsWorkerJoinModalOpen,
  } = useApp();

  // Render Customer Views
  const renderCustomerView = () => {
    switch (activeView) {
      case 'find-services':
        return <ServiceSearchCatalog />;
      case 'customer-bookings':
      case 'my-bookings':
        return <CustomerBookingsList />;
      case 'customer-dashboard':
      default:
        return <CustomerDashboardOverview />;
    }
  };

  // Render Worker Views
  const renderWorkerView = () => {
    switch (activeView) {
      case 'worker-schedule':
        return <WorkerScheduleView />;
      case 'worker-live-job':
        return <WorkerActiveJobTracker />;
      case 'worker-earnings':
        return <WorkerEarningsSection />;
      case 'worker-welfare':
        return <WorkerWelfareSection />;
      case 'worker-profile':
      case 'worker-certifications':
        return <WorkerProfileView />;
      case 'worker-jobs':
        return <WorkerJobsView initialTab="pending" />;
      case 'worker-my-jobs':
        return <WorkerJobsView initialTab="accepted" />;
      case 'worker-dashboard':
      default:
        return <WorkerDashboardOverview />;
    }
  };

  // Render Admin Views
  const renderAdminView = () => {
    switch (activeView) {
      case 'admin-verification':
        return <AdminVerificationQueue />;
      case 'admin-cooperatives':
        return <AdminCooperativeSocieties />;
      case 'admin-analytics':
        return <AdminAnalyticsView />;
      case 'admin-ai-forecast':
        return <AdminAIDemandForecast />;
      case 'admin-dashboard':
      case 'admin-overview':
      default:
        return <AdminDashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Header & Role Switcher */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'landing' ? (
          /* LANDING PAGE */
          <div>
            <HeroSection />
            <PopularServicesSection />
            <WhySahaayakSection />
          </div>
        ) : currentRole === 'customer' ? (
          /* CUSTOMER DASHBOARD WITH SIDEBAR */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
            <CustomerSidebar />
            <div className="flex-1 overflow-y-auto">
              {renderCustomerView()}
            </div>
          </div>
        ) : currentRole === 'worker' ? (
          /* WORKER DASHBOARD WITH SIDEBAR */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
            <WorkerSidebar />
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {renderWorkerView()}
            </div>
          </div>
        ) : (
          /* ADMIN DASHBOARD WITH SIDEBAR */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto bg-slate-50">
              {renderAdminView()}
            </div>
          </div>
        )}
      </main>

      {/* Global Interactive Modals */}
      <WorkerProfileModal />
      <BookingModal />
      <EmergencyBookingModal />
      <MessagesModal />
      <CallModal />
      <WorkerJoinModal
        isOpen={isWorkerJoinModalOpen}
        onClose={() => setIsWorkerJoinModalOpen(false)}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
