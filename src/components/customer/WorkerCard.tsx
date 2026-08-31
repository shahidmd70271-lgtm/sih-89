import React from 'react';
import {
  Star,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Briefcase,
} from 'lucide-react';
import { Worker } from '../../types';
import { ServiceIcon } from '../common/ServiceIcon';
import { useApp } from '../../context/AppContext';

interface WorkerCardProps {
  worker: Worker;
  layout?: 'grid' | 'list';
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, layout = 'grid' }) => {
  const { openBookingForWorker, openWorkerProfile, t } = useApp();

  const skillKey = `service_${worker.skill.replace(/[\s&]+/g, '')}`;
  const translatedSkill = t(skillKey);
  const isAvailableNow = worker.availability === 'Available Now';
  const availabilityText =
    worker.availability === 'Available Now'
      ? t('availableNow')
      : worker.availability === 'Available Today'
      ? t('availableToday')
      : t('busy');

  if (layout === 'list') {
    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
          <div className="relative shrink-0">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
            />
            {worker.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs" title={t('verifiedBadge')}>
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-800 truncate">{worker.name}</h4>
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tight">
                {t('verifiedSocietyMember')}
              </span>
            </div>

            <p className="text-xs text-slate-500 truncate">
              {translatedSkill} • {t('yearsExp', { years: worker.experienceYears })} • {worker.cooperativeName}
            </p>

            <div className="flex items-center gap-3 sm:gap-4 mt-2 text-xs font-semibold">
              <span className="text-amber-500 flex items-center gap-0.5">
                ★ {worker.rating} <span className="text-slate-400 font-normal text-[10px]">({worker.reviewsCount})</span>
              </span>
              <span className="text-slate-400">{t('distanceAwayText', { distance: worker.distanceKm })}</span>
              <span className={isAvailableNow ? 'text-emerald-600' : 'text-slate-400'}>
                {isAvailableNow ? `● ${t('availableNow')}` : `○ ${t('busy')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Rating, Price & Action */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 gap-2 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">₹{worker.basePricePerHour} <span className="text-xs font-normal text-slate-500">/hr</span></p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openWorkerProfile(worker)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              {t('profileBtn')}
            </button>
            <button
              onClick={() => openBookingForWorker(worker)}
              className="bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold transition-colors cursor-pointer shadow-xs"
            >
              {t('bookNow')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default Grid Layout
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-400 transition-all duration-200 p-5 flex flex-col justify-between group">
      <div>
        {/* Top: Avatar, Badges & Rating */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="relative">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
            />
            {worker.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-xs"
                title={t('verifiedBadge')}
              >
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {worker.reviewsCount && worker.reviewsCount > 0 ? (
              <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{Number(worker.rating || worker.safetyRating || 5.0).toFixed(1)}</span>
                <span className="text-slate-500 font-normal text-[10px]">
                  ({worker.reviewsCount} {worker.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200">
                <span>No reviews yet</span>
              </div>
            )}

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight flex items-center gap-1 ${
                isAvailableNow
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isAvailableNow ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              ></span>
              {availabilityText}
            </span>
          </div>
        </div>

        {/* Worker Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <h4 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
              {worker.name}
            </h4>
            <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight">
              {t('verified')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
            <ServiceIcon name={worker.skill} className="w-3.5 h-3.5 text-emerald-600" />
            <span>{translatedSkill}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{worker.experienceYears} yrs {t('experience')}</span>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{t('distanceAwayText', { distance: worker.distanceKm })} ({worker.location.split(',')[0]})</span>
          </p>

          <p className="text-[11px] text-slate-400 font-medium truncate pt-0.5">
            🏛️ {worker.cooperativeName}
          </p>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">{t('standardWage')}</span>
            <span className="text-sm font-bold text-slate-800">
              ₹{worker.basePricePerHour}
              <span className="text-xs font-normal text-slate-500"> /hr</span>
            </span>
          </div>

          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase tracking-tight border border-emerald-100">
            {t('insuranceCoveredShort')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => openWorkerProfile(worker)}
            className="w-full py-2 px-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center cursor-pointer"
          >
            {t('profileBtn')}
          </button>
          <button
            onClick={() => openBookingForWorker(worker)}
            className="w-full py-2 px-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg shadow-xs transition-colors text-center cursor-pointer"
          >
            {t('bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
};
