import React, { useState } from 'react';
import {
  ShieldCheck,
  Globe,
  AlertTriangle,
  User,
  HardHat,
  Building2,
  Menu,
  X,
  PhoneCall,
  Bell,
  LogOut,
  ChevronDown,
  UserPlus,
  LogIn,
  LayoutDashboard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageCode, UserRole } from '../../types';
import { WorkerNotificationPanel } from '../worker/WorkerNotificationPanel';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    language,
    setLanguage,
    openEmergencySOS,
    setIsCustomerAuthModalOpen,
    setIsAdminAuthModalOpen,
    setIsWorkerAuthModalOpen,
    setIsWorkerJoinModalOpen,
    isWorkerOnline,
    setIsWorkerOnline,
    unreadNotificationsCount,
    isWorkerNotifPanelOpen,
    setIsWorkerNotifPanelOpen,
    logout,
    t,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const languagesList: { code: LanguageCode; label: string; subLabel: string }[] = [
    { code: 'en', label: 'English', subLabel: 'EN' },
    { code: 'te', label: 'తెలుగు', subLabel: 'TEL' },
    { code: 'hi', label: 'हिन्दी', subLabel: 'HIN' },
  ];

  const handlePortalNavigate = (role: UserRole) => {
    if (!currentUser || currentUser.role !== role) {
      if (role === 'admin') {
        setIsAdminAuthModalOpen(true);
      } else if (role === 'worker') {
        setIsWorkerAuthModalOpen(true);
      } else {
        setIsCustomerAuthModalOpen(true);
      }
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
      return;
    }

    setCurrentRole(role);
    if (role === 'customer') {
      setActiveView('customer-dashboard');
    } else if (role === 'worker') {
      setActiveView('worker-dashboard');
    } else {
      setActiveView('admin-verification');
    }
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro-bar for Government / Cooperative initiative notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-semibold">
              {t('sihTag')}
            </span>
            <span className="hidden md:inline text-slate-400">
              {t('sihInitiative')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <PhoneCall className="w-3 h-3" />
              <span>{t('tollFreeHelpline')} <strong>{t('helplineNumber')}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand */}
          <div
            id="brand-logo-btn"
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-white font-black text-xl">{t('brandMonogram')}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  {t('appName')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {t('verifiedServices')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700 font-bold tracking-wider uppercase mt-0.5 hidden sm:block">
                {t('cooperativeShramikFederation')}
              </p>
            </div>
          </div>

          {/* Center Navigation / Action Portal Entry */}
          <nav className="hidden lg:flex items-center gap-2">
            <button
              id="nav-tab-landing"
              onClick={() => setActiveView('landing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-slate-100 text-slate-900 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {t('home')}
            </button>

            {/* Quick Portals Links (if logged in or exploring) */}
            {currentUser && (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => handlePortalNavigate(currentUser.role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow-xs cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    {currentUser.role === 'customer'
                      ? 'My Customer Portal'
                      : currentUser.role === 'worker'
                      ? 'My Worker Dashboard'
                      : 'Admin Desk'}
                  </span>
                </button>
              </div>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Worker Online / Offline Toggle (When logged in as worker) */}
            {currentUser?.role === 'worker' && activeView !== 'landing' && (
              <button
                id="worker-online-toggle-header"
                onClick={() => setIsWorkerOnline(!isWorkerOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isWorkerOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title={isWorkerOnline ? 'Available for new bookings' : 'Currently offline'}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {isWorkerOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isWorkerOnline ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  ></span>
                </span>
                <span>{isWorkerOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>
            )}

            {/* Worker Notification Center Bell */}
            {currentUser?.role === 'worker' && (
              <div className="relative">
                <button
                  id="worker-notification-bell-btn"
                  onClick={() => setIsWorkerNotifPanelOpen(!isWorkerNotifPanelOpen)}
                  className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                    isWorkerNotifPanelOpen
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                  title="Worker Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span
                      id="worker-unread-badge"
                      className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse"
                    >
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                <WorkerNotificationPanel
                  isOpen={isWorkerNotifPanelOpen}
                  onClose={() => setIsWorkerNotifPanelOpen(false)}
                />
              </div>
            )}

            {/* Multilingual Selector */}
            <div className="relative">
              <button
                id="lang-selector-btn"
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'en' ? 'EN' : language === 'te' ? 'TEL' : 'HIN'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                        language === lang.code ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span className="text-[10px] text-slate-400">{lang.subLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency SOS Button */}
            <button
              id="emergency-sos-top-btn"
              onClick={() => openEmergencySOS()}
              className="relative group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('emergencyService')}</span>
            </button>

            {/* AUTH ENTRY BUTTONS (If NOT Logged In) */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                {/* Customer Login Button */}
                <button
                  id="customer-login-header-btn"
                  onClick={() => setIsCustomerAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Customer Login</span>
                </button>

                {/* Join / Worker Button */}
                <button
                  id="join-worker-header-btn"
                  onClick={() => setIsWorkerJoinModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  <HardHat className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Join as Worker</span>
                </button>

                {/* Worker Sign In */}
                <button
                  id="worker-signin-header-btn"
                  onClick={() => setIsWorkerAuthModalOpen(true)}
                  className="text-slate-600 hover:text-slate-900 text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Already registered? Sign in as worker"
                >
                  Worker Login
                </button>

                {/* Admin Login Button */}
                <button
                  id="admin-login-header-btn"
                  onClick={() => setIsAdminAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  title="Cooperative Administration"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Admin</span>
                </button>
              </div>
            ) : (
              /* USER PROFILE PILL & LOGOUT (If Logged In) */
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
                >
                  <img
                    src={
                      currentUser.avatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-xl object-cover border border-emerald-400"
                  />
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-tight">
                      {currentUser.name}
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : currentUser.role === 'worker'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1 animate-in fade-in slide-in-from-top-1">
                    <div className="p-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email || currentUser.phone || 'Authenticated User'}
                      </div>
                    </div>

                    <button
                      onClick={() => handlePortalNavigate(currentUser.role)}
                      className="w-full text-left p-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      <span>
                        Go to{' '}
                        {currentUser.role === 'customer'
                          ? 'Customer Portal'
                          : currentUser.role === 'worker'
                          ? 'Worker Portal'
                          : 'Admin Desk'}
                      </span>
                    </button>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => openEmergencySOS()}
              className="p-2 rounded-xl bg-red-600 text-white text-xs font-bold"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-4 animate-in fade-in">
          {currentUser ? (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                  }
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-xl object-cover border border-emerald-400"
                />
                <div>
                  <div className="font-bold text-xs text-slate-900">{currentUser.name}</div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Mobile Role Entry Grid */
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Choose Entry Role
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setIsCustomerAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col items-center gap-1.5 text-xs font-bold"
                >
                  <User className="w-5 h-5 text-emerald-700" />
                  <span>Customer</span>
                </button>
                <button
                  onClick={() => {
                    setIsWorkerJoinModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col items-center gap-1.5 text-xs font-bold"
                >
                  <HardHat className="w-5 h-5 text-amber-700" />
                  <span>Join Worker</span>
                </button>
                <button
                  onClick={() => {
                    setIsAdminAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="p-3 rounded-2xl bg-slate-900 text-white flex flex-col items-center gap-1.5 text-xs font-bold"
                >
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          )}

          {/* Language Selector in Mobile */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{t('language')}:</span>
            <div className="flex gap-1.5">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 text-xs rounded-xl border ${
                    language === lang.code
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
