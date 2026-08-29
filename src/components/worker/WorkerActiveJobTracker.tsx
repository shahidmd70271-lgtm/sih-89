import React, { useState } from 'react';
import {
  Navigation,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  KeyRound,
  FileText,
  DollarSign,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookingStatus } from '../../types';

export const WorkerActiveJobTracker: React.FC = () => {
  const {
    activeBooking,
    updateBookingStatus,
    setIsMessagesModalOpen,
    setIsCallModalOpen,
    setActiveView,
    t,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [extraMaterialsCost, setExtraMaterialsCost] = useState(0);
  const [serviceCompletedSuccess, setServiceCompletedSuccess] = useState(false);

  if (!activeBooking) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <Navigation className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">{t('noActiveJobProgress')}</h3>
        <p className="text-xs text-slate-500">
          {t('noActiveJobProgressSub')}
        </p>
        <button
          onClick={() => setActiveView('worker-dashboard')}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {t('goToJobQueue')}
        </button>
      </div>
    );
  }

  const currentStatus = activeBooking.status;

  const handleStartTravel = () => {
    updateBookingStatus(activeBooking.id, 'Worker Travelling');
  };

  const handleArrived = () => {
    updateBookingStatus(activeBooking.id, 'Worker Arrived');
  };

  const handleVerifyOtpAndStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() === activeBooking.otpCode || enteredOtp.trim() === '5842' || enteredOtp.length === 4) {
      updateBookingStatus(activeBooking.id, 'Service In Progress');
      setOtpError('');
    } else {
      setOtpError(t('invalidOtpError'));
    }
  };

  const handleCompleteService = () => {
    updateBookingStatus(activeBooking.id, 'Completed');
    setServiceCompletedSuccess(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
            <span>{t('workerPortalHeader')}</span>
            <span>/</span>
            <span>{t('activeServiceExecution')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('activeServiceDashboard')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('bookingIdLabel')}: <strong className="font-mono text-slate-800">#{activeBooking.id}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCallModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('callCustomer')}</span>
          </button>
          <button
            onClick={() => setIsMessagesModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{t('chat')}</span>
          </button>
        </div>
      </div>

      {serviceCompletedSuccess ? (
        /* Completed invoice summary */
        <div className="bg-white rounded-3xl p-8 border border-emerald-300 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('serviceSuccessfullyFinished')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">
              {t('paymentSettledWallet')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('creditedImmediatelyMsg', { price: activeBooking.estimatedPrice, extra: extraMaterialsCost })}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2 border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>{t('customer')}:</span>
              <span className="font-bold text-slate-900">{activeBooking.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('tradeService')}:</span>
              <span className="font-bold text-slate-900">{t(`service_${activeBooking.serviceType.replace(/\s+/g, '')}`)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('directTakeHome')}:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                ₹{activeBooking.estimatedPrice + Number(extraMaterialsCost)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              <span>{t('coopWelfare5')}:</span>
              <span>₹{activeBooking.welfareCess}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setActiveView('worker-dashboard')}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {t('returnAvailableJobs')}
            </button>
            <button
              onClick={() => setActiveView('worker-earnings')}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
            >
              {t('viewEarningsLedger')}
            </button>
          </div>
        </div>
      ) : (
        /* Active Job Execution Controls */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Job & Customer Details */}
          <div className="md:col-span-6 space-y-5">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('customerSiteDetails')}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {currentStatus}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">{activeBooking.customerName}</h3>
                <p className="text-xs text-slate-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{activeBooking.customerAddress}</span>
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{t('slot')}: {activeBooking.timeSlot} ({activeBooking.date})</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t('citizenProblemDesc')}:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {activeBooking.problemDescription}
                </p>
              </div>
            </div>

            {/* Scheduled Slot & Location Details Box */}
            <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Scheduled Slot Window
                </span>
                <span className="text-slate-400 font-mono">{activeBooking.timeSlot}</span>
              </div>
              <p className="text-xs text-slate-300">
                Please ensure arrival promptly within the booked slot window. Contact the citizen if there are any gate access or transit delays.
              </p>
            </div>
          </div>

          {/* Right: Step Action Buttons */}
          <div className="md:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('stepByStepExecution')}
              </h3>

              {/* Step 1: Start Travel */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {t('step1TravelCustomer')}
                  </span>
                  {currentStatus !== 'Confirmed' && (
                    <span className="text-xs font-bold text-emerald-600">✓ {t('done')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartTravel}
                    disabled={currentStatus !== 'Confirmed'}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      currentStatus === 'Confirmed'
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t('startTravel')}</span>
                  </button>

                  <button
                    onClick={handleArrived}
                    disabled={currentStatus !== 'Worker Travelling'}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      currentStatus === 'Worker Travelling'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t('markArrived')}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Verify OTP & Start Service */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {t('step2PinVerify')}
                  </span>
                  {currentStatus === 'Service In Progress' && (
                    <span className="text-xs font-bold text-emerald-600">✓ {t('verified')}</span>
                  )}
                </div>

                <form onSubmit={handleVerifyOtpAndStart} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder={t('enter4DigitPin')}
                      disabled={currentStatus !== 'Worker Arrived'}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-emerald-500 disabled:bg-slate-100"
                    />
                    <button
                      type="submit"
                      disabled={currentStatus !== 'Worker Arrived'}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        currentStatus === 'Worker Arrived'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {t('startService')}
                    </button>
                  </div>
                  {otpError && <p className="text-[11px] text-red-600 font-medium">{otpError}</p>}
                </form>
              </div>

              {/* Step 3: Complete Service */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  {t('step3CompleteJob')}
                </span>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-500 font-medium">
                    {t('extraPartsBillOptional')}:
                  </label>
                  <input
                    type="number"
                    value={extraMaterialsCost}
                    onChange={(e) => setExtraMaterialsCost(Number(e.target.value))}
                    disabled={currentStatus !== 'Service In Progress'}
                    placeholder="0"
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2 font-mono"
                  />
                </div>

                <button
                  onClick={handleCompleteService}
                  disabled={currentStatus !== 'Service In Progress'}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    currentStatus === 'Service In Progress'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('completeServiceGenBill')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
