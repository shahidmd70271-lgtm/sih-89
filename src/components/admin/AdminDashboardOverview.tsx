import React from 'react';
import {
  Users,
  CheckCircle2,
  Building2,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  FileCheck,
  Activity,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COOPERATIVE_SOCIETIES } from '../../data/mockData';

export const AdminDashboardOverview: React.FC = () => {
  const { workers, approveWorkerVerification, rejectWorkerVerification, setActiveView, t } = useApp();

  const pendingWorkers = workers.filter((w) => !w.isVerified && w.verificationStatus !== 'Rejected');
  const verifiedCount = workers.filter((w) => w.isVerified).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{t('govtRegulatoryDashboard')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('nationalCoopOperationsHub')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('nationalCoopOperationsSub')}
          </p>
        </div>

        <button
          onClick={() => setActiveView('admin-ai-forecast')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('launchAiDemandForecast')}</span>
        </button>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Verified Workers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('verifiedWorkersMetric')}
            </span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">1,842</div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-1">
            {t('verifiedThisWeek', { count: 18 })}
          </div>
        </div>

        {/* Active Jobs Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('activeJobsTodayMetric')}
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900">326</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {t('onTimeDispatchRate')}
          </div>
        </div>

        {/* Total Cooperative Societies */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('cooperativeSocietiesLabel')}
            </span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">48</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">{t('acrossStates', { count: 6 })}</div>
        </div>

        {/* Total Wages Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('wagesDisbursedMetric')}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹1.42 Cr</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">{t('directImpsToShramiks')}</div>
        </div>

        {/* Welfare Fund Reserve */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {t('welfareReserveMetric')}
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">₹18.4 L</div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">{t('fivePercentCessAccumulation')}</div>
        </div>
      </div>

      {/* Pending Approvals Notice Banner */}
      {pendingWorkers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-950">
                {t('workerDossiersAwaitingAudit', { count: pendingWorkers.length })}
              </h3>
              <p className="text-xs text-amber-800">
                {t('workerDossiersSub')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView('admin-verification')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {t('openVerificationQueue')}
          </button>
        </div>
      )}

      {/* Cooperatives Performance Snapshot Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t('affiliatedLabourCoops')}
            </h3>
            <p className="text-xs text-slate-500">{t('activeRegionalUnions')}</p>
          </div>

          <button
            onClick={() => setActiveView('admin-cooperatives')}
            className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{t('viewAllCooperatives', { count: 48 })}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {COOPERATIVE_SOCIETIES.map((coop) => (
            <div key={coop.id} className="py-4 flex items-center justify-between gap-4 min-w-[600px]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{coop.name}</span>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {t('regLabel')}: {coop.registrationNumber}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {coop.location}, {coop.state} • {t('formedIn')} {coop.establishedYear} • {t('contactLabel')}: {coop.contactPhone}
                </p>
              </div>

              <div className="flex items-center gap-6 text-xs text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('enrolledWorkers')}</span>
                  <strong className="text-slate-900 font-bold">{coop.memberCount} {t('shramiks')}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">{t('completedGigsLabel')}</span>
                  <strong className="text-emerald-700 font-bold">{coop.completedJobsTotal}</strong>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 block">{t('trustScore')}</span>
                  <strong className="text-amber-900 font-bold">⭐ {coop.rating}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
