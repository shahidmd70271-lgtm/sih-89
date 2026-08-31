import React from 'react';
import { ArrowRight, Star, Users, Clock, ShieldCheck } from 'lucide-react';
import { SERVICE_CATEGORIES } from '../../data/mockData';
import { ServiceIcon } from '../common/ServiceIcon';
import { useApp } from '../../context/AppContext';
import { ServiceType } from '../../types';

export const PopularServicesSection: React.FC = () => {
  const { setCurrentRole, setActiveView, setSelectedServiceFilter, t, language } = useApp();

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedServiceFilter(service);
    setCurrentRole('customer');
    setActiveView('find-services');
  };

  return (
    <section className="py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('coopCertifiedTrades')}</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {t('popularServices')}
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-xl">
              {t('popularServicesSubtitle')}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedServiceFilter('All');
              setCurrentRole('customer');
              setActiveView('find-services');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white border border-slate-200 hover:border-emerald-300 px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <span>{t('viewAllTrades')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICE_CATEGORIES.map((cat) => {
            const displayTitle =
              language === 'te'
                ? cat.telugu
                : language === 'hi'
                ? cat.hindi
                : cat.title;

            return (
              <div
                key={cat.id}
                onClick={() => handleServiceSelect(cat.id)}
                className="group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Icon & Verified Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors shadow-xs">
                      <ServiceIcon name={cat.id} className="w-6 h-6" />
                    </div>

                    <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('verified')}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom meta & Price */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">{t('standardWage')}</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{cat.startingPrice}
                      <span className="text-[11px] font-normal text-slate-500">{t('perHour')}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-1 transition-transform">
                    <span>{t('bookService')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
