import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  Zap,
  Wrench,
  KeyRound,
  Cpu,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceType, Worker, Booking } from '../../types';
import { OpenStreetMapView, LocationCoordinates } from '../maps/OpenStreetMapView';

export const EmergencyBookingModal: React.FC = () => {
  const {
    workers,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    createNewBooking,
    setActiveBookingById,
    setActiveView,
    t,
  } = useApp();

  const [selectedEmergencyCategory, setSelectedEmergencyCategory] = useState<ServiceType>('Plumbing');
  const [isScanning, setIsScanning] = useState(false);
  const [matchedWorkers, setMatchedWorkers] = useState<Worker[]>([]);
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [notes, setNotes] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isEmergencyModalOpen) return null;

  const emergencyServices: { id: ServiceType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'Plumbing',
      label: t('emergencyPlumberTitle'),
      icon: <Wrench className="w-5 h-5" />,
      desc: t('emergencyPlumberDesc'),
    },
    {
      id: 'Electrical',
      label: t('emergencyElectricianTitle'),
      icon: <Zap className="w-5 h-5" />,
      desc: t('emergencyElectricianDesc'),
    },
    {
      id: 'Locksmith & Security',
      label: t('emergencyLocksmithTitle'),
      icon: <KeyRound className="w-5 h-5" />,
      desc: t('emergencyLocksmithDesc'),
    },
    {
      id: 'Appliance Repair',
      label: t('emergencyApplianceTitle'),
      icon: <Cpu className="w-5 h-5" />,
      desc: t('emergencyApplianceDesc'),
    },
  ];

  const handleLocationSelected = (loc: LocationCoordinates) => {
    setCoordinates(loc);
    if (loc.address) {
      setAddress(loc.address);
    }
  };

  const handleScanForNearest = () => {
    setIsScanning(true);

    setTimeout(() => {
      const isAvailableVerifiedWorker = (w: Worker) =>
        Boolean(
          w.isVerified &&
          (w.verificationStatus === 'Verified' || w.verificationStatus === 'approved') &&
          !(w as any).is_removed &&
          (w as any).status !== 'removed' &&
          (w as any).status !== 'inactive'
        );

      const available = workers
        .filter(
          (w) =>
            isAvailableVerifiedWorker(w) &&
            w.skill === selectedEmergencyCategory &&
            (w.availability === 'Available Now' || w.emergencyAvailable)
        )
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 3);

      setMatchedWorkers(available);
      setIsScanning(false);
    }, 800);
  };

  const handleInstantDispatch = async (worker: Worker) => {
    const booking = await createNewBooking({
      workerId: worker.id,
      customerAddress: address.trim() || coordinates?.address || 'Current Location',
      latitude: coordinates?.lat,
      longitude: coordinates?.lng,
      customerCoordinates: coordinates ? { lat: coordinates.lat, lng: coordinates.lng } : undefined,
      date: 'Today (Immediate SOS)',
      timeSlot: 'Immediate (Next 30 Mins)',
      problemDescription: `[EMERGENCY SOS] ${selectedEmergencyCategory}: ${notes || 'Immediate assistance requested'}`,
      estimatedPrice: worker.basePricePerHour,
      isEmergency: true,
    });

    setConfirmedBooking(booking);
  };

  const handleClose = () => {
    setIsEmergencyModalOpen(false);
    setConfirmedBooking(null);
    setMatchedWorkers([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-red-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-red-300 relative my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Emergency Header */}
        <div className="bg-linear-to-r from-red-600 via-rose-700 to-red-800 text-white p-6 sm:p-8 rounded-t-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-xs">
            <span className="flex h-2 w-2 rounded-full bg-white animate-ping"></span>
            <span>{t('emergencyRapidResponseUnit')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-amber-300" />
            <span>{t('needHelpImmediately')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-red-100">
            {t('rapidResponseSubtitle')}
          </p>
        </div>

        {confirmedBooking ? (
          /* SUCCESS STATE: Emergency Dispatched */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-200">
                🚨 Immediate SOS Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900 pt-2">
                Emergency Request Dispatched!
              </h2>
              <p className="text-xs text-slate-500">
                A nearby verified worker has been allocated for priority emergency response.
              </p>
            </div>

            {/* Emergency Booking Details */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
                <img
                  src={confirmedBooking.workerAvatar}
                  alt={confirmedBooking.workerName}
                  className="w-13 h-13 rounded-2xl object-cover border border-red-400 shadow-xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {confirmedBooking.workerName}
                    </h4>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ {t('verified')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {confirmedBooking.workerSkill} Emergency Dispatch
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Booking ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs">
                    {confirmedBooking.id}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Response Window
                  </span>
                  <span className="font-bold text-red-600 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Priority (within 30 mins)
                  </span>
                </div>
              </div>

              {/* Security OTP */}
              <div className="bg-emerald-600 text-white rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">
                    Start-of-Service Security OTP
                  </span>
                  <p className="text-[11px] text-emerald-100">
                    Share only after worker arrives at your doorstep
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-mono font-black tracking-widest bg-white/20 px-3 py-1 rounded-lg">
                    {confirmedBooking.otpCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setConfirmedBooking(null);
                  setActiveView('my-bookings');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>View in My Bookings</span>
              </button>

              <button
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setConfirmedBooking(null);
                  setActiveView('customer-dashboard');
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Modal Body */
          <div className="p-6 sm:p-8 space-y-6">
            {/* Emergency Service Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('selectUrgentService')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {emergencyServices.map((srv) => {
                  const isSelected = selectedEmergencyCategory === srv.id;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => {
                        setSelectedEmergencyCategory(srv.id);
                        setMatchedWorkers([]);
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 ring-2 ring-red-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {srv.icon}
                      </div>
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isSelected ? 'text-red-950' : 'text-slate-800'
                          }`}
                        >
                          {srv.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                          {srv.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Emergency OpenStreetMap Location View */}
            <div className="space-y-2">
              <OpenStreetMapView
                selectedLocation={coordinates}
                onLocationSelect={handleLocationSelected}
                interactiveSelect={true}
                searchable={true}
                destinationLabel="Emergency SOS Location"
                height="180px"
              />
            </div>

            {/* Current Address & Problem Note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  <span>{t('yourLocationGps')}</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-red-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {t('briefSituationSummary')}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('situationSummaryPlaceholder')}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-red-500"
                />
              </div>
            </div>

            {/* Radar Scan / Find Nearest Button */}
            {matchedWorkers.length === 0 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleScanForNearest}
                  disabled={isScanning}
                  className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isScanning ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>{t('scanningNearbyWorkers')}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t('findNearestAvailableWorker')}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Matched Nearest Available Workers List */}
            {matchedWorkers.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {t('topNearestWorkers')}
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ {t('readyToDepart')}
                  </span>
                </div>

                <div className="space-y-3">
                  {matchedWorkers.map((worker, idx) => {
                    const skillKey = `service_${worker.skill.replace(/[\s&]+/g, '')}`;
                    const translatedSkill = t(skillKey);
                    return (
                      <div
                        key={worker.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <img
                              src={worker.avatar}
                              alt={worker.name}
                              className="w-12 h-12 rounded-xl object-cover border border-emerald-400"
                            />
                            <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                              #{idx + 1}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-sm font-bold text-slate-900">{worker.name}</h5>
                              <span className="text-[10px] text-emerald-700 font-bold">✓ {t('verified')}</span>
                            </div>
                            <p className="text-xs text-slate-600">
                              {translatedSkill} • {t('distanceAwayText', { distance: worker.distanceKm })} • ⭐ {worker.rating}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {worker.cooperativeName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-xs font-bold text-red-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{t('etaMinutesText', { minutes: Math.round(worker.distanceKm * 4 + 4) })}</span>
                            </div>
                            <span className="text-[10px] text-slate-500">₹{worker.basePricePerHour}/hr</span>
                          </div>

                          <button
                            onClick={() => handleInstantDispatch(worker)}
                            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Confirm SOS Dispatch</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
