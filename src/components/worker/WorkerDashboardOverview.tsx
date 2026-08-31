import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  DollarSign,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Phone,
  Navigation,
  Power,
  Calendar,
  User,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';
import { Booking } from '../../types';
import { WorkerBookingAcceptModal } from './WorkerBookingAcceptModal';
import { WorkerBookingRejectModal } from './WorkerBookingRejectModal';

export const WorkerDashboardOverview: React.FC = () => {
  const {
    workers,
    bookings,
    activeBooking,
    setActiveView,
    acceptBookingByWorker,
    rejectBookingByWorker,
    isWorkerOnline,
    setIsWorkerOnline,
    currentWorker,
    t,
  } = useApp();

  const worker = currentWorker;

  if (!worker) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No Worker Profile Found</h3>
        <p className="text-xs text-slate-500">Please register or log in with your worker mobile number.</p>
      </div>
    );
  }

  // Real paid bookings for this worker
  const isWorkerBooking = (b: Booking) => {
    return (
      b.workerId === worker.id ||
      (b as any).worker_id === worker.id ||
      (worker.profile_id && (b.workerId === worker.profile_id || (b as any).worker_id === worker.profile_id)) ||
      (b.workerName && worker.name && b.workerName.toLowerCase().trim() === worker.name.toLowerCase().trim())
    );
  };

  const paidBookings = bookings.filter(
    (b) =>
      isWorkerBooking(b) &&
      (b.paymentStatus === 'paid' ||
        b.paymentStatus === 'Settled to Worker' ||
        b.status === 'paid' ||
        b.status === 'completed' ||
        b.status === 'Completed')
  );

  const realEarnings = paidBookings.reduce((sum, b) => sum + (b.totalAmount || b.estimatedPrice || 299), 0);
  const realWelfareBalance = Math.round(realEarnings * 0.05);

  // Modals state
  const [selectedAcceptBooking, setSelectedAcceptBooking] = useState<Booking | null>(null);
  const [selectedRejectBooking, setSelectedRejectBooking] = useState<Booking | null>(null);

  // Get pending bookings for this worker (and trade matching emergencies)
  const pendingRequests = bookings.filter(
    (b) =>
      (isWorkerBooking(b) || (b.isEmergency && b.serviceType === worker.skill)) &&
      (b.status === 'requested' || b.status === 'Pending' || b.status === 'Waiting for Response')
  );

  const acceptedJobs = bookings.filter(
    (b) =>
      isWorkerBooking(b) &&
      (b.status === 'accepted' ||
        b.status === 'Worker Accepted' ||
        b.status === 'Worker Travelling' ||
        b.status === 'travelling' ||
        b.status === 'Worker Arrived' ||
        b.status === 'arrived' ||
        b.status === 'in_progress' ||
        b.status === 'Service In Progress' ||
        b.status === 'Confirmed' ||
        b.status === 'Scheduled')
  );

  const handleConfirmAccept = (bookingId: string) => {
    acceptBookingByWorker(bookingId, worker.id);
  };

  const handleConfirmReject = (bookingId: string, reason: string) => {
    rejectBookingByWorker(bookingId, worker.id, reason);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Worker Availability Online/Offline Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isWorkerOnline
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
            : 'bg-slate-100 border-slate-300 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            {isWorkerOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                isWorkerOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Availability Status: {isWorkerOnline ? 'ONLINE (Available for Requests)' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isWorkerOnline
                ? '🟢 You are available for new service requests. New citizen bookings require manual acceptance.'
                : '⚪ You are currently offline. Turn on availability to receive service requests.'}
            </p>
          </div>
        </div>

        <button
          id="toggle-worker-availability-btn"
          onClick={() => setIsWorkerOnline(!isWorkerOnline)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 ${
            isWorkerOnline
              ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isWorkerOnline ? 'Go Offline' : 'Go Online'}</span>
        </button>
      </div>

      {/* Top Welcome Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{t('labourCoopId')}: {worker.applicationId || 'NLCF-DL-089'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {t('goodMorningWorker', { name: worker.name })} ☀️
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('workerOnlineSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-2xl text-right">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">
              {t('coopWelfareBalance')}
            </span>
            <span className="text-base font-black text-white font-mono">₹{realWelfareBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Requests */}
        <div
          onClick={() => setActiveView('worker-my-jobs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Requests
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingRequests.length}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Requires manual action
          </div>
        </div>

        {/* Accepted / In Progress */}
        <div
          onClick={() => setActiveView('worker-my-jobs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Accepted Jobs
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{acceptedJobs.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Confirmed assignments
          </div>
        </div>

        {/* Today's Earnings */}
        <div
          onClick={() => setActiveView('worker-earnings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('todaysEarnings')}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">₹{realEarnings.toLocaleString('en-IN')}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {t('settlesToBank')}
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('citizenRating')}
            </span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{worker.rating || 5.0}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            {t('basedOnAudits', { count: worker.reviewsCount || 0 })}
          </div>
        </div>
      </div>

      {/* Active Service In Progress Banner */}
      {activeBooking && activeBooking.status !== 'Completed' && (
        <div className="bg-emerald-900 text-white rounded-3xl p-6 border border-emerald-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                {t('currentActiveService')}
              </span>
              <span className="text-xs text-emerald-300 font-mono">#{activeBooking.id}</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              {t('customerLabel')}: {activeBooking.customerName} • {activeBooking.serviceType}
            </h3>
            <p className="text-xs text-slate-300">
              {t('addressLabel')}: {activeBooking.customerAddress} • Status: <strong>{activeBooking.status}</strong>
            </p>
          </div>

          <button
            onClick={() => setActiveView('worker-live-job')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-xs shadow-md hover:bg-emerald-50 transition-colors cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-emerald-700" />
            <span>{t('openJobControlDesk')}</span>
          </button>
        </div>
      )}

      {/* Booking Requests (Pending Confirmation) Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900">Incoming Booking Requests</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
              {pendingRequests.length} Pending
            </span>
          </div>
          <button
            onClick={() => setActiveView('worker-my-jobs')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingRequests.map((booking) => (
              <div
                key={booking.id}
                id={`overview-request-card-${booking.id}`}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top: Category + Emergency + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase">
                        <ServiceIcon name={booking.serviceType} className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{booking.serviceType}</span>
                      </span>

                      {booking.isEmergency && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-extrabold uppercase animate-pulse border border-red-200">
                          <AlertTriangle className="w-3 h-3" />
                          <span>EMERGENCY</span>
                        </span>
                      )}
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Waiting for Response</span>
                    </span>
                  </div>

                  {/* Customer & Description */}
                  <div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-0.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Customer:</span>
                      <strong className="text-slate-900">{booking.customerName}</strong>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {booking.problemDescription}
                    </h4>
                  </div>

                  {/* Location & Time Box */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        <strong>Location:</strong> {booking.customerAddress} ({booking.distanceKm || 1.2} km)
                      </span>
                    </div>
                    <div className="border-t border-slate-200/60 pt-1.5 grid grid-cols-2 gap-2 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{booking.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Earnings & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">
                      Estimated Earnings
                    </span>
                    <span className="text-lg font-black text-emerald-700">
                      ₹{booking.estimatedPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`overview-reject-btn-${booking.id}`}
                      onClick={() => setSelectedRejectBooking(booking)}
                      className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                    >
                      REJECT
                    </button>

                    <button
                      id={`overview-accept-btn-${booking.id}`}
                      onClick={() => setSelectedAcceptBooking(booking)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ACCEPT JOB</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700">No Pending Booking Requests</p>
            <p className="text-slate-400">
              When customers book your trade or emergency services, new requests will appear here for your explicit acceptance.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <WorkerBookingAcceptModal
        booking={selectedAcceptBooking}
        isOpen={!!selectedAcceptBooking}
        onClose={() => setSelectedAcceptBooking(null)}
        onConfirmAccept={handleConfirmAccept}
      />

      <WorkerBookingRejectModal
        booking={selectedRejectBooking}
        isOpen={!!selectedRejectBooking}
        onClose={() => setSelectedRejectBooking(null)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
};
