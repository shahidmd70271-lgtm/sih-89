import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  CalendarCheck,
  CheckCircle,
  Filter,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { ServiceIcon } from '../common/ServiceIcon';
import { WorkerCard } from './WorkerCard';
import { ServiceType } from '../../types';

export const CustomerDashboardOverview: React.FC = () => {
  const {
    workers,
    activeBooking,
    setActiveView,
    setSelectedServiceFilter,
    openEmergencySOS,
    t,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Filter nearby available verified workers
  const nearbyWorkers = workers
    .filter((w) => w.isVerified)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 4);

  const handleCategoryClick = (category: ServiceType) => {
    setSelectedServiceFilter(category);
    setActiveView('find-services');
  };

  const getCategoryTheme = (idx: number) => {
    const themes = [
      { bg: 'bg-blue-50', text: 'text-blue-600' },
      { bg: 'bg-yellow-50', text: 'text-yellow-600' },
      { bg: 'bg-purple-50', text: 'text-purple-600' },
      { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    ];
    return themes[idx % themes.length];
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans">
      {/* Category Grid with Geometric Icon Blocks */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SERVICE_CATEGORIES.slice(0, 4).map((cat, idx) => {
          const theme = getCategoryTheme(idx);
          const serviceKey = `service_${cat.id.replace(/[\s&]+/g, '')}`;
          const catTitle = t(serviceKey);
          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 ${theme.bg} rounded-xl flex items-center justify-center ${theme.text} font-bold shrink-0 group-hover:scale-105 transition-transform`}>
                <ServiceIcon name={cat.id} className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                  {catTitle}
                </p>
                <p className="text-xs text-slate-400 font-medium truncate">
                  {t('activeWorkersAvailable', { count: cat.activeWorkers })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Split: Left (Workers/Bookings) & Right (Active Booking & Slot Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Nearby Verified Workers */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {t('availableSocietyWorkers')}
              </h2>
              <p className="text-xs text-slate-400">
                {t('nearbyVerifiedSub')}
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedServiceFilter('All');
                setActiveView('find-services');
              }}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('viewAllCount', { count: workers.length })}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {nearbyWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} layout="list" />
            ))}
          </div>

          {/* Quick CTA to see full catalog */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-slate-600">
                {t('lookingForMoreTrades')}
              </p>
            </div>
            <button
              onClick={() => setActiveView('find-services')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {t('exploreTradesBtn')}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Scheduled Service Booking Card + AI Demand Forecast */}
        <div className="space-y-6">
          {/* Active Scheduled Booking Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                Scheduled Appointment
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                {activeBooking ? activeBooking.status : 'Confirmed Slot'}
              </span>
            </div>

            {activeBooking ? (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeBooking.workerAvatar}
                    alt={activeBooking.workerName}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-400 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {activeBooking.workerName}
                    </h4>
                    <p className="text-xs text-emerald-700 font-medium truncate">
                      {activeBooking.workerSkill} • {activeBooking.cooperativeName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200/60">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">DATE</span>
                    <span className="font-bold text-slate-800">{activeBooking.date}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">TIME SLOT</span>
                    <span className="font-bold text-emerald-900">{activeBooking.timeSlot}</span>
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Start OTP</span>
                    <span className="text-base font-mono font-black text-emerald-900">{activeBooking.otpCode}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">₹{activeBooking.totalAmount} in Escrow</span>
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Active Service Slot Right Now</h4>
                <p className="text-[11px] text-slate-500">
                  Book certified cooperative workers for convenient 1-hour service slots.
                </p>
              </div>
            )}

            <button
              onClick={() => setActiveView('my-bookings')}
              className="w-full text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>{t('navMyBookings')}</span>
            </button>
          </div>

          {/* AI Demand Forecast Widget (Cooperative Intelligence) */}
          <div className="bg-emerald-900 rounded-2xl p-5 flex flex-col justify-between text-white overflow-hidden relative shadow-lg">
            <div className="relative z-10">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">
                {t('aiCooperativeIntelligence')}
              </span>
              <h3 className="font-bold text-sm text-white mb-1">
                {t('highDemandTitle')}
              </h3>
              <p className="text-xs text-emerald-200/90 leading-relaxed">
                {t('highDemandDesc')}
              </p>
            </div>

            {/* Geometric Bars Graphic */}
            <div className="mt-4 pt-3 border-t border-emerald-800 flex items-end justify-between h-14 relative z-10">
              <div className="w-4 bg-emerald-800 rounded-xs h-6"></div>
              <div className="w-4 bg-emerald-800 rounded-xs h-8"></div>
              <div className="w-4 bg-emerald-700 rounded-xs h-10"></div>
              <div className="w-4 bg-emerald-400 rounded-xs h-14"></div>
              <div className="w-4 bg-emerald-500 rounded-xs h-12"></div>
              <div className="w-4 bg-emerald-800 rounded-xs h-7"></div>
              <div className="w-4 bg-emerald-800 rounded-xs h-9"></div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-300 relative z-10">
              <span>{t('fairWageIndexStat')}</span>
              <button
                onClick={() => setActiveView('admin-ai-forecast')}
                className="underline text-white font-semibold hover:text-emerald-200 cursor-pointer"
              >
                {t('viewAnalyticsBtn')}
              </button>
            </div>

            <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-700/20 rounded-full blur-xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

