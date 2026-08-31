import React, { useMemo, useState } from 'react';
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
  ShieldCheck,
  ArrowRight,
  BarChart3,
  RefreshCw,
  PhoneCall,
  Clock,
  Briefcase,
  HelpCircle,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateAIDemandForecast } from '../../services/aiDemandForecastService';
import { ServiceType, Worker } from '../../types';

export const AdminAIDemandForecast: React.FC = () => {
  const { bookings, workers, addWorkerNotification, t } = useApp();
  const [forecastHorizon, setForecastHorizon] = useState<'48h' | '7d' | '30d'>('48h');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>('All');
  const [isMobilizingAll, setIsMobilizingAll] = useState(false);
  const [mobilizedTrade, setMobilizedTrade] = useState<string | null>(null);
  const [mobilizedWorkers, setMobilizedWorkers] = useState<Set<string>>(new Set());

  // Generate real AI Demand Forecast from Supabase data
  const forecastSummary = useMemo(() => {
    return generateAIDemandForecast(bookings, workers, forecastHorizon, selectedZone);
  }, [bookings, workers, forecastHorizon, selectedZone]);

  const {
    totalBookingsAnalyzed,
    totalAvailableWorkers,
    totalBusyWorkers,
    netShortage,
    netSurplus,
    topSurgingTrade,
    highestDemandTrade,
    hasSufficientData,
    overallInsight,
    tradeForecasts,
    zoneDemandBreakdown,
  } = forecastSummary;

  // Filter trade forecasts if a specific trade is selected
  const filteredTrades = useMemo(() => {
    if (selectedTradeFilter === 'All') return tradeForecasts;
    return tradeForecasts.filter((t) => t.trade === selectedTradeFilter);
  }, [tradeForecasts, selectedTradeFilter]);

  // Global Mobilization of all available workers in deficit trades
  const handleMobilizeAll = () => {
    setIsMobilizingAll(true);
    setTimeout(() => {
      // Dispatch notifications to all recommended workers in deficit trades
      tradeForecasts
        .filter((tf) => tf.shortage > 0)
        .forEach((tf) => {
          tf.recommendedWorkers.forEach((w) => {
            addWorkerNotification({
              workerId: w.id,
              type: 'broadcast_alert',
              title: `High Demand Alert: ${tf.trade}`,
              message: `AI Forecast detected high service demand (${tf.growthRateFormatted} surge). Priority dispatch is active for your area.`,
              isEmergency: tf.severity === 'high',
            });
            setMobilizedWorkers((prev) => new Set(prev).add(w.id));
          });
        });

      setIsMobilizingAll(false);
    }, 1000);
  };

  // Mobilize workers for a specific trade
  const handleMobilizeTrade = (tradeName: string, workersToMobilize: Worker[]) => {
    setMobilizedTrade(tradeName);
    setTimeout(() => {
      workersToMobilize.forEach((w) => {
        addWorkerNotification({
          workerId: w.id,
          type: 'broadcast_alert',
          title: `Mobilization Notice: ${tradeName}`,
          message: `Cooperative Admin dispatched peak demand mobilization for ${tradeName} in ${selectedZone}.`,
          isEmergency: true,
        });
        setMobilizedWorkers((prev) => new Set(prev).add(w.id));
      });
      setMobilizedTrade(null);
    }, 800);
  };

  // Mobilize a single worker
  const handleMobilizeSingleWorker = (worker: Worker, tradeName: string) => {
    addWorkerNotification({
      workerId: worker.id,
      type: 'service_request',
      title: `Priority Dispatch: ${tradeName}`,
      message: `You have been allocated by AI Dispatch for upcoming peak ${tradeName} requests.`,
      isEmergency: false,
    });
    setMobilizedWorkers((prev) => new Set(prev).add(worker.id));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('centralAdminDesk') || 'Central Admin Desk'}</span>
            <span>/</span>
            <span>{t('predictiveIntelligence') || 'Predictive Intelligence'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-emerald-600" />
            <span>AI Demand Forecast & Workforce Allocation</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time analytics & workforce rebalancing engine powered by Supabase booking records
          </p>
        </div>

        {/* Controls: Horizon & Zone */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Horizon toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
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
                {h === '48h' ? 'Next 48 Hours' : h === '7d' ? '7-Day Trend' : '30-Day Model'}
              </button>
            ))}
          </div>

          {/* Zone Selector */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 px-3 py-2 rounded-2xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            <option value="All Zones">All Urban Zones</option>
            <option value="South Urban Zone">South Urban Zone</option>
            <option value="West Zone (Dwarka & NCR)">West Zone (Dwarka & NCR)</option>
            <option value="Central Business Hub">Central Business Hub</option>
          </select>
        </div>
      </div>

      {/* Insufficient Data Notice (if applicable) */}
      {!hasSufficientData && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-950">
              Notice: Insufficient historical booking data for advanced time-series modeling
            </p>
            <p className="text-amber-800">
              Only {totalBookingsAnalyzed} booking(s) currently recorded in the Supabase database. The forecasting engine is operating in <strong>statistical baseline mode</strong> using verified worker ratios. As customers create more service bookings, trade trend velocities will automatically refine.
            </p>
          </div>
        </div>
      )}

      {/* AI Key Insight Callout Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800 shadow-xl space-y-5 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>AI Predictive Dispatch Engine • Real Database Sync</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active Model: Time-Weighted Regression ({forecastHorizon})</span>
          </div>
        </div>

        <div className="space-y-2 max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {topSurgingTrade
              ? `Surge Alert: ${topSurgingTrade.trade} demand surging by ${topSurgingTrade.growthRateFormatted}`
              : 'Cooperative Workforce Demand & Capacity Model'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {overallInsight}
          </p>
        </div>

        {/* Actionable Dispatch Button */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleMobilizeAll}
            disabled={isMobilizingAll || netShortage === 0}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isMobilizingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting Mobilization to Reserve Shramiks...</span>
              </>
            ) : netShortage > 0 ? (
              <>
                <Zap className="w-4 h-4" />
                <span>Auto-Mobilize Deficit Trades ({netShortage} Additional Shramiks)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                <span>Workforce Balanced Across All Sectors</span>
              </>
            )}
          </button>

          {mobilizedWorkers.size > 0 && (
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-2 rounded-xl border border-emerald-700">
              ✓ {mobilizedWorkers.size} Shramiks Mobilized & Notified
            </span>
          )}
        </div>
      </div>

      {/* Top Executive Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Historical Bookings</span>
          <div className="text-2xl font-black text-slate-900">{totalBookingsAnalyzed}</div>
          <p className="text-[11px] text-slate-500">Real database records</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Top Surging Trade</span>
          <div className="text-2xl font-black text-emerald-700">
            {topSurgingTrade?.trade || 'Plumbing'}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            {topSurgingTrade?.growthRateFormatted || '+0%'} velocity
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Available On-Duty</span>
          <div className="text-2xl font-black text-blue-700">{totalAvailableWorkers}</div>
          <p className="text-[11px] text-slate-500">{totalBusyWorkers} shramiks busy on jobs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workforce Deficit</span>
          <div className={`text-2xl font-black ${netShortage > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {netShortage > 0 ? `-${netShortage}` : '0'}
          </div>
          <p className="text-[11px] text-slate-500">
            {netShortage > 0 ? 'Urgent allocation needed' : 'Zero shortage detected'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workforce Surplus</span>
          <div className="text-2xl font-black text-teal-700">+{netSurplus}</div>
          <p className="text-[11px] text-slate-500">Ready for reserve rebalance</p>
        </div>
      </div>

      {/* Visual Service Demand & Capacity Distribution Chart */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>Service Demand vs Verified Worker Capacity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Comparison of real historical demand, AI projected requests, and available active cooperative shramiks
            </p>
          </div>

          {/* Quick Trade Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedTradeFilter('All')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedTradeFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Trades
            </button>
            {tradeForecasts.slice(0, 5).map((t) => (
              <button
                key={t.trade}
                onClick={() => setSelectedTradeFilter(t.trade)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTradeFilter === t.trade
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t.trade}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Comparison Bars */}
        <div className="space-y-4 pt-2">
          {filteredTrades.slice(0, 6).map((item) => {
            const maxVal = Math.max(item.projectedDemand, item.activeWorkersAvailable, item.totalHistoricalBookings, 10);
            const demandPct = Math.min(100, Math.round((item.projectedDemand / maxVal) * 100));
            const capacityPct = Math.min(100, Math.round((item.activeWorkersAvailable / maxVal) * 100));

            return (
              <div key={item.trade} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{item.trade}</span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                        item.severity === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.severity === 'medium'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.growthRateFormatted} Surge ({item.severity.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-slate-600">
                      Expected Demand: <strong className="text-slate-900">{item.projectedDemand}</strong>
                    </span>
                    <span className="text-slate-600">
                      Available Shramiks: <strong className="text-emerald-700">{item.activeWorkersAvailable}</strong>
                    </span>
                    {item.shortage > 0 ? (
                      <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 font-extrabold">
                        Deficit: -{item.shortage}
                      </span>
                    ) : (
                      <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-extrabold">
                        Surplus: +{item.surplus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-1.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Projected Demand Volume ({item.projectedDemand} requests)</span>
                      <span>{demandPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${demandPct}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.severity === 'high' ? 'bg-red-500' : item.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                      <span>Active Verified Shramik Capacity ({item.activeWorkersAvailable} available)</span>
                      <span>{capacityPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${capacityPct}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trade-by-Trade Workforce Allocation Cards */}
      <div>
        <div className="mb-4">
          <h3 className="text-xl font-black text-slate-900">
            Trade-by-Trade Workforce Allocation Recommendations
          </h3>
          <p className="text-xs text-slate-500">
            Actionable allocation suggestions based on projected demand vs available verified workers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTrades.map((item) => (
            <div
              key={item.trade}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-black text-emerald-800">
                      {item.trade[0]}
                    </div>
                    <div>
                      <h4 className="text-base font-black text-slate-900">{item.trade}</h4>
                      <span className="text-[11px] text-slate-500">
                        {item.totalHistoricalBookings} Total Historical Bookings
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full ${
                      item.severity === 'high'
                        ? 'bg-red-100 text-red-800'
                        : item.severity === 'medium'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.growthRateFormatted} Surge
                  </span>
                </div>

                {/* AI Forecast & Recommendation Statements */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-start gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item.forecastStatement}</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-900 flex items-start gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{item.recommendationStatement}</span>
                  </div>
                </div>

                {/* Demand & Worker Stats Matrix */}
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Expected Demand</span>
                    <strong className="text-sm font-black text-slate-900">{item.projectedDemand}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Available</span>
                    <strong className="text-sm font-black text-emerald-700">{item.activeWorkersAvailable}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Busy</span>
                    <strong className="text-sm font-black text-slate-600">{item.busyWorkersCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">
                      {item.shortage > 0 ? 'Deficit' : 'Surplus'}
                    </span>
                    <strong className={`text-sm font-black ${item.shortage > 0 ? 'text-red-600' : 'text-teal-700'}`}>
                      {item.shortage > 0 ? `-${item.shortage}` : `+${item.surplus}`}
                    </strong>
                  </div>
                </div>

                {/* Recommended Verified Workers List */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Recommended Available Shramiks ({item.recommendedWorkers.length})</span>
                    <span className="text-[11px] text-slate-500 font-normal">Sorted by trade experience</span>
                  </div>

                  {item.recommendedWorkers.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {item.recommendedWorkers.map((w) => {
                        const isMobilized = mobilizedWorkers.has(w.id);
                        return (
                          <div
                            key={w.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={w.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'}
                                alt={w.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate flex items-center gap-1">
                                  <span>{w.name}</span>
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {w.experienceYears || 3} yrs exp • {w.phone || 'Available'}
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleMobilizeSingleWorker(w, item.trade)}
                              disabled={isMobilized}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                                isMobilized
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                              }`}
                            >
                              {isMobilized ? '✓ Allocated' : 'Allocate'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-center">
                      No additional idle verified shramiks currently available for {item.trade}.
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  {item.shortage > 0
                    ? `Allocate ${item.shortage} shramiks to meet demand`
                    : 'Workforce adequately staffed'}
                </span>

                <button
                  onClick={() => handleMobilizeTrade(item.trade, item.recommendedWorkers)}
                  disabled={mobilizedTrade === item.trade || item.recommendedWorkers.length === 0}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
                >
                  {mobilizedTrade === item.trade ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Allocating...</span>
                    </>
                  ) : (
                    <>
                      <span>Mobilize Trade</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Deep Reasoning & Methodology Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>AI Insight & Methodology Explanation</span>
        </div>

        <h3 className="text-lg font-black text-white">
          How Sahaayak Computes Demand Forecasts & Workforce Allocations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              1. Historical Supabase Ingestion
            </strong>
            <p className="text-slate-400 leading-relaxed">
              Analyzes real booking time-stamps, service categories, and geolocation coordinates stored in <code className="text-emerald-300">public.bookings</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              2. Trend Velocity & Moving Averages
            </strong>
            <p className="text-slate-400 leading-relaxed">
              Computes week-over-week growth rate and time-decay momentum to project peak request volumes for the selected horizon (48h / 7d / 30d).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <strong className="text-white font-bold block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              3. Verified Capacity & Fair Allocation
            </strong>
            <p className="text-slate-400 leading-relaxed">
              Cross-references approved cooperative shramiks in <code className="text-emerald-300">public.workers</code> to identify active shortages and recommend available verified workers.
            </p>
          </div>
        </div>
      </div>

      {/* Geofenced Urban Zone Heatmap */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>District Demand Intensity Heatmap</span>
            </h3>
            <p className="text-xs text-slate-500">
              Localized demand multipliers derived from municipal booking density
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Live Synced Municipal Clusters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {zoneDemandBreakdown.map((zone) => (
            <div
              key={zone.zoneName}
              className={`p-5 rounded-2xl border space-y-2 ${
                zone.severity === 'high'
                  ? 'bg-red-50/70 border-red-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold ${zone.severity === 'high' ? 'text-red-950' : 'text-emerald-950'}`}>
                  {zone.zoneName}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                    zone.severity === 'high' ? 'bg-red-600' : 'bg-emerald-600'
                  }`}
                >
                  {zone.severity === 'high' ? 'Surge Area' : 'Balanced'}
                </span>
              </div>
              <div
                className={`text-xl font-black ${
                  zone.severity === 'high' ? 'text-red-900' : 'text-emerald-900'
                }`}
              >
                {zone.demandMultiplier} Intensity
              </div>
              <p className={`text-[11px] ${zone.severity === 'high' ? 'text-red-700' : 'text-emerald-700'}`}>
                {zone.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
