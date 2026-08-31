import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  FileText,
  RotateCcw,
  ArrowRight,
  CalendarCheck,
  KeyRound,
  Inbox,
  AlertTriangle,
  Star,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';

export const CustomerBookingsList: React.FC = () => {
  const {
    bookings,
    currentUser,
    setActiveBookingById,
    setActiveView,
    t,
  } = useApp();

  // Filter bookings strictly for this customer if logged in
  const customerBookings = currentUser?.id
    ? bookings.filter(
        (b) =>
          b.customer_id === currentUser.id ||
          (currentUser.phone && b.customerPhone && b.customerPhone === currentUser.phone) ||
          (currentUser.name && b.customerName && b.customerName === currentUser.name)
      )
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
          <span>{t('customerPortalTitle')}</span>
          <span>/</span>
          <span>{t('myServiceHistory')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {t('myBookingsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('myBookingsSubtitle')}
        </p>
      </div>

      {/* Bookings List or Empty State */}
      {customerBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">{t('noBookingsYet')}</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t('noBookingsSub')}
            </p>
          </div>
          <button
            onClick={() => setActiveView('find-services')}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>{t('findService')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {customerBookings.map((booking) => {
            const isActive =
              booking.status === 'Worker Accepted' ||
              booking.status === 'accepted' ||
              booking.status === 'Worker Travelling' ||
              booking.status === 'travelling' ||
              booking.status === 'Worker Arrived' ||
              booking.status === 'arrived' ||
              booking.status === 'in_progress' ||
              booking.status === 'Service In Progress' ||
              booking.status === 'Confirmed' ||
              booking.status === 'Scheduled';

            const isCompleted =
              booking.status === 'completed' ||
              booking.status === 'Completed' ||
              booking.status === 'paid';

            const statusKey = `status_${booking.status.toLowerCase().replace(/\s+/g, '_')}`;
            const translatedStatus = t(statusKey) || booking.status;
            const translatedSkill = t(`service_${booking.serviceType.replace(/[\s&]+/g, '')}`) || booking.serviceType;
            const otpToShow = booking.otpCode || booking.otp_code || '5842';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4 font-sans"
              >
                {/* Top Row: Status, ID & Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{booking.id}
                    </span>
                    {booking.isEmergency && (
                      <span className="text-[10px] uppercase font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-md">
                        {t('emergencySOS')}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-medium">{booking.createdAt || 'Just now'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'rejected' || booking.status === 'Worker Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                        }`}
                      ></span>
                      {translatedStatus}
                    </span>
                  </div>
                </div>

                {/* Middle Grid: Worker, Service details & Problem */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  {/* Worker Avatar & Name */}
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        booking.workerAvatar ||
                        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80'
                      }
                      alt={booking.workerName}
                      className="w-14 h-14 rounded-2xl object-cover border border-emerald-400 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{booking.workerName}</h4>
                      <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                        <ServiceIcon name={booking.serviceType} className="w-3.5 h-3.5" />
                        {translatedSkill}
                      </p>
                      {booking.workerPhone && (
                        <span className="text-[11px] text-slate-400 block truncate">
                          Ph: {booking.workerPhone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date, Time & Address */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{booking.customerAddress}</span>
                    </div>
                  </div>

                  {/* Pricing & OTP */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{t('totalAmount')}</span>
                      <span className="font-black text-slate-900 text-sm">₹{booking.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500">
                      <span>Payment Status</span>
                      <span className="text-emerald-700 font-bold capitalize">
                        {booking.paymentStatus}
                      </span>
                    </div>

                    {/* Customer Security OTP Card */}
                    {isActive && (
                      <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200 text-[11px] text-emerald-950 space-y-0.5 mt-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-emerald-700" />
                            <span>Your Service OTP:</span>
                          </span>
                          <span className="font-mono font-black text-sm text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-300 shadow-xs">
                            {otpToShow}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-800">
                          Provide this 4-digit PIN to your worker on arrival to start service.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Problem snippet */}
                <div className="text-xs text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{t('problemLabel')}: </span>
                  {booking.problemDescription}
                </div>

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Reserved Slot: <strong className="text-slate-800">{booking.timeSlot}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView('find-services')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Book Another Service' : t('bookAgain')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

