import React from 'react';
import {
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAnalyticsView: React.FC = () => {
  const { t } = useApp();

  const tradeBreakdown = [
    { tradeKey: 'service_Plumber', tradeFallback: 'Plumbing', gigs: 1420, percent: 34, growth: '+14%' },
    { tradeKey: 'service_Electrician', tradeFallback: 'Electrical', gigs: 1180, percent: 28, growth: '+22%' },
    { tradeKey: 'service_Carpentry', tradeFallback: 'Carpentry', gigs: 620, percent: 15, growth: '+8%' },
    { tradeKey: 'service_Painter', tradeFallback: 'Painting', gigs: 410, percent: 10, growth: '+5%' },
    { tradeKey: 'service_ApplianceRepair', tradeFallback: 'Appliance Repair', gigs: 340, percent: 8, growth: '+18%' },
    { tradeKey: 'trade_Others', tradeFallback: 'Others (Cleaning/Locksmith)', gigs: 210, percent: 5, growth: '+12%' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('centralAdminDesk')}</span>
            <span>/</span>
            <span>{t('nationalAnalyticsImpact')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('cooperativeEcosystemGrowthTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('realtimeInsightsSub')}
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Download className="w-4 h-4" />
          <span>{t('exportMinistryReportBtn')}</span>
        </button>
      </div>

      {/* Impact Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('avgShramikMonthlyIncome')}
          </span>
          <div className="text-3xl font-black text-slate-900 font-mono">₹44,200</div>
          <p className="text-xs text-emerald-600 font-semibold">
            {t('higherThanInformalMarket')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Verified Service Success
          </span>
          <div className="text-3xl font-black text-emerald-800 font-mono">98.6%</div>
          <p className="text-xs text-slate-500">Successful cooperative bookings</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {t('commissionsSaved')}
          </span>
          <div className="text-3xl font-black text-emerald-700 font-mono">₹42.8 Lakhs</div>
          <p className="text-xs text-slate-500">{t('retainedWithinWelfare')}</p>
        </div>
      </div>

      {/* Trade Demand Breakdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-lg font-black text-slate-900">{t('serviceCategoryUtilization')}</h3>

        <div className="space-y-4">
          {tradeBreakdown.map((item) => (
            <div key={item.tradeFallback} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-2">
                  <span>{t(item.tradeKey) || item.tradeFallback}</span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {item.growth}
                  </span>
                </span>
                <span className="text-slate-600 font-mono">
                  {item.gigs} {t('completedGigsLabel').toLowerCase()} ({item.percent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${item.percent}%` }}
                  className="h-full bg-emerald-600 rounded-full"
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
