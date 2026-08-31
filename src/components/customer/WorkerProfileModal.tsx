import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';

export const WorkerProfileModal: React.FC = () => {
  const {
    selectedWorker,
    isWorkerProfileModalOpen,
    setIsWorkerProfileModalOpen,
    openBookingForWorker,
    reviews,
    t,
  } = useApp();

  if (!isWorkerProfileModalOpen || !selectedWorker) return null;

  // Combine worker's stored reviews with globally fetched reviews from Supabase
  const workerReviews = [
    ...reviews.filter(
      (r) => r.worker_id === selectedWorker.id || r.workerId === selectedWorker.id
    ),
    ...(selectedWorker.reviews || []).filter(
      (sr) => !reviews.some((gr) => (gr.booking_id && gr.booking_id === sr.id) || gr.id === sr.id)
    ),
  ];

  const totalRatingSum = workerReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0);
  const calculatedAvgRating = workerReviews.length > 0
    ? (totalRatingSum / workerReviews.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150 font-sans">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-8">
        {/* Modal Close Button */}
        <button
          onClick={() => setIsWorkerProfileModalOpen(false)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Profile Header */}
        <div className="bg-linear-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-t-3xl relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={selectedWorker.avatar}
                alt={selectedWorker.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-4 border-white/20 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black">{selectedWorker.name}</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  {selectedWorker.skill}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-emerald-200 font-semibold">
                <ServiceIcon name={selectedWorker.skill} className="w-4 h-4 text-emerald-300" />
                <span>{t(`service_${selectedWorker.skill.replace(/[\s&]+/g, '')}`) || selectedWorker.skill}</span>
                <span>•</span>
                <span>{t('yearsExp', { years: selectedWorker.experienceYears })}</span>
              </div>

              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {selectedWorker.location} ({t('distanceAwayText', { distance: selectedWorker.distanceKm })})
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Core Stats Bar */}
        <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 p-4 text-center">
          <div>
            {calculatedAvgRating ? (
              <>
                <div className="flex items-center justify-center gap-1 text-sm font-extrabold text-amber-900">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{calculatedAvgRating}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {workerReviews.length} {workerReviews.length === 1 ? 'review' : t('reviews')}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-700">No reviews yet</div>
                <div className="text-[10px] text-slate-400 font-medium">Newly Verified</div>
              </>
            )}
          </div>

          <div className="border-l border-slate-200">
            <div className="text-sm font-extrabold text-slate-900">
              {selectedWorker.completedJobs}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{t('jobsCompleted')}</div>
          </div>

          <div className="border-l border-slate-200">
            <div className="text-sm font-extrabold text-emerald-700">
              ₹{selectedWorker.basePricePerHour}
            </div>
            <div className="text-[10px] text-slate-500 font-medium">{t('standardWagePerHour')}</div>
          </div>

          <div className="border-l border-slate-200">
            <div className="text-sm font-extrabold text-slate-900">₹5 Lakh</div>
            <div className="text-[10px] text-slate-500 font-medium">{t('esiInsurance')}</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Bio */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('aboutTheShramik')}
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">{selectedWorker.bio}</p>
          </div>

          {/* Cooperative & Certification Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('societyAndCerts')}
            </h4>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-900">
                    {selectedWorker.cooperativeName}
                  </h5>
                  <p className="text-[11px] text-slate-500">
                    Affiliated Cooperative Society • ID: {selectedWorker.cooperativeId}
                  </p>
                </div>
              </div>

              {selectedWorker.certifications && selectedWorker.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1 border-t border-emerald-200/60">
                  {selectedWorker.certifications.map((c) => (
                    <span
                      key={c.id}
                      className="text-[10px] font-semibold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {c.title} ({c.issuingBody}, {c.year})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Working Hours & Languages */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                {t('workingHoursLabel')}
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>{selectedWorker.workingHours}</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-400 block mb-1">
                {t('languagesSpokenLabel')}
              </span>
              <div className="text-xs font-bold text-slate-800">
                {selectedWorker.languages.join(', ')}
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('customerReviews')} ({workerReviews.length})
              </h4>
              {calculatedAvgRating && (
                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ⭐ {calculatedAvgRating} / 5.0
                </span>
              )}
            </div>

            {workerReviews.length > 0 ? (
              <div className="space-y-3">
                {workerReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {rev.customerName || 'Verified Citizen'}
                        </span>
                        {rev.customerLocation && (
                          <span className="text-[10px] text-slate-500">
                            ({rev.customerLocation})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400">{rev.date}</span>
                      </div>
                    </div>
                    {(rev.feedback || rev.comment) && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rev.feedback || rev.comment}
                      </p>
                    )}
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('verifiedCooperativeServiceBooking')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                {t('newlyVerifiedNoReviews')}
              </p>
            )}
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">
              {t('standardCooperativeRate')}
            </span>
            <span className="text-xl font-black text-slate-900">
              ₹{selectedWorker.basePricePerHour}
              <span className="text-xs font-semibold text-slate-500">/hr</span>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                setIsWorkerProfileModalOpen(false);
                openBookingForWorker(selectedWorker, true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{t('emergencySOS')}</span>
            </button>
            <button
              onClick={() => {
                setIsWorkerProfileModalOpen(false);
                openBookingForWorker(selectedWorker, false);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('bookServiceNow')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
