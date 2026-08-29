import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  CheckCircle2,
  Navigation,
  DollarSign,
  User,
  Award,
  HeartHandshake,
  ShieldCheck,
  Power,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WorkerSidebar: React.FC = () => {
  const { activeView, setActiveView, workers, activeBooking, t } = useApp();
  const worker = workers[0]; // Ravi Kumar (Plumber)

  const navItems = [
    { id: 'worker-dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'worker-jobs', label: t('workerJobsAvailable'), icon: Briefcase, badge: t('workerJobsNewBadge') },
    { id: 'worker-my-jobs', label: t('workerMyJobs'), icon: CheckCircle2 },
    { id: 'worker-schedule', label: 'Availability & Slots', icon: Clock },
    { id: 'worker-live-job', label: t('workerActiveJobTracker'), icon: Navigation, pulse: true, badge: t('live') },
    { id: 'worker-earnings', label: t('fairWageSummary'), icon: DollarSign },
    { id: 'worker-profile', label: t('navProfile'), icon: User },
    { id: 'worker-certifications', label: t('workerCertifications'), icon: Award },
    { id: 'worker-welfare', label: t('workerWelfareSection'), icon: HeartHandshake },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:min-h-[calc(100vh-5rem)] flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Worker Persona Badge */}
        <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 flex items-center gap-3">
          <div className="relative">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-11 h-11 rounded-xl object-cover border border-emerald-400"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h4 className="text-xs font-bold text-white truncate">{worker.name}</h4>
              <span className="text-[9px] text-emerald-400 font-bold">✓</span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">{t(`service_${worker.skill.replace(/\s+/g, '')}`)} {t('specialist')}</p>
            <span className="text-[9px] text-emerald-400 font-medium">● {t('dutyActive')}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 pb-1">
            {t('shramikPortal')}
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
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                      item.pulse
                        ? 'bg-emerald-500 text-slate-950 animate-pulse'
                        : isActive
                        ? 'bg-emerald-800 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cooperative Guarantee Box */}
      <div className="pt-6 mt-6 border-t border-slate-800 space-y-2">
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nlcfSocietyMember')}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            {t('accidentCoverActive')}
          </p>
        </div>
      </div>
    </aside>
  );
};
