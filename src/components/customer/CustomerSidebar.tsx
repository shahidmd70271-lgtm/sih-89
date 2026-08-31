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
  const { currentUser, bookings, activeView, setActiveView, activeBooking, openEmergencySOS, t } = useApp();

  const customerBookingsCount = currentUser?.id
    ? bookings.filter(
        (b) =>
          b.customer_id === currentUser.id ||
          (currentUser.phone && b.customerPhone && b.customerPhone === currentUser.phone) ||
          (currentUser.name && b.customerName && b.customerName === currentUser.name)
      ).length
    : 0;

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CU';

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
      badge: customerBookingsCount > 0 ? String(customerBookingsCount) : undefined,
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
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.name || 'Citizen Customer'}
              </h4>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold uppercase tracking-tight">
                {t('verified')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {currentUser?.phone || currentUser?.email || 'Verified Account'}
            </p>
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
              return null; // Handled in bottom alert card
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-xs transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Emergency SOS Card & Cooperative Badge */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        {/* Emergency SOS Button */}
        <div
          onClick={() => openEmergencySOS()}
          className="bg-linear-to-br from-red-500 to-rose-700 p-4 rounded-2xl text-white shadow-md shadow-red-500/20 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
            <h5 className="font-extrabold text-xs uppercase tracking-wider">
              {t('emergencyServiceSOS')}
            </h5>
          </div>
          <p className="text-[11px] text-red-100 leading-snug">
            {t('emergencySosSubtitle')}
          </p>
        </div>

        {/* Cooperative Attestation */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-semibold leading-tight">
            {t('nlcfCooperativeFederationAttested')}
          </span>
        </div>
      </div>
    </aside>
  );
};
