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
  Compass,
  PhoneCall,
  Sparkles,
  Bell,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LanguageCode, UserRole } from '../../types';
import { WorkerNotificationPanel } from '../worker/WorkerNotificationPanel';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    activeView,
    setActiveView,
    language,
    setLanguage,
    openEmergencySOS,
    setIsWorkerJoinModalOpen,
    isWorkerOnline,
    setIsWorkerOnline,
    unreadNotificationsCount,
    isWorkerNotifPanelOpen,
    setIsWorkerNotifPanelOpen,
    t,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const languagesList: { code: LanguageCode; label: string; subLabel: string }[] = [
    { code: 'en', label: 'English', subLabel: 'EN' },
    { code: 'te', label: 'తెలుగు', subLabel: 'TEL' },
    { code: 'hi', label: 'हिन्दी', subLabel: 'HIN' },
  ];

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'customer') {
      setActiveView('customer-dashboard');
    } else if (role === 'worker') {
      setActiveView('worker-dashboard');
    } else {
      setActiveView('admin-overview');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top micro-bar for Government / Cooperative initiative notice */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 max-w-6xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-medium">
              {t('sihTag')}
            </span>
            <span className="hidden md:inline text-slate-400">
              {t('sihInitiative')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1 text-amber-400">
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
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform shrink-0">
              <span className="text-white font-black text-xl">{t('brandMonogram')}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-800">
                  {t('appName')}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                  {t('verifiedServices')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600 font-semibold tracking-wider uppercase mt-0.5 hidden sm:block">
                {t('cooperativeShramikFederation')}
              </p>
            </div>
          </div>

          {/* Center Navigation / Role Switcher Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-tab-landing"
              onClick={() => setActiveView('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeView === 'landing'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('home')}
            </button>
            <button
              id="nav-tab-customer"
              onClick={() => handleRoleChange('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'customer' && activeView !== 'landing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{t('customerPortal')}</span>
            </button>
            <button
              id="nav-tab-worker"
              onClick={() => handleRoleChange('worker')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'worker' && activeView !== 'landing'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <HardHat className="w-3.5 h-3.5" />
              <span>{t('workerPortal')}</span>
            </button>
            <button
              id="nav-tab-admin"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentRole === 'admin' && activeView !== 'landing'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('cooperativeAdmin')}</span>
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Worker Online / Offline Toggle when in worker role */}
            {currentRole === 'worker' && (
              <button
                id="worker-online-toggle-header"
                onClick={() => setIsWorkerOnline(!isWorkerOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isWorkerOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
                title={isWorkerOnline ? 'Available for new service requests' : 'Currently offline'}
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

            {/* Worker Notification Center Bell Icon */}
            {currentRole === 'worker' && (
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === 'en' ? 'English' : language === 'te' ? 'తెలుగు' : 'हिन्दी'}
                </span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1">
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
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
              className="relative group flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('emergencyService')}</span>
            </button>

            {/* Join as worker button (if not already worker role) */}
            {currentRole !== 'worker' && (
              <button
                id="join-worker-header-btn"
                onClick={() => setIsWorkerJoinModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <HardHat className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('joinWorker')}</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="mobile-emergency-btn"
              onClick={() => openEmergencySOS()}
              className="p-2 rounded-lg bg-red-600 text-white text-xs font-bold"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleRoleChange('customer')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border ${
                currentRole === 'customer' && activeView !== 'landing'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t('customer')}</span>
            </button>
            <button
              onClick={() => handleRoleChange('worker')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border ${
                currentRole === 'worker'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <HardHat className="w-4 h-4" />
              <span>{t('worker')}</span>
            </button>
            <button
              onClick={() => handleRoleChange('admin')}
              className={`p-2.5 rounded-xl text-xs font-bold flex flex-col items-center gap-1 border ${
                currentRole === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('coopAdmin')}</span>
            </button>
          </div>

          {currentRole === 'worker' && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsWorkerOnline(!isWorkerOnline)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  isWorkerOnline
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-300'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isWorkerOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span>Worker Status: {isWorkerOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>

              <button
                onClick={() => {
                  setIsWorkerNotifPanelOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notifications ({unreadNotificationsCount})</span>
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t('language')}:</span>
            <div className="flex gap-1.5">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-2.5 py-1 text-xs rounded-lg border ${
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

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => {
                setActiveView('landing');
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 text-center"
            >
              {t('home')}
            </button>
            <button
              onClick={() => {
                setIsWorkerJoinModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 text-center"
            >
              {t('joinWorker')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
