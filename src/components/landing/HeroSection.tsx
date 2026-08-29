import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  HardHat,
  MapPin,
  Clock,
  Star,
  CheckCircle2,
  AlertTriangle,
  Users,
  Award,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceType } from '../../types';

export const HeroSection: React.FC = () => {
  const {
    setCurrentRole,
    setActiveView,
    setSelectedServiceFilter,
    openEmergencySOS,
    setIsWorkerJoinModalOpen,
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
    <section className="relative overflow-hidden bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-14 sm:py-20 lg:py-24 border-b border-slate-800">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline / Cooperative Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{t('labourCooperativeEmpowered')}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                {t('tagline')}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal pt-2">
                {t('heroSubtitle')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-find-service-btn"
                onClick={() => {
                  setCurrentRole('customer');
                  setActiveView('find-services');
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>{t('findService')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-join-worker-btn"
                onClick={() => setIsWorkerJoinModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              >
                <HardHat className="w-4 h-4 text-emerald-400" />
                <span>{t('joinWorker')}</span>
              </button>

              <button
                id="hero-emergency-btn"
                onClick={() => openEmergencySOS()}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-sm shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{t('emergency24x7')}</span>
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="pt-2">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-xl max-w-xl"
              >
                <div className="pl-3 pr-2 text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden py-2"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {t('search')}
                </button>
              </form>

              {/* Quick tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 text-xs text-slate-400">
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

            {/* Trust Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-xl">
              <div>
                <div className="text-2xl font-black text-white">{t('trustShramiks')}</div>
                <div className="text-xs text-slate-400">{t('trustShramiksLabel')}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">{t('trustWageRetention')}</div>
                <div className="text-xs text-slate-400">{t('trustWageLabel')}</div>
              </div>
              <div>
                <div className="text-2xl font-black text-amber-400">{t('trustAccidentCover')}</div>
                <div className="text-xs text-slate-400">{t('trustAccidentLabel')}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Worker Availability & Slot Booking Showcase */}
          <div className="lg:col-span-5">
            <div className="relative bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xl space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-200">
                    Direct Slot Booking
                  </span>
                </div>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified On-Duty
                </span>
              </div>

              {/* Worker Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src="https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80"
                    alt="Ravi Kumar"
                    className="w-13 h-13 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white truncate">Ravi Kumar</h4>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700/60">
                        ✓ {t('verified')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Master Plumber • 8 yrs exp
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>⭐ 4.9 (184 reviews)</span>
                      <span>•</span>
                      <span>📍 1.2 km away</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Rate</span>
                    <span className="text-base font-black text-emerald-400">₹299/hr</span>
                  </div>
                </div>

                {/* Available Slots Preview */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Available Time Slots (Today)
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">1-Hour Slots</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { time: '10:00 AM – 11:00 AM', status: 'available' },
                      { time: '12:00 PM – 1:00 PM', status: 'available' },
                      { time: '02:00 PM – 3:00 PM', status: 'booked' },
                      { time: '04:00 PM – 5:00 PM', status: 'available' },
                    ].map((slot, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl border text-center text-xs font-semibold font-mono transition-all ${
                          slot.status === 'available'
                            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200 hover:bg-emerald-900/60 cursor-pointer'
                            : 'bg-slate-900 border-slate-800 text-slate-500 line-through cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Choose Worker & Book Slot</span>
                </button>
              </div>

              {/* Cooperative Society Validation Footer */}
              <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  {t('guaranteedBySociety', { society: 'NLCF Society #DL-089' })}
                </span>
                <span className="text-slate-400 text-[11px]">Zero Commission Deductions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
