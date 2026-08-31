import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  HardHat,
  AlertTriangle,
  Award,
  Building2,
  HeartHandshake,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceType } from '../../types';

export const HeroSection: React.FC = () => {
  const {
    setCurrentRole,
    setActiveView,
    setSelectedServiceFilter,
    openEmergencySOS,
    setIsCustomerAuthModalOpen,
    setIsWorkerJoinModalOpen,
    setIsAdminAuthModalOpen,
    setIsWorkerAuthModalOpen,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentRole('customer');
    setActiveView('find-services');
  };

  const handleQuickTagClick = (service: ServiceType) => {
    setSelectedServiceFilter(service);
    setCurrentRole('customer');
    setActiveView('find-services');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 lg:py-24 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center space-y-7">
        {/* Tagline / Cooperative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('labourCooperativeEmpowered')}</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl mx-auto">
            {t('tagline')}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>

        {/* Clear Role-Based Entry Options */}
        <div className="w-full max-w-2xl pt-2">
          <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-3 text-center">
            Select Your Entry Portal
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Customer Entry */}
            <button
              id="hero-customer-entry-btn"
              onClick={() => setIsCustomerAuthModalOpen(true)}
              className="flex flex-col items-start p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/25 transform hover:-translate-y-0.5 cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-700/80 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black block">Customer Login</span>
              <span className="text-[11px] text-emerald-100 mt-0.5">Book certified trade services</span>
            </button>

            {/* 2. Worker Entry */}
            <button
              id="hero-worker-entry-btn"
              onClick={() => setIsWorkerJoinModalOpen(true)}
              className="flex flex-col items-start p-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-emerald-500/50 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <HardHat className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-black block">Join as Worker</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Apply for verification</span>
            </button>

            {/* 3. Admin Entry */}
            <button
              id="hero-admin-entry-btn"
              onClick={() => setIsAdminAuthModalOpen(true)}
              className="flex flex-col items-start p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white border border-slate-800 hover:border-purple-500/40 transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer text-left group"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm font-black block">Admin Login</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Society verification desk</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            id="hero-find-service-btn"
            onClick={() => {
              setCurrentRole('customer');
              setActiveView('find-services');
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <span>{t('findService')}</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            id="hero-worker-login-link-btn"
            onClick={() => setIsWorkerAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/60 transition-all cursor-pointer"
          >
            <span>Registered Worker Sign In</span>
          </button>

          <button
            id="hero-emergency-btn"
            onClick={() => openEmergencySOS()}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('emergency24x7')}</span>
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="w-full max-w-2xl pt-1">
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-xl w-full"
          >
            <div className="pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-2"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {t('search')}
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-3 text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">{t('popular')}</span>
            {(['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Appliance Repair'] as ServiceType[]).map((st) => (
              <button
                key={st}
                onClick={() => handleQuickTagClick(st)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-300 text-[11px] transition-colors border border-slate-700/60 cursor-pointer"
              >
                {t(`service_${st.replace(/\s+/g, '')}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Cooperative Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 w-full max-w-2xl text-left">
          <div className="space-y-1">
            <div className="font-black text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NLCF Verified</span>
            </div>
            <div className="text-[11px] text-slate-400">Attested by registered labour societies</div>
          </div>
          <div className="space-y-1">
            <div className="font-black text-emerald-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Fair Wages</span>
            </div>
            <div className="text-[11px] text-slate-400">Direct take-home without middleman cut</div>
          </div>
          <div className="space-y-1">
            <div className="font-black text-amber-400 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4" />
              <span>ESI & Welfare</span>
            </div>
            <div className="text-[11px] text-slate-400">Accident cover and pension cess fund</div>
          </div>
        </div>
      </div>
    </section>
  );
};
