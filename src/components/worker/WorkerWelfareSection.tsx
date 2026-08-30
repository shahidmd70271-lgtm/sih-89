import React, { useState } from 'react';
import {
  HeartHandshake,
  ShieldCheck,
  Award,
  Umbrella,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WorkerWelfareSection: React.FC = () => {
  const { currentWorker, workers, bookings, t } = useApp();
  const worker = currentWorker || workers[0];

  const paidBookings = worker
    ? bookings.filter(
        (b) =>
          b.workerId === worker.id &&
          (b.paymentStatus === 'paid' ||
            b.paymentStatus === 'Settled to Worker' ||
            b.status === 'paid' ||
            b.status === 'completed' ||
            b.status === 'Completed')
      )
    : [];

  const realGrossEarnings = paidBookings.reduce((sum, b) => sum + (b.totalAmount || b.estimatedPrice || 0), 0);
  const realWelfareFund = Math.round(realGrossEarnings * 0.05);

  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const welfareBenefits = [
    {
      title: t('welfareBenefit1Title'),
      coverage: t('welfareBenefit1Cover'),
      status: t('activeAndVerified'),
      policyNo: 'NLCF-GIG-MED-2026-881',
      icon: Umbrella,
    },
    {
      title: t('welfareBenefit2Title'),
      coverage: t('welfareBenefit2Cover'),
      status: t('active'),
      policyNo: 'NLCF-TOOL-SEC-409',
      icon: ShieldCheck,
    },
    {
      title: t('welfareBenefit3Title'),
      coverage: t('welfareBenefit3Cover'),
      status: t('eligibleStatus'),
      policyNo: 'SCHOLAR-EDU-2026',
      icon: Award,
    },
    {
      title: t('welfareBenefit4Title'),
      coverage: t('welfareBenefit4Cover'),
      status: t('monthlyContributionOn'),
      policyNo: 'NPS-LITE-SHRAMIK-11',
      icon: HeartHandshake,
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('workerPortalHeader')}</span>
          <span>/</span>
          <span>{t('socialWelfareSafetyShield')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('labourWelfareTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('labourWelfareSub')}
        </p>
      </div>

      {/* Welfare Balance Highlight Banner */}
      <div className="bg-linear-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
            {t('nlcfIndia')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('personalWelfareFund')}: ₹{realWelfareFund.toLocaleString('en-IN')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {t('welfareFundDesc')}
          </p>
        </div>

        <button
          onClick={() => setClaimSubmitted(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all z-10 shrink-0 cursor-pointer"
        >
          {t('fileWelfareClaim')}
        </button>
      </div>

      {claimSubmitted && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              <strong>{t('claimRequestRegistered')} #WLF-4019:</strong> {t('welfareOfficerReview')}
            </span>
          </div>
          <button
            onClick={() => setClaimSubmitted(false)}
            className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {welfareBenefits.map((benefit, i) => {
          const Icon = benefit.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {benefit.status}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{benefit.title}</h3>
                <div className="text-sm font-extrabold text-blue-900 mt-1">
                  {t('coverLabel')}: {benefit.coverage}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {t('policyLabel')}: {benefit.policyNo}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('zeroCopayHospital')}</span>
                <button className="font-bold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer">
                  <Download className="w-3 h-3" />
                  <span>{t('cardLabel')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Skill Training & Certification Program */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t('skillCertTitle')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('skillCertSub')}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start">
            {t('tier2Shramik')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800">✓ {t('jobsCompleted')}</span>
            <h4 className="text-xs font-bold text-slate-900">
              NSDC Advanced PPR & HDPE Pipe Jointing
            </h4>
            <p className="text-[11px] text-slate-500">Issued by Skill India & NLCF (2023)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800">✓ {t('jobsCompleted')}</span>
            <h4 className="text-xs font-bold text-slate-900">
              Solar Water Heater & Geyser Installation
            </h4>
            <p className="text-[11px] text-slate-500">Certified by Delhi Labour Board (2024)</p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-2">
            <span className="text-xs font-bold text-blue-800">● {t('openForEnrollment')}</span>
            <h4 className="text-xs font-bold text-slate-900">
              Smart IoT Home Plumbing & Pressure Pumps
            </h4>
            <p className="text-[11px] text-slate-600">
              Free 2-day workshop at Pusa ITI • Starting 15 Sept
            </p>
            <button className="text-xs font-bold text-blue-700 hover:underline pt-1 cursor-pointer">
              {t('enrollForFree')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
