import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Download,
  Info,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WorkerEarningsSection: React.FC = () => {
  const { workers, t } = useApp();
  const worker = workers[0]; // Ravi Kumar

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('week');

  const earningsData = {
    today: { gross: 1850, net: 1715, platform: 45, welfare: 90, jobs: 3 },
    week: { gross: 12450, net: 11578, platform: 250, welfare: 622, jobs: 21 },
    month: { gross: 48900, net: 45477, platform: 980, welfare: 2443, jobs: 84 },
  };

  const currentStats = earningsData[timeframe];

  // Daily breakdown bars for the week
  const weeklyDays = [
    { day: 'Mon', amount: 1800, jobs: 3 },
    { day: 'Tue', amount: 2200, jobs: 4 },
    { day: 'Wed', amount: 1450, jobs: 2 },
    { day: 'Thu', amount: 1900, jobs: 3 },
    { day: 'Fri', amount: 2400, jobs: 4 },
    { day: 'Sat', amount: 2700, jobs: 5 },
    { day: 'Sun (Today)', amount: 1850, jobs: 3 },
  ];

  const maxAmount = Math.max(...weeklyDays.map((d) => d.amount));

  const recentTransactions = [
    {
      id: 'TXN-8841',
      date: 'Today, 02:45 PM',
      customer: 'Rahul Sharma',
      service: 'Plumbing - Tap & Pipe repair',
      gross: 450,
      net: 415,
      welfareContribution: 22.5,
      status: 'Settled to Bank (IMPS)',
    },
    {
      id: 'TXN-8840',
      date: 'Today, 11:30 AM',
      customer: 'Ananya Deshmukh',
      service: 'Plumbing - Kitchen Sink Fix',
      gross: 350,
      net: 322,
      welfareContribution: 17.5,
      status: 'Settled to Bank (IMPS)',
    },
    {
      id: 'TXN-8839',
      date: 'Yesterday',
      customer: 'Vikram Joshi',
      service: 'Plumbing - Water Tank Clean',
      gross: 850,
      net: 785,
      welfareContribution: 42.5,
      status: 'Settled to Bank (IMPS)',
    },
    {
      id: 'TXN-8838',
      date: '27 Aug 2026',
      customer: 'Neha Kapoor',
      service: 'Plumbing - Geyser connection',
      gross: 550,
      net: 508,
      welfareContribution: 27.5,
      status: 'Settled to Bank (IMPS)',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('workerPortalHeader')}</span>
            <span>/</span>
            <span>{t('fairWageLedger')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('earningsWelfareLedgerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('earningsWelfareLedgerSub')}
          </p>
        </div>

        {/* Timeframe Switcher */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 self-start sm:self-auto">
          {(['today', 'week', 'month'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf === 'today' ? t('timeframeToday') : tf === 'week' ? t('timeframeWeek') : t('timeframeMonth')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Net Take Home */}
        <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-lg border border-emerald-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            {t('netTakeHomeEarnings')}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">
            ₹{currentStats.net.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-200">
            {t('transferredToBank')} <strong>*4912</strong>
          </p>
        </div>

        {/* Gross Bookings */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('totalServiceValueJobs', { count: currentStats.jobs })}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
            ₹{currentStats.gross.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('onTimeCustomerSettlement')}</span>
          </p>
        </div>

        {/* Cooperative Welfare Shield */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('cooperativeWelfareReserve')}
          </span>
          <div className="text-3xl sm:text-4xl font-black text-blue-700 font-mono">
            ₹{currentStats.welfare.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('coversFamilyHealthcare')}</span>
          </p>
        </div>
      </div>

      {/* Fair Wage Comparison vs Traditional Middleman Platforms */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-700" />
          <h3 className="text-base font-black text-emerald-950">
            {t('coopWageAdvantageTitle')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-2">
            <span className="font-bold text-emerald-800 uppercase tracking-wider text-[11px] block">
              {t('sahaayakCoopModel')}
            </span>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>{t('workerTakeHomeShare')}:</span>
                <strong className="text-emerald-700 font-bold">92.5% - 95.0%</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('coopWelfareInsurance')}:</span>
                <strong>{t('retainedForWorker')}</strong>
              </div>
              <div className="flex justify-between">
                <span>{t('platformTechMaintenance')}:</span>
                <strong>{t('flatMaintenanceCut')}</strong>
              </div>
            </div>
          </div>

          <div className="bg-white/80 p-4 rounded-2xl border border-slate-200 space-y-2 opacity-80">
            <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] block">
              {t('privateGigConglomerates')}
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>{t('workerTakeHomeShare')}:</span>
                <span className="text-red-700 font-bold">60.0% - 70.0%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('corporateCommissionCut')}:</span>
                <span className="text-red-700 font-bold">25.0% - 35.0%</span>
              </div>
              <div className="flex justify-between">
                <span>{t('workerHealthcareEsi')}:</span>
                <span>{t('zeroText')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Earnings Chart (Visual Bar Graph) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">{t('weeklyEarningsTrend')}</h3>
            <p className="text-xs text-slate-500">{t('dailyEarningsProgression')}</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
            {t('avgLabel')}: ₹2,035 / {t('day')}
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-8 border-b border-slate-100">
          {weeklyDays.map((d, i) => {
            const heightPct = Math.round((d.amount / maxAmount) * 100);
            const isToday = i === 6;

            return (
              <div key={d.day} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-700 transition-colors">
                  ₹{d.amount}
                </span>

                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all ${
                    isToday
                      ? 'bg-emerald-600 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-200 group-hover:bg-emerald-400'
                  }`}
                ></div>

                <span className="text-[10px] sm:text-xs font-bold text-slate-500 group-hover:text-slate-900 text-center">
                  {d.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Payments Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">{t('recentServicePayouts')}</h3>
          <button className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportPassbookPdf')}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4 min-w-[500px]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{tx.service}</span>
                  <span className="text-[10px] font-mono text-slate-400">#{tx.id}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('citizenLabel')}: {tx.customer} • {tx.date}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-emerald-700">
                  +₹{tx.net}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({t('grossLabel')}: ₹{tx.gross})
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">{t('settledToBank')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
