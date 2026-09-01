import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  XCircle,
  Phone,
  MessageSquare,
  Navigation,
  ChevronRight,
  ShieldCheck,
  User,
  Power,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import { ServiceIcon } from '../common/ServiceIcon';
import { WorkerBookingAcceptModal } from './WorkerBookingAcceptModal';
import { WorkerBookingRejectModal } from './WorkerBookingRejectModal';

interface WorkerJobsViewProps {
  initialTab?: 'pending' | 'accepted' | 'completed' | 'rejected';
}

export const WorkerJobsView: React.FC<WorkerJobsViewProps> = ({ initialTab = 'pending' }) => {
  const {
    workers,
    bookings,
    acceptBookingByWorker,
    rejectBookingByWorker,
    isWorkerOnline,
    setIsWorkerOnline,
    setActiveView,
    setActiveBookingById,
    setIsCallModalOpen,
    setIsMessagesModalOpen,
    currentWorker,
    authLoading,
    setIsWorkerAuthModalOpen,
    currentUser,
    t,
  } = useApp();

  const worker = currentWorker;

  if (!worker) {
    if (authLoading) {
      return (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto animate-spin" />
          <h3 className="text-sm font-bold text-slate-700">Restoring Assignments...</h3>
          <p className="text-xs text-slate-400">Verifying session credentials from cooperative network...</p>
        </div>
      );
    }

    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No Worker Profile Found</h3>
        <p className="text-xs text-slate-500">Please register or log in with your worker credentials.</p>
        <button
          onClick={() => setIsWorkerAuthModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
        >
          Sign In as Worker
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'completed' | 'rejected'>(initialTab);

  // Modals state
  const [acceptModalBooking, setAcceptModalBooking] = useState<Booking | null>(null);
  const [rejectModalBooking, setRejectModalBooking] = useState<Booking | null>(null);

  // Filter bookings for this worker
  // Note: For emergency requests, online workers of the same trade can also see broadcast requests!
  const isWorkerBooking = (b: Booking) => {
    if (!worker) return false;
    const workerBizId = worker.id;
    const workerProfileId = worker.profile_id;
    const authId = currentUser?.id;
    const authWorkerId = currentUser?.workerId;

    return Boolean(
      (workerBizId && (b.workerId === workerBizId || (b as any).worker_id === workerBizId)) ||
      (authWorkerId && (b.workerId === authWorkerId || (b as any).worker_id === authWorkerId)) ||
      (workerProfileId && (b.workerId === workerProfileId || (b as any).worker_id === workerProfileId)) ||
      (authId && (b.workerId === authId || (b as any).worker_id === authId)) ||
      (b.workerName && worker.name && b.workerName.toLowerCase().trim() === worker.name.toLowerCase().trim())
    );
  };

  const allWorkerBookings = bookings.filter(
    (b) => isWorkerBooking(b) || (b.isEmergency && b.serviceType === worker.skill)
  );

  const pendingBookings = allWorkerBookings.filter(
    (b) => b.status === 'requested' || b.status === 'Pending' || b.status === 'Waiting for Response'
  );

  const acceptedBookings = allWorkerBookings.filter(
    (b) =>
      b.status === 'accepted' ||
      b.status === 'Worker Accepted' ||
      b.status === 'Worker Travelling' ||
      b.status === 'travelling' ||
      b.status === 'Worker Arrived' ||
      b.status === 'arrived' ||
      b.status === 'in_progress' ||
      b.status === 'Service In Progress' ||
      b.status === 'Confirmed' ||
      b.status === 'Scheduled'
  );

  const completedBookings = allWorkerBookings.filter(
    (b) => b.status === 'completed' || b.status === 'Completed' || b.status === 'paid'
  );

  const rejectedBookings = allWorkerBookings.filter(
    (b) => b.status === 'rejected' || b.status === 'Worker Rejected'
  );

  const handleOpenAcceptModal = (booking: Booking) => {
    setAcceptModalBooking(booking);
  };

  const handleOpenRejectModal = (booking: Booking) => {
    setRejectModalBooking(booking);
  };

  const handleConfirmAccept = (bookingId: string) => {
    acceptBookingByWorker(bookingId, worker.id);
  };

  const handleConfirmReject = (bookingId: string, reason: string) => {
    rejectBookingByWorker(bookingId, worker.id, reason);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Availability Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isWorkerOnline
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-3.5 w-3.5 shrink-0">
            {isWorkerOnline && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3.5 w-3.5 ${
                isWorkerOnline ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            ></span>
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider">
                Status: {isWorkerOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isWorkerOnline
                ? 'You are available for new service requests. Incoming citizen bookings will appear here instantly.'
                : 'You are currently offline. Turn on availability to receive service requests.'}
            </p>
          </div>
        </div>

        <button
          id="toggle-availability-btn"
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
            <span>Worker Portal</span>
            <span>/</span>
            <span>Job Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Booking Requests & Jobs
          </h1>
          <p className="text-xs text-slate-500">
            Review incoming citizen requests, manage confirmed assignments, and track service history.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-pending-requests"
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pending'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Booking Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'pending'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {pendingBookings.length}
          </span>
        </button>

        <button
          id="tab-accepted-jobs"
          onClick={() => setActiveTab('accepted')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'accepted'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Accepted Jobs</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'accepted'
                ? 'bg-emerald-400 text-slate-950'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {acceptedBookings.length}
          </span>
        </button>

        <button
          id="tab-completed-jobs"
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Completed Jobs</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'completed'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {completedBookings.length}
          </span>
        </button>

        <button
          id="tab-rejected-jobs"
          onClick={() => setActiveTab('rejected')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'rejected'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected Jobs</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'rejected'
                ? 'bg-red-500 text-white'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {rejectedBookings.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {/* 1. PENDING REQUESTS TAB */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {!isWorkerOnline && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You are currently offline. New customer requests are paused until you go online.</span>
              </div>
              <button
                onClick={() => setIsWorkerOnline(true)}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Go Online
              </button>
            </div>
          )}

          {pendingBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Pending Requests</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                You have answered all incoming service requests. New bookings from citizens will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingBookings.map((booking) => (
                <div
                  key={booking.id}
                  id={`booking-request-card-${booking.id}`}
                  className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category + Emergency + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
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

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                        <span>Waiting for Response</span>
                      </span>
                    </div>

                    {/* Customer & Service Detail */}
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mb-0.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Customer:</span>
                        <strong className="text-slate-900 font-bold">{booking.customerName}</strong>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {booking.problemDescription}
                      </h3>
                    </div>

                    {/* Location & Time Grid */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Location:</strong> {booking.customerAddress}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>📍 Distance: <strong>{booking.distanceKm || 1.2} km away</strong></span>
                        <span>⏱️ Requested: <strong>{booking.createdAt}</strong></span>
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

                  {/* Bottom: Estimated Earnings + Accept / Reject Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Estimated Earnings
                      </span>
                      <span className="text-xl font-black text-emerald-700">
                        ₹{booking.estimatedPrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        id={`reject-booking-btn-${booking.id}`}
                        onClick={() => handleOpenRejectModal(booking)}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        REJECT
                      </button>
                      <button
                        id={`accept-booking-btn-${booking.id}`}
                        onClick={() => handleOpenAcceptModal(booking)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ACCEPT JOB</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ACCEPTED JOBS TAB */}
      {activeTab === 'accepted' && (
        <div className="space-y-4">
          {acceptedBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Accepted Jobs in Progress</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Accept incoming requests from the "Booking Requests" tab to view active assignments and launch the Job Control Desk.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedBookings.map((booking) => (
                <div
                  key={booking.id}
                  id={`accepted-job-card-${booking.id}`}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-emerald-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {booking.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">#{booking.id}</span>
                      {booking.isEmergency && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-extrabold uppercase">
                          Emergency SOS
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      {booking.customerName} • {booking.serviceType}
                    </h3>
                    <p className="text-xs text-slate-600">{booking.problemDescription}</p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      <span>📍 {booking.customerAddress}</span>
                      <span>📅 {booking.date}</span>
                      <span>⏰ {booking.timeSlot}</span>
                      <span>💰 Take-Home: <strong>₹{booking.estimatedPrice}</strong></span>
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-medium">
                        🔒 Ask customer for OTP on arrival
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsCallModalOpen(true)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="Call Customer"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => setIsMessagesModalOpen(true)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      title="Chat with Customer"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveBookingById(booking.id);
                        setActiveView('worker-live-job');
                      }}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Control Desk</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. COMPLETED JOBS TAB */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Completed Services Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Finished services with confirmed digital settlements will be archived here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        COMPLETED
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{booking.id}</span>
                      <span className="text-xs text-slate-500">• {booking.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {booking.customerName} — {booking.serviceType}
                    </h4>
                    <p className="text-xs text-slate-500">{booking.problemDescription}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-slate-400 block">Earnings Settled</span>
                    <span className="text-base font-black text-emerald-700">
                      ₹{booking.estimatedPrice}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. REJECTED JOBS TAB */}
      {activeTab === 'rejected' && (
        <div className="space-y-4">
          {rejectedBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Rejected Jobs</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Requests you decline will be logged here for your records.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rejectedBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 opacity-90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                        DECLINED
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{booking.id}</span>
                      <span className="text-xs text-slate-500">• {booking.date} ({booking.timeSlot})</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {booking.customerName} — {booking.serviceType}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Reason: <strong className="text-slate-700">{booking.rejectionReason || 'Worker Unavailable'}</strong>
                    </p>
                  </div>

                  <div className="text-right shrink-0 text-xs text-slate-500">
                    <span>Slot freed on calendar</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modals */}
      <WorkerBookingAcceptModal
        booking={acceptModalBooking}
        isOpen={!!acceptModalBooking}
        onClose={() => setAcceptModalBooking(null)}
        onConfirmAccept={handleConfirmAccept}
      />

      <WorkerBookingRejectModal
        booking={rejectModalBooking}
        isOpen={!!rejectModalBooking}
        onClose={() => setRejectModalBooking(null)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
};
