import React, { useState } from 'react';
import { HardHat, Building2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Auth Modals
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { WorkerAuthModal } from './components/auth/WorkerAuthModal';

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
    currentUser,
    currentRole,
    activeView,
    isWorkerJoinModalOpen,
    setIsWorkerJoinModalOpen,
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    isAdminAuthModalOpen,
    setIsAdminAuthModalOpen,
    isWorkerAuthModalOpen,
    setIsWorkerAuthModalOpen,
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

  const isAuthorizedAdmin = currentUser?.role === 'admin';
  const isAuthorizedWorker =
    currentUser?.role === 'worker' &&
    (currentUser?.workerStatus === 'Verified' || currentUser?.workerStatus === 'approved');

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
        ) : activeView.startsWith('admin-') || currentRole === 'admin' ? (
          /* ADMIN DASHBOARD WITH SIDEBAR (Protected) */
          isAuthorizedAdmin ? (
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
              <AdminSidebar />
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {renderAdminView()}
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-lg mx-auto my-16 bg-white rounded-3xl border border-red-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Restricted Administrator Portal</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are not authorized to access the administrator portal. Official NLCF verification officer authentication is required.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsAdminAuthModalOpen(true)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Administrator Sign In
                </button>
              </div>
            </div>
          )
        ) : activeView.startsWith('worker-') || currentRole === 'worker' ? (
          /* WORKER DASHBOARD WITH SIDEBAR (Protected) */
          isAuthorizedWorker ? (
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
              <WorkerSidebar />
              <div className="flex-1 overflow-y-auto bg-slate-50">
                {renderWorkerView()}
              </div>
            </div>
          ) : (
            <div className="p-8 max-w-lg mx-auto my-16 bg-white rounded-3xl border border-amber-200 shadow-xl text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <HardHat className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Worker Portal Verification Required</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access to the active worker control desk is reserved for approved Labour Cooperative tradespersons with valid authenticated credentials.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsWorkerAuthModalOpen(true)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Sign In as Worker
                </button>
                <button
                  onClick={() => setIsWorkerJoinModalOpen(true)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Join as Worker
                </button>
              </div>
            </div>
          )
        ) : (
          /* CUSTOMER DASHBOARD WITH SIDEBAR */
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
            <CustomerSidebar />
            <div className="flex-1 overflow-y-auto">
              {renderCustomerView()}
            </div>
          </div>
        )}
      </main>

      {/* Role-Based Authentication & Registration Modals */}
      <CustomerAuthModal
        isOpen={isCustomerAuthModalOpen}
        onClose={() => setIsCustomerAuthModalOpen(false)}
      />
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
      />
      <WorkerAuthModal
        isOpen={isWorkerAuthModalOpen}
        onClose={() => setIsWorkerAuthModalOpen(false)}
      />

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
