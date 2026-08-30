import React, { useState, useEffect } from 'react';
import {
  Navigation,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  MessageSquare,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookingStatus, PaymentMode } from '../../types';
import { normalizeBookingStatus } from '../../utils/statusUtils';
import { OpenStreetMapView, LocationCoordinates } from '../maps/OpenStreetMapView';
import { isValidCoordinate } from '../../utils/mapUtils';

export const WorkerActiveJobTracker: React.FC = () => {
  const {
    activeBooking,
    updateBookingStatus,
    verifyOtpAndStartService,
    recordPaymentAndCompleteJob,
    confirmPaymentReceived,
    setIsMessagesModalOpen,
    setIsCallModalOpen,
    setActiveView,
    t,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [extraMaterialsCost, setExtraMaterialsCost] = useState(0);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<PaymentMode>('Online');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [serviceCompletedSuccess, setServiceCompletedSuccess] = useState(false);
  const [workerCoords, setWorkerCoords] = useState<LocationCoordinates | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (isValidCoordinate(pos.coords.latitude, pos.coords.longitude)) {
            setWorkerCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {
          setWorkerCoords(null);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

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

  // Explicit Workflow State Machine:
  // accepted -> travelling -> arrived -> in_progress -> completed
  const normalizedStatus = normalizeBookingStatus(activeBooking.status);

  const isAccepted = normalizedStatus === 'accepted';
  const isTravelling = normalizedStatus === 'travelling';
  const isArrived = normalizedStatus === 'arrived';
  const isInProgress = normalizedStatus === 'in_progress';
  const isCompleted = normalizedStatus === 'completed' || normalizedStatus === 'paid';

  // Step completion indicators
  const isStep1Done = isArrived || isInProgress || isCompleted;
  const isStep2Done = isInProgress || isCompleted;
  const isStep3Done = isCompleted;

  const handleStartTravel = async () => {
    if (!activeBooking) return;
    await updateBookingStatus(activeBooking.id, 'travelling');
  };

  const handleArrived = async () => {
    if (!activeBooking) return;
    await updateBookingStatus(activeBooking.id, 'arrived');
  };

  const handleVerifyOtpAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setOtpError('Please enter the 4-digit OTP provided by the customer.');
      return;
    }
    const result = await verifyOtpAndStartService(activeBooking.id, enteredOtp);
    if (result.success) {
      setOtpError('');
    } else {
      setOtpError(result.message || 'Invalid verification PIN. Please ask customer for the OTP.');
    }
  };

  const handleCompleteService = async () => {
    await recordPaymentAndCompleteJob(activeBooking.id, selectedPaymentMode, Number(extraMaterialsCost) || 0);
    setServiceCompletedSuccess(true);
  };

  const handleConfirmPaymentReceived = async () => {
    await confirmPaymentReceived(activeBooking.id);
    setIsPaymentConfirmed(true);
  };

  const totalCalculated = activeBooking.estimatedPrice + Number(extraMaterialsCost || 0);

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
        /* Completed invoice summary & Payment Confirmation */
        <div className="bg-white rounded-3xl p-8 border border-emerald-300 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {t('serviceSuccessfullyFinished')}
            </span>
            <h2 className="text-2xl font-black text-slate-900 pt-2">
              Payment Record & Confirmation
            </h2>
            <p className="text-xs text-slate-500">
              Service completed and recorded under Labour Cooperative Society ledger.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 max-w-md mx-auto text-left text-xs space-y-2.5 border border-slate-200">
            <div className="flex justify-between text-slate-600">
              <span>{t('customer')}:</span>
              <span className="font-bold text-slate-900">{activeBooking.customerName}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('tradeService')}:</span>
              <span className="font-bold text-slate-900">{t(`service_${activeBooking.serviceType.replace(/\s+/g, '')}`)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                {selectedPaymentMode === 'Online' ? (
                  <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                )}
                {selectedPaymentMode}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{t('directTakeHome')}:</span>
              <span className="font-extrabold text-emerald-700 text-sm">
                ₹{totalCalculated}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
              <span>{t('coopWelfare5')}:</span>
              <span>₹{activeBooking.welfareCess}</span>
            </div>
          </div>

          {/* Payment Received Confirmation Box */}
          <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-950">Worker Payment Verification</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isPaymentConfirmed || activeBooking.paymentStatus === 'Settled to Worker'
                  ? 'bg-emerald-200 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {isPaymentConfirmed || activeBooking.paymentStatus === 'Settled to Worker'
                  ? 'Payment Verified ✓'
                  : 'Awaiting Confirmation'}
              </span>
            </div>

            {!(isPaymentConfirmed || activeBooking.paymentStatus === 'Settled to Worker') ? (
              <button
                onClick={handleConfirmPaymentReceived}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Payment Received (₹{totalCalculated})</span>
              </button>
            ) : (
              <p className="text-[11px] text-emerald-800 font-semibold text-center">
                ✓ Payment of ₹{totalCalculated} confirmed received by worker. Statistics and ledger updated.
              </p>
            )}
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
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {normalizedStatus.replace('_', ' ')}
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

              {/* Real OpenStreetMap Destination Route & Directions */}
              {activeBooking.latitude && activeBooking.longitude ? (
                <OpenStreetMapView
                  originLocation={workerCoords}
                  destinationLocation={{
                    lat: activeBooking.latitude,
                    lng: activeBooking.longitude,
                    address: activeBooking.customerAddress,
                  }}
                  destinationLabel={`${activeBooking.customerName}'s Address`}
                  showDirectionsButton={true}
                  searchable={false}
                  interactiveSelect={false}
                  height="190px"
                />
              ) : null}

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
                  {isStep1Done ? (
                    <span className="text-xs font-bold text-emerald-600">✓ {t('done')}</span>
                  ) : isTravelling ? (
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                      In Transit 🚗
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Ready to Start
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    id="btn-start-travel"
                    onClick={handleStartTravel}
                    disabled={!isAccepted}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isAccepted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t('startTravel')}</span>
                  </button>

                  <button
                    id="btn-mark-arrived"
                    onClick={handleArrived}
                    disabled={!isTravelling}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      isTravelling
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer animate-pulse'
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
                  {isStep2Done ? (
                    <span className="text-xs font-bold text-emerald-600">✓ {t('verified')}</span>
                  ) : isArrived ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-pulse">
                      Awaiting PIN
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Locked until arrived</span>
                  )}
                </div>

                <form onSubmit={handleVerifyOtpAndStart} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="input-service-otp"
                      type="text"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      placeholder={t('enter4DigitPin') || 'Enter 4-digit PIN (e.g. 5842)'}
                      disabled={!isArrived}
                      className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-900 focus:outline-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                    />
                    <button
                      id="btn-verify-otp-start"
                      type="submit"
                      disabled={!isArrived}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isArrived
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

              {/* Step 3: Complete Service & Record Payment */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('step3CompleteJob')} & Record Payment
                  </span>
                  {isStep3Done ? (
                    <span className="text-xs font-bold text-emerald-600">✓ {t('done')}</span>
                  ) : isInProgress ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                      Active Service ⚡
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Locked until OTP verified</span>
                  )}
                </div>

                {/* Extra parts */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 font-medium">
                    {t('extraPartsBillOptional') || 'Additional Materials / Parts (₹)'}:
                  </label>
                  <input
                    id="input-extra-materials"
                    type="number"
                    value={extraMaterialsCost}
                    onChange={(e) => setExtraMaterialsCost(Number(e.target.value))}
                    disabled={!isInProgress}
                    placeholder="0"
                    className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2 font-mono disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                {/* Payment Mode Selection */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-600 font-bold block">
                    Payment Mode:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!isInProgress}
                      onClick={() => setSelectedPaymentMode('Online')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        selectedPaymentMode === 'Online'
                          ? 'bg-blue-50 border-blue-400 text-blue-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      } ${!isInProgress ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                      <span>Online (Escrow/UPI)</span>
                    </button>
                    <button
                      type="button"
                      disabled={!isInProgress}
                      onClick={() => setSelectedPaymentMode('Offline')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        selectedPaymentMode === 'Offline'
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      } ${!isInProgress ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Offline (Cash)</span>
                    </button>
                  </div>
                </div>

                <button
                  id="btn-complete-service"
                  onClick={handleCompleteService}
                  disabled={!isInProgress}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isInProgress
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 cursor-pointer'
                      : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Service & Record ₹{totalCalculated}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
