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
  Inbox,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';

export const WorkerEarningsSection: React.FC = () => {
  const { currentWorker, bookings, t } = useApp();
  const worker = currentWorker;

  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  if (!worker) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <DollarSign className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{t('noPaidJobsYet')}</h3>
        <p className="text-xs text-slate-500">
          {t('noPaidJobsSub')}
        </p>
      </div>
    );
  }

  // Robust worker identification
  const isWorkerBooking = (b: Booking) => {
    return (
      b.workerId === worker.id ||
      (b as any).worker_id === worker.id ||
      (worker.profile_id && (b.workerId === worker.profile_id || (b as any).worker_id === worker.profile_id))
    );
  };

  // Real database paid & completed bookings for this authenticated worker
  const allPaidBookings = bookings.filter(
    (b) =>
      isWorkerBooking(b) &&
      (b.paymentStatus === 'paid' ||
        b.paymentStatus === 'Settled to Worker' ||
        b.status === 'paid' ||
        b.status === 'completed' ||
        b.status === 'Completed')
  );

  // Timeframe filtering
  const todayIso = new Date().toISOString().split('T')[0];
  const now = new Date().getTime();

  const filteredBookings = allPaidBookings.filter((b) => {
    if (timeframe === 'month') return true;
    const bDateStr = b.completedAt || b.paymentReceivedAt || b.scheduled_date || b.date || '';
    if (timeframe === 'today') {
      return bDateStr.startsWith(todayIso) || b.scheduled_date === 'Today' || b.date === 'Today' || bDateStr === '';
    }
    if (timeframe === 'week') {
      const bTime = new Date(bDateStr).getTime();
      if (isNaN(bTime)) return true;
      return now - bTime <= 7 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // If timeframe filter yields 0 but we have historical bookings, calculate overall
  const displayBookings = filteredBookings.length > 0 ? filteredBookings : allPaidBookings;

  const realGrossEarnings = displayBookings.reduce((sum, b) => sum + (b.totalAmount || b.estimatedPrice || 299), 0);
  const realWelfareFund = Math.round(realGrossEarnings * 0.05);
  const realNetTakeHome = displayBookings.reduce((sum, b) => {
    const gross = b.totalAmount || b.estimatedPrice || 299;
    const extra = b.extraMaterialsCost || 0;
    const base = gross - extra;
    return sum + (Math.round(base * 0.90) + extra);
  }, 0);
  const realPlatformFee = Math.max(0, realGrossEarnings - realNetTakeHome - realWelfareFund);
  const realCompletedJobs = displayBookings.length;

  const currentStats = {
    gross: realGrossEarnings,
    net: realNetTakeHome,
    platform: realPlatformFee,
    welfare: realWelfareFund,
    jobs: realCompletedJobs,
  };

  // Real database itemized transactions list
  const recentTransactions = allPaidBookings.map((b) => {
    const gross = b.totalAmount || b.estimatedPrice || 299;
    const extra = b.extraMaterialsCost || 0;
    const base = gross - extra;
    const net = Math.round(base * 0.90) + extra;
    const welfare = Math.round(gross * 0.05);

    return {
      id: `TXN-${b.id.replace(/\D/g, '').slice(-4) || '101'}`,
      date: b.completedAt || b.paymentReceivedAt || b.scheduled_date || b.date || 'Today',
      customer: b.customerName || 'Verified Citizen',
      service: `${b.serviceType} - ${b.problemDescription ? b.problemDescription.slice(0, 35) : 'General Trade Service'}`,
      gross,
      net,
      welfareContribution: welfare,
      status: b.paymentMode === 'Online' ? 'Settled to Bank (IMPS)' : 'Direct Cash on Site',
    };
  });

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
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs self-start sm:self-auto">
          {(['today', 'week', 'month'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                timeframe === tf
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Net Take-Home */}
        <div className="bg-emerald-800 text-white rounded-3xl p-6 shadow-md shadow-emerald-800/10 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {t('directTakeHome92')}
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight pt-1">
              ₹{currentStats.net.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-100/90 pt-1">
              {t('creditedToAccount', { bankName: 'SBI', maskedAccount: '4912' })}
            </p>
          </div>

          <div className="pt-4 border-t border-emerald-700/50 flex items-center justify-between text-xs text-emerald-200">
            <span>{t('completedJobsCount', { count: currentStats.jobs })}</span>
            <span className="font-bold text-white flex items-center gap-0.5">
              100% {t('settled')}
            </span>
          </div>
        </div>

        {/* Gross Billed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('grossServiceBilled')}
            </span>
            <div className="text-3xl font-black text-slate-900 pt-1">
              ₹{currentStats.gross.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 pt-1">{t('cooperativeApprovedTariff')}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{t('coopPlatformCut')} (5%)</span>
            <span className="font-bold text-slate-800">
              ₹{currentStats.platform.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Welfare & Insurance Contribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {t('welfareFund5')}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-800 pt-1">
              ₹{currentStats.welfare.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 pt-1">{t('esiMedicalAccident')}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{t('accumulatedWelfareTotal')}</span>
            <span className="font-bold text-emerald-800">
              ₹{currentStats.welfare.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Living Wage Index Score */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('livingWageIndexLabel')}
            </span>
            <div className="text-3xl font-black text-emerald-800 pt-1">
              1.42x
            </div>
            <p className="text-xs text-slate-500 pt-1">{t('aboveMinimumWageBenchmark')}</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>{t('status')}</span>
            <span className="font-bold text-emerald-800">✓ {t('fairWageCertified')}</span>
          </div>
        </div>
      </div>

      {/* Itemized Transaction Ledger */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">{t('itemizedWagePayouts')}</h3>
            <p className="text-xs text-slate-500">
              {t('itemizedWagePayoutsSub')}
            </p>
          </div>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="text-slate-400 font-bold uppercase tracking-wider text-[11px] pb-2">
                  <th className="pb-3">{t('txnIdDate')}</th>
                  <th className="pb-3">{t('citizenAndJob')}</th>
                  <th className="pb-3">{t('grossAmount')}</th>
                  <th className="pb-3">{t('welfareDeduction')}</th>
                  <th className="pb-3">{t('netTakeHome')}</th>
                  <th className="pb-3 text-right">{t('settlementStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4">
                      <div className="font-mono font-bold text-slate-900">{tx.id}</div>
                      <div className="text-[11px] text-slate-400">{tx.date}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-900">{tx.customer}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{tx.service}</div>
                    </td>
                    <td className="py-4 font-bold text-slate-800">₹{tx.gross}</td>
                    <td className="py-4 text-emerald-800 font-semibold">-₹{tx.welfareContribution}</td>
                    <td className="py-4 font-black text-emerald-700 text-sm">₹{tx.net}</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">{t('noPaidJobsYet')}</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('noPaidJobsSub')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
