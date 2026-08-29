import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  BrainCircuit,
  Zap,
  Droplet,
  Sun,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminAIDemandForecast: React.FC = () => {
  const { t } = useApp();
  const [forecastHorizon, setForecastHorizon] = useState<'48h' | '7d' | '30d'>('48h');
  const [selectedZone, setSelectedZone] = useState('South Urban Zone');
  const [isMobilizing, setIsMobilizing] = useState(false);
  const [mobilizedSuccess, setMobilizedSuccess] = useState(false);

  const forecastData = [
    {
      tradeKey: 'service_Electrician',
      tradeFallback: 'Electricians',
      predictedSurge: '+35%',
      severity: 'high',
      reasonKey: 'electricianForecastReason',
      reasonFallback: 'Predicted heatwave & AC transformer surge over the weekend',
      activeWorkersAvailable: 42,
      recommendedCapacity: 60,
      shortage: 18,
    },
    {
      tradeKey: 'service_Plumber',
      tradeFallback: 'Plumbers',
      predictedSurge: '+28%',
      severity: 'high',
      reasonKey: 'plumberForecastReason',
      reasonFallback: 'Municipal pipeline pressure maintenance scheduled in South Zone',
      activeWorkersAvailable: 35,
      recommendedCapacity: 48,
      shortage: 13,
    },
    {
      tradeKey: 'service_ApplianceRepair',
      tradeFallback: 'Appliance Repair',
      predictedSurge: '+19%',
      severity: 'medium',
      reasonKey: 'applianceForecastReason',
      reasonFallback: 'Seasonal refrigerator & geyser breakdown frequency',
      activeWorkersAvailable: 28,
      recommendedCapacity: 34,
      shortage: 6,
    },
    {
      tradeKey: 'service_Carpentry',
      tradeFallback: 'Carpentry',
      predictedSurge: '+6%',
      severity: 'low',
      reasonKey: 'carpentryForecastReason',
      reasonFallback: 'Stable baseline residential maintenance',
      activeWorkersAvailable: 24,
      recommendedCapacity: 25,
      shortage: 1,
    },
  ];

  const handleMobilize = () => {
    setIsMobilizing(true);
    setTimeout(() => {
      setIsMobilizing(false);
      setMobilizedSuccess(true);
    }, 1200);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('centralAdminDesk')}</span>
            <span>/</span>
            <span>{t('predictiveIntelligence')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <span>{t('aiPredictiveDemandTitle')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('aiPredictiveDemandSub')}
          </p>
        </div>

        {/* Horizon toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 self-start sm:self-auto">
          {(['48h', '7d', '30d'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setForecastHorizon(h)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                forecastHorizon === h
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {h === '48h' ? t('next48Hours') : h === '7d' ? t('sevenDayTrend') : t('monthlyModel')}
            </button>
          ))}
        </div>
      </div>

      {/* AI Key Insight Callout Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>{t('aiDispatchEngineActive')}</span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {t('modelConfidenceText')}
          </span>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {t('upcomingPeakDemandHeadline')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('upcomingPeakDemandDesc')}
          </p>
        </div>

        {/* Actionable Dispatch Button */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleMobilize}
            disabled={isMobilizing || mobilizedSuccess}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:bg-emerald-700 disabled:text-slate-300"
          >
            {isMobilizing ? (
              <span>{t('broadcastingMobilization')}</span>
            ) : mobilizedSuccess ? (
              <span>{t('mobilizedSuccessNotice')}</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>{t('autoRebalanceMobilizeBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trade-by-Trade Surge Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {forecastData.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">
                  {t(item.tradeKey) || item.tradeFallback}
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    item.severity === 'high'
                      ? 'bg-red-100 text-red-800'
                      : item.severity === 'medium'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.predictedSurge} {t('surgeLabel')}
                </span>
              </div>

              <span className="text-xs font-bold text-slate-500">
                {t('shortageRiskLabel')}{' '}
                <strong className={item.shortage > 10 ? 'text-red-600' : 'text-slate-800'}>
                  -{item.shortage} {t('shramiks')}
                </strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              💡 {t(item.reasonKey) || item.reasonFallback}
            </p>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>{t('availableOnDuty', { count: item.activeWorkersAvailable })}</span>
                <span>{t('requiredCapacity', { count: item.recommendedCapacity })}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((item.activeWorkersAvailable / item.recommendedCapacity) * 100)
                    )}%`,
                  }}
                  className={`h-full rounded-full ${
                    item.severity === 'high'
                      ? 'bg-red-500'
                      : item.severity === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Geofenced Urban Zone Heatmap Placeholder */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              {t('districtDemandIntensity')}
            </h3>
            <p className="text-xs text-slate-500">{t('districtDemandSub')}</p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            {t('liveSyncedMunicipalData')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-red-950">{t('southUrbanZone')}</span>
              <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded">
                {t('highDemandSurgeBadge')}
              </span>
            </div>
            <div className="text-xl font-black text-red-900">{t('multiplier18x')}</div>
            <p className="text-[11px] text-red-700">
              {t('southZoneDemandDesc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-950">{t('westZoneDwarka')}</span>
              <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                {t('balancedOptimalBadge')}
              </span>
            </div>
            <div className="text-xl font-black text-emerald-900">{t('baseline10x')}</div>
            <p className="text-[11px] text-emerald-700">
              {t('westZoneDemandDesc')}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-950">{t('centralBusinessHub')}</span>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">
                {t('surplusReadyBadge')}
              </span>
            </div>
            <div className="text-xl font-black text-blue-900">{t('demand08x')}</div>
            <p className="text-[11px] text-blue-700">
              {t('centralHubDemandDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
