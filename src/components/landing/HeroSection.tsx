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
  Building2,
  Lock,
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
    workers,
    openBookingForWorker,
    t,
  } = useApp();

  const approvedWorkers = workers.filter(
    (w) =>
      w.isVerified &&
      (w.verificationStatus === 'Verified' || w.verificationStatus === 'approved') &&
      w.verificationStatus !== 'Removed' &&
      w.verificationStatus !== 'Inactive' &&
      (w as any).status !== 'removed' &&
      (w as any).status !== 'inactive'
  );

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Content & Clear Entry Options */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline / Cooperative Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
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

            {/* Clear Role-Based Entry Options */}
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-3">
                Select Your Entry Portal
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
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
            <div className="flex flex-wrap items-center gap-3 pt-1">
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
                  className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none py-2"
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

            {/* Verified Cooperative Pillars (Replacing fake stats) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 max-w-xl text-xs">
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

          {/* Right Column: Dynamic Real Worker Availability & Slot Booking */}
          <div className="lg:col-span-5">
            {approvedWorkers.length === 0 ? (
              /* Clean Empty State when 0 real verified workers exist */
              <div className="relative bg-slate-800/80 rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto shadow-md">
                  <HardHat className="w-7 h-7 text-emerald-400" />
                </div>
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300 text-[10px] font-bold">
                    <span>Live Cooperative Ledger</span>
                  </div>
                  <h3 className="text-base font-bold text-white">No Verified Workers Currently Available</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Labour cooperative workers undergo ESI welfare enrollment and NLCF background auditing before being listed. Certified workers will appear dynamically upon administrator approval.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setIsWorkerJoinModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    <HardHat className="w-4 h-4" />
                    <span>Join as a Worker / Apply for Verification</span>
                  </button>
                </div>
                <div className="pt-3 border-t border-slate-700/60 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>National Labour Cooperative Federation (NLCF DL-089)</span>
                </div>
              </div>
            ) : (
              /* Real Verified Worker Card from Supabase / Database */
              <div className="relative bg-slate-800/80 rounded-3xl border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-bold text-slate-200">
                      Verified On-Duty Worker
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Available Now
                  </span>
                </div>

                {/* Worker Profile Card */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={
                        approvedWorkers[0].avatar ||
                        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={approvedWorkers[0].name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shadow-md shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-white truncate">
                          {approvedWorkers[0].name}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-700/60">
                          ✓ {t('verified')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        {t(`service_${approvedWorkers[0].skill.replace(/[\s&]+/g, '')}`) || approvedWorkers[0].skill} Specialist
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {approvedWorkers[0].cooperativeName}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Rate</span>
                      <span className="text-base font-black text-emerald-400">
                        ₹{approvedWorkers[0].basePricePerHour}/hr
                      </span>
                    </div>
                  </div>

                  {/* Real Slots Available */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        Available Time Slots (Today)
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">1-Hour Slots</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {(approvedWorkers[0].availabilitySlots && approvedWorkers[0].availabilitySlots.length > 0
                        ? approvedWorkers[0].availabilitySlots.slice(0, 4)
                        : [
                            { id: 's1', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
                            { id: 's2', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
                            { id: 's3', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
                            { id: 's4', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
                          ]
                      ).map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-2 rounded-xl border text-center text-xs font-semibold font-mono transition-all ${
                            !slot.isBooked && slot.isAvailable
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          {slot.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      openBookingForWorker(approvedWorkers[0]);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Book Service with {approvedWorkers[0].name}</span>
                  </button>
                </div>

                {/* Cooperative Society Validation Footer */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    <span>National Labour Cooperative Federation (NLCF DL-089)</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">Zero Commission Cut</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
