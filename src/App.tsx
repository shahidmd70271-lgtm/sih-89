import React, { Suspense, lazy } from 'react';
import { HardHat, Building2 } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { LoadingFallback } from './components/common/LoadingFallback';

// Landing Page Components (Eagerly loaded for instantaneous first paint)
import { HeroSection } from './components/landing/HeroSection';
import { PopularServicesSection } from './components/landing/PopularServicesSection';
import { WhySahaayakSection } from './components/landing/WhySahaayakSection';

// Auth Modals (Lazy Loaded on Demand)
const CustomerAuthModal = lazy(() => import('./components/auth/CustomerAuthModal').then(m => ({ default: m.CustomerAuthModal })));
const AdminAuthModal = lazy(() => import('./components/auth/AdminAuthModal').then(m => ({ default: m.AdminAuthModal })));
const WorkerAuthModal = lazy(() => import('./components/auth/WorkerAuthModal').then(m => ({ default: m.WorkerAuthModal })));

// Customer Components (Lazy Loaded on Demand)
const CustomerSidebar = lazy(() => import('./components/customer/CustomerSidebar').then(m => ({ default: m.CustomerSidebar })));
const CustomerDashboardOverview = lazy(() => import('./components/customer/CustomerDashboardOverview').then(m => ({ default: m.CustomerDashboardOverview })));
const ServiceSearchCatalog = lazy(() => import('./components/customer/ServiceSearchCatalog').then(m => ({ default: m.ServiceSearchCatalog })));
const CustomerBookingsList = lazy(() => import('./components/customer/CustomerBookingsList').then(m => ({ default: m.CustomerBookingsList })));
const CustomerProfileView = lazy(() => import('./components/customer/CustomerProfileView').then(m => ({ default: m.CustomerProfileView })));
const CustomerMessagesView = lazy(() => import('./components/customer/CustomerMessagesView').then(m => ({ default: m.CustomerMessagesView })));
const CustomerPaymentsView = lazy(() => import('./components/customer/CustomerPaymentsView').then(m => ({ default: m.CustomerPaymentsView })));

// Interactive Customer Modals (Lazy Loaded on Demand)
const WorkerProfileModal = lazy(() => import('./components/customer/WorkerProfileModal').then(m => ({ default: m.WorkerProfileModal })));
const BookingModal = lazy(() => import('./components/customer/BookingModal').then(m => ({ default: m.BookingModal })));
const EmergencyBookingModal = lazy(() => import('./components/customer/EmergencyBookingModal').then(m => ({ default: m.EmergencyBookingModal })));
const MessagesModal = lazy(() => import('./components/customer/MessagesModal').then(m => ({ default: m.MessagesModal })));
const CallModal = lazy(() => import('./components/customer/CallModal').then(m => ({ default: m.CallModal })));

// Worker Components (Lazy Loaded on Demand)
const WorkerSidebar = lazy(() => import('./components/worker/WorkerSidebar').then(m => ({ default: m.WorkerSidebar })));
const WorkerDashboardOverview = lazy(() => import('./components/worker/WorkerDashboardOverview').then(m => ({ default: m.WorkerDashboardOverview })));
const WorkerJobsView = lazy(() => import('./components/worker/WorkerJobsView').then(m => ({ default: m.WorkerJobsView })));
const WorkerScheduleView = lazy(() => import('./components/worker/WorkerScheduleView').then(m => ({ default: m.WorkerScheduleView })));
const WorkerActiveJobTracker = lazy(() => import('./components/worker/WorkerActiveJobTracker').then(m => ({ default: m.WorkerActiveJobTracker })));
const WorkerEarningsSection = lazy(() => import('./components/worker/WorkerEarningsSection').then(m => ({ default: m.WorkerEarningsSection })));
const WorkerWelfareSection = lazy(() => import('./components/worker/WorkerWelfareSection').then(m => ({ default: m.WorkerWelfareSection })));
const WorkerProfileView = lazy(() => import('./components/worker/WorkerProfileView').then(m => ({ default: m.WorkerProfileView })));
const WorkerJoinModal = lazy(() => import('./components/worker/WorkerJoinModal').then(m => ({ default: m.WorkerJoinModal })));

// Admin Components (Lazy Loaded on Demand)
const AdminSidebar = lazy(() => import('./components/admin/AdminSidebar').then(m => ({ default: m.AdminSidebar })));
const AdminDashboardOverview = lazy(() => import('./components/admin/AdminDashboardOverview').then(m => ({ default: m.AdminDashboardOverview })));
const AdminVerificationQueue = lazy(() => import('./components/admin/AdminVerificationQueue').then(m => ({ default: m.AdminVerificationQueue })));
const AdminCooperativeSocieties = lazy(() => import('./components/admin/AdminCooperativeSocieties').then(m => ({ default: m.AdminCooperativeSocieties })));
const AdminAnalyticsView = lazy(() => import('./components/admin/AdminAnalyticsView').then(m => ({ default: m.AdminAnalyticsView })));
const AdminAIDemandForecast = lazy(() => import('./components/admin/AdminAIDemandForecast').then(m => ({ default: m.AdminAIDemandForecast })));

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
      case 'customer-profile':
      case 'profile':
        return <CustomerProfileView />;
      case 'customer-messages':
      case 'messages':
        return <CustomerMessagesView />;
      case 'customer-payments':
      case 'fair-payments':
      case 'payments':
        return <CustomerPaymentsView />;
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
          /* LANDING PAGE (Immediate Render) */
          <div>
            <HeroSection />
            <PopularServicesSection />
            <WhySahaayakSection />
          </div>
        ) : activeView.startsWith('admin-') || currentRole === 'admin' ? (
          /* ADMIN DASHBOARD WITH SIDEBAR (Protected & Lazy Loaded) */
          isAuthorizedAdmin ? (
            <Suspense fallback={<LoadingFallback message="Loading Administration Portal..." />}>
              <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
                <AdminSidebar />
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  {renderAdminView()}
                </div>
              </div>
            </Suspense>
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
          /* WORKER DASHBOARD WITH SIDEBAR (Protected & Lazy Loaded) */
          isAuthorizedWorker ? (
            <Suspense fallback={<LoadingFallback message="Loading Labour Cooperative Worker Desk..." />}>
              <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
                <WorkerSidebar />
                <div className="flex-1 overflow-y-auto bg-slate-50">
                  {renderWorkerView()}
                </div>
              </div>
            </Suspense>
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
          /* CUSTOMER DASHBOARD WITH SIDEBAR (Lazy Loaded) */
          <Suspense fallback={<LoadingFallback message="Loading Citizen Services..." />}>
            <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
              <CustomerSidebar />
              <div className="flex-1 overflow-y-auto">
                {renderCustomerView()}
              </div>
            </div>
          </Suspense>
        )}
      </main>

      {/* Role-Based Authentication & Registration Modals (Lazy Loaded) */}
      <Suspense fallback={null}>
        {isCustomerAuthModalOpen && (
          <CustomerAuthModal
            isOpen={isCustomerAuthModalOpen}
            onClose={() => setIsCustomerAuthModalOpen(false)}
          />
        )}
        {isAdminAuthModalOpen && (
          <AdminAuthModal
            isOpen={isAdminAuthModalOpen}
            onClose={() => setIsAdminAuthModalOpen(false)}
          />
        )}
        {isWorkerAuthModalOpen && (
          <WorkerAuthModal
            isOpen={isWorkerAuthModalOpen}
            onClose={() => setIsWorkerAuthModalOpen(false)}
          />
        )}
        {isWorkerJoinModalOpen && (
          <WorkerJoinModal
            isOpen={isWorkerJoinModalOpen}
            onClose={() => setIsWorkerJoinModalOpen(false)}
          />
        )}

        {/* Global Interactive Modals */}
        <WorkerProfileModal />
        <BookingModal />
        <EmergencyBookingModal />
        <MessagesModal />
        <CallModal />
      </Suspense>

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
