import React from 'react';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  Navigation,
  MessageSquare,
  CreditCard,
  User,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerSidebar: React.FC = () => {
  const { activeView, setActiveView, activeBooking, openEmergencySOS, t } = useApp();

  const navItems = [
    {
      id: 'customer-dashboard',
      label: t('navDashboard'),
      icon: LayoutDashboard,
    },
    {
      id: 'find-services',
      label: t('navFindServices'),
      icon: Search,
    },
    {
      id: 'my-bookings',
      label: t('navMyBookings'),
      icon: CalendarCheck,
      badge: '2',
    },
    {
      id: 'emergency-sos',
      label: t('navEmergencySOS'),
      icon: AlertTriangle,
      isEmergency: true,
    },
    {
      id: 'customer-messages',
      label: t('navMessages'),
      icon: MessageSquare,
      badge: '1',
    },
    {
      id: 'customer-payments',
      label: t('navFairPayments'),
      icon: CreditCard,
    },
    {
      id: 'customer-profile',
      label: t('navProfile'),
      icon: User,
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-4 lg:min-h-[calc(100vh-5rem)] flex flex-col justify-between shrink-0 font-sans">
      <div className="space-y-5">
        {/* User Mini Profile */}
        <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-200 shrink-0">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 truncate">Rahul Sharma</h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-tight">
                {t('verified')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">Noida Sector 62</p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
            {t('servicesAndPortal')}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            if (item.isEmergency) {
              return null; // Handled in bottom geometric alert card
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-sm flex items-center justify-center ${
                      isActive
                        ? 'bg-emerald-600/20 text-emerald-700'
                        : 'border border-slate-300 text-slate-400'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.id === 'live-tracking' ? (
                  <span className="bg-orange-500 w-2 h-2 rounded-full ring-4 ring-orange-100"></span>
                ) : item.badge ? (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Geometric Emergency SOS Box */}
      <div className="pt-4 mt-auto">
        <div className="bg-slate-800 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg border border-slate-700/80">
          <div className="relative z-10 space-y-1">
            <p className="text-[11px] text-slate-400 italic">{t('emergencyPrompt')}</p>
            <p className="font-bold text-sm text-white mb-2.5">{t('needHelpNow')}</p>
            <button
              onClick={() => openEmergencySOS()}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-3 rounded-lg transition-all w-full flex items-center justify-center gap-1.5 shadow-md shadow-red-500/20 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t('sosQuickBooking')}</span>
            </button>
          </div>
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white opacity-5 rounded-full pointer-events-none"></div>
        </div>
      </div>
    </aside>
  );
};
