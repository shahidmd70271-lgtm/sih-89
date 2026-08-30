import React from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  Building2,
  BarChart3,
  Sparkles,
  Users,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminSidebar: React.FC = () => {
  const { activeView, setActiveView, workers, t } = useApp();

  const pendingCount = workers.filter(
    (w) =>
      !w.isVerified &&
      w.verificationStatus !== 'Rejected' &&
      w.verificationStatus !== 'rejected' &&
      w.verificationStatus !== 'Removed' &&
      w.verificationStatus !== 'Inactive' &&
      (w as any).status !== 'removed' &&
      (w as any).status !== 'inactive'
  ).length;

  const navItems = [
    { id: 'admin-dashboard', label: t('navOverview'), icon: LayoutDashboard },
    {
      id: 'admin-verification',
      label: t('workerVerificationDesk'),
      icon: ShieldCheck,
      badge: pendingCount > 0 ? `${pendingCount} ${t('pending')}` : undefined,
    },
    { id: 'admin-cooperatives', label: t('cooperativeSocietiesLabel'), icon: Building2 },
    { id: 'admin-analytics', label: t('analyticsAndGrowth'), icon: BarChart3 },
    { id: 'admin-ai-forecast', label: t('aiDemandForecastSidebar'), icon: Sparkles, highlight: true },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950 text-slate-300 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:min-h-[calc(100vh-5rem)] flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Admin Portal Header Badge */}
        <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white">{t('centralAdminDesk')}</h4>
            <p className="text-[10px] text-emerald-400 font-medium">{t('coopFederationAuth')}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            {t('platformManagement')}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-emerald-400 hover:bg-slate-900 hover:text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{t('cooperativesSynced', { count: 48 })}</span>
        </div>
        <p className="text-[10px] text-slate-600">{t('sihDeploymentNode')}</p>
      </div>
    </aside>
  );
};
