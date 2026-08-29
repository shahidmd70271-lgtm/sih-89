import React from 'react';
import {
  ShieldCheck,
  Award,
  Navigation,
  AlertTriangle,
  HeartHandshake,
  Globe,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhySahaayakSection: React.FC = () => {
  const { setCurrentRole, setActiveView, openEmergencySOS, t } = useApp();

  const features = [
    {
      id: 'verified',
      icon: ShieldCheck,
      title: t('whyFeature1Title'),
      subtitle: t('whyFeature1Sub'),
      points: [
        t('whyFeature1Point1'),
        t('whyFeature1Point2'),
        t('whyFeature1Point3'),
      ],
      color: 'emerald',
      badge: t('verifiedBadge'),
    },
    {
      id: 'fair-wages',
      icon: Award,
      title: t('whyFeature2Title'),
      subtitle: t('whyFeature2Sub'),
      points: [
        t('whyFeature2Point1'),
        t('whyFeature2Point2'),
        t('whyFeature2Point3'),
      ],
      color: 'blue',
      badge: t('transparentBadge'),
    },
    {
      id: 'scheduled-slots',
      icon: Clock,
      title: t('whyFeature3Title'),
      subtitle: t('whyFeature3Sub'),
      points: [
        t('whyFeature3Point1'),
        t('whyFeature3Point2'),
        t('whyFeature3Point3'),
      ],
      color: 'indigo',
      badge: t('realtimeBadge'),
    },
    {
      id: 'emergency',
      icon: AlertTriangle,
      title: t('whyFeature4Title'),
      subtitle: t('whyFeature4Sub'),
      points: [
        t('whyFeature4Point1'),
        t('whyFeature4Point2'),
        t('whyFeature4Point3'),
      ],
      color: 'rose',
      badge: t('instantDispatchBadge'),
    },
    {
      id: 'welfare',
      icon: HeartHandshake,
      title: t('whyFeature5Title'),
      subtitle: t('whyFeature5Sub'),
      points: [
        t('whyFeature5Point1'),
        t('whyFeature5Point2'),
        t('whyFeature5Point3'),
      ],
      color: 'amber',
      badge: t('socialImpactBadge'),
    },
    {
      id: 'multilingual',
      icon: Globe,
      title: t('whyFeature6Title'),
      subtitle: t('whyFeature6Sub'),
      points: [
        t('whyFeature6Point1'),
        t('whyFeature6Point2'),
        t('whyFeature6Point3'),
      ],
      color: 'teal',
      badge: t('inclusiveBadge'),
    },
  ];

  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <Award className="w-3.5 h-3.5" />
            <span>{t('whyCoopAdvantage')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('whyChooseTitle')}
          </h2>
          <p className="text-base text-slate-600 mt-2">
            {t('whyChooseSubtitle')}
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-700">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    {feat.subtitle}
                  </p>

                  <div className="space-y-2 border-t border-slate-200/80 pt-4">
                    {feat.points.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {feat.id === 'live-tracking' && (
                  <button
                    onClick={() => {
                      setCurrentRole('customer');
                      setActiveView('live-tracking');
                    }}
                    className="mt-6 w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t('launchLiveTracking')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {feat.id === 'emergency' && (
                  <button
                    onClick={() => openEmergencySOS()}
                    className="mt-6 w-full py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{t('openEmergencySOS')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Cooperative Impact Banner */}
        <div className="mt-16 bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                {t('ethicalGigEconomy')}
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {t('eliminatingCut')}
              </h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {t('eliminatingCutDesc')}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={() => {
                  setCurrentRole('worker');
                  setActiveView('worker-earnings');
                }}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center transition-colors cursor-pointer"
              >
                {t('inspectFairWage')}
              </button>
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setActiveView('admin-overview');
                }}
                className="px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs text-center border border-slate-600 transition-colors cursor-pointer"
              >
                {t('viewGovernance')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
