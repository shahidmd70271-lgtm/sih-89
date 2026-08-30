import React from 'react';
import {
  ShieldCheck,
  Heart,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Award,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { setActiveView, setCurrentRole, openEmergencySOS, setIsWorkerJoinModalOpen, t } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Trust & Transparency Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerTrust1')}</h4>
              <p className="text-xs text-slate-400">{t('footerTrust1Sub')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerTrust2')}</h4>
              <p className="text-xs text-slate-400">{t('footerTrust2Sub')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerTrust3')}</h4>
              <p className="text-xs text-slate-400">{t('footerTrust3Sub')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('footerTrust4')}</h4>
              <p className="text-xs text-slate-400">{t('footerTrust4Sub')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Col 1 & 2: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">{t('appName')}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {t('footerMission')}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footerHelpline')} <strong>{t('helplineNumber')}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footerEmail')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footerAddress')}</span>
              </div>
            </div>
          </div>

          {/* Col 3: Popular Services */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t('popularServices')}</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('service_Plumbing')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('service_Electrical')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('service_Cleaning')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('service_Carpentry')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('find-services');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('service_ApplianceRepair')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => openEmergencySOS()}
                  className="text-red-400 font-semibold hover:underline cursor-pointer"
                >
                  {t('emergency24x7')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Portals & Roles */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t('portalsAndViews')}</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('customer-dashboard');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('customerDashboard')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveView('live-tracking');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('liveTracking')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('worker');
                    setActiveView('worker-dashboard');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('workerPortal')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsWorkerJoinModalOpen(true)}
                  className="text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  + {t('joinWorker')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('worker');
                    setActiveView('worker-earnings');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('fairWageSummary')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setActiveView('admin-verification');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('verificationDeskTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    setActiveView('admin-ai-forecast');
                  }}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('aiAssistant')}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Cooperative Federation & SIH Info */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t('cooperativeGuilds')}</h5>
            <div className="space-y-2 text-[11px] text-slate-400">
              <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block">{t('nlcfIndia')}</span>
                {t('nlcfDesc')}
              </p>
              <p className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="font-semibold text-slate-200 block">{t('sihTitle')}</span>
                {t('sihSub')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-1.5">
            <span>{t('footerCopyright')}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{t('footerFairWages')}</span>
            <span>•</span>
            <span>{t('footerSocialWelfare')}</span>
            <span>•</span>
            <span>{t('footerZeroCommission')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
