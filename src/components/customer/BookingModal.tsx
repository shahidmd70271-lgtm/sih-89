import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
  CreditCard,
  Star,
  Award,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Booking, AvailabilitySlot } from '../../types';
import { OpenStreetMapView, LocationCoordinates } from '../maps/OpenStreetMapView';
import { computeWorkerSlotsForDate } from '../../utils/availabilityUtils';

export const BookingModal: React.FC = () => {
  const {
    selectedWorker,
    isBookingModalOpen,
    setIsBookingModalOpen,
    createNewBooking,
    bookings,
    setActiveView,
    t,
  } = useApp();

  const [dateType, setDateType] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('2026-08-31');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-1');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<LocationCoordinates | null>(null);
  const [problemDescription, setProblemDescription] = useState('');
  const [addressError, setAddressError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  if (!isBookingModalOpen || !selectedWorker) return null;

  const formattedDate =
    dateType === 'today'
      ? 'Today'
      : dateType === 'tomorrow'
      ? 'Tomorrow'
      : customDate;

  // Real date-specific slot availability computed from weekly schedule, date overrides & database bookings
  const activeSlots = computeWorkerSlotsForDate(selectedWorker, formattedDate, bookings);

  const selectedSlot = activeSlots.find((s) => s.id === selectedSlotId) || activeSlots.find((s) => !s.isBooked && s.isAvailable) || activeSlots[0];

  const basePrice = selectedWorker.basePricePerHour;
  const platformFee = 15;
  const welfareCess = Math.round(basePrice * 0.05); // 5% cooperative welfare & accident fund
  const totalAmount = basePrice + platformFee + welfareCess;

  const handleLocationSelected = (loc: LocationCoordinates) => {
    setCoordinates(loc);
    if (loc.address) {
      setAddress(loc.address);
      setAddressError('');
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedSlot.isBooked || !selectedSlot.isAvailable) {
      return;
    }

    if (!address.trim()) {
      setAddressError('Please enter your service address or select a location on the map.');
      return;
    }

    const finalLat = coordinates?.lat || 28.5700;
    const finalLng = coordinates?.lng || 77.2200;

    const created = await createNewBooking({
      workerId: selectedWorker.id,
      date: formattedDate,
      timeSlot: selectedSlot.label,
      slotId: selectedSlot.id,
      customerAddress: address.trim(),
      latitude: finalLat,
      longitude: finalLng,
      customerCoordinates: { lat: finalLat, lng: finalLng },
      problemDescription: problemDescription || `General service for ${selectedWorker.skill}`,
      estimatedPrice: basePrice,
      platformFee,
      welfareCess,
      totalAmount,
      isEmergency: false,
    });

    setConfirmedBooking(created);
  };

  const handleViewMyBookings = () => {
    setIsBookingModalOpen(false);
    setConfirmedBooking(null);
    setActiveView('my-bookings');
  };

  const handleClose = () => {
    setIsBookingModalOpen(false);
    setConfirmedBooking(null);
  };

  const skillKey = `service_${selectedWorker.skill.replace(/[\s&]+/g, '')}`;
  const translatedSkill = t(skillKey);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedBooking ? (
          /* SUCCESS STATE: Booking Confirmed Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ✓ Cooperative Slot Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900 pt-2">
                Booking Confirmed!
              </h2>
              <p className="text-xs text-slate-500">
                Your service appointment has been reserved with verified cooperative worker.
              </p>
            </div>

            {/* Booking Details Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4">
              {/* Worker Header */}
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-200">
                <img
                  src={confirmedBooking.workerAvatar}
                  alt={confirmedBooking.workerName}
                  className="w-13 h-13 rounded-2xl object-cover border border-emerald-400 shadow-xs"
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
                    {translatedSkill} • {selectedWorker.cooperativeName}
                  </p>
                </div>
              </div>

              {/* Slot & Booking Metadata Grid */}
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
                    Status
                  </span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Scheduled
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date
                  </span>
                  <span className="font-bold text-slate-800">
                    {confirmedBooking.date}
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-emerald-200 bg-emerald-50/50">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Booked Time Slot
                  </span>
                  <span className="font-black text-emerald-950 text-xs">
                    ⏰ {confirmedBooking.timeSlot}
                  </span>
                </div>
              </div>

              {/* Security OTP Box */}
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

              {/* Payment Summary */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Total Escrow Amount:</span>
                <span className="font-black text-slate-900 text-sm">₹{confirmedBooking.totalAmount} (Protected)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                id="booking-view-my-bookings-btn"
                onClick={handleViewMyBookings}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>View My Bookings</span>
              </button>

              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setConfirmedBooking(null);
                  setActiveView('customer-dashboard');
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE: Worker Details & Slot Selection */
          <form onSubmit={handleConfirm} className="p-6 sm:p-8 space-y-6">
            {/* Modal Title */}
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                Labour Cooperative Verified Booking
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Book a Service Slot
              </h2>
              <p className="text-xs text-slate-500">
                Select your preferred date and 1-hour service slot with {selectedWorker.name}.
              </p>
            </div>

            {/* WORKER DETAILS SUMMARY CARD (User requirement: Worker name, Skill, Rating, Experience, Verification status, Service price, Location/distance) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-start gap-3.5">
                <img
                  src={selectedWorker.avatar}
                  alt={selectedWorker.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-emerald-400 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {selectedWorker.name}
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      ✓ {t('verified')}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-emerald-700">
                    {translatedSkill} Specialist
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedWorker.rating} ({selectedWorker.reviewsCount})
                    </span>
                    <span>•</span>
                    <span className="font-medium text-slate-700">
                      {selectedWorker.experienceYears} yrs experience
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedWorker.distanceKm} km away ({selectedWorker.location})
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {selectedWorker.cooperativeName}
                </span>
                <span className="font-black text-slate-900 text-sm">
                  ₹{selectedWorker.basePricePerHour}<span className="text-xs font-normal text-slate-500">/hr</span>
                </span>
              </div>
            </div>

            {/* STEP 1: DATE SELECTION */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                1. Select Date
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setDateType('today')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    dateType === 'today'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>Today</div>
                  <div className={`text-[10px] font-normal ${dateType === 'today' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    29 Aug
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDateType('tomorrow')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    dateType === 'tomorrow'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>Tomorrow</div>
                  <div className={`text-[10px] font-normal ${dateType === 'tomorrow' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    30 Aug
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDateType('custom')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    dateType === 'custom'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>Pick Date</div>
                  <div className={`text-[10px] font-normal ${dateType === 'custom' ? 'text-emerald-100' : 'text-slate-400'}`}>
                    Other
                  </div>
                </button>
              </div>

              {dateType === 'custom' && (
                <div className="pt-1">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-900 focus:outline-emerald-500"
                    min="2026-08-29"
                  />
                </div>
              )}
            </div>

            {/* STEP 2: AVAILABLE TIME SLOTS (User requirement: Selectable slot cards/buttons: Available (green), Booked (grayed out/disabled), Selected (highlighted)) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  2. Available Time Slots ({formattedDate})
                </label>
                <span className="text-[11px] text-slate-400">1-hour slots</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id && !slot.isBooked && slot.isAvailable;
                  const isBooked = slot.isBooked || !slot.isAvailable;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isBooked
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                          : isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 font-bold shadow-xs cursor-pointer'
                          : 'bg-white border-emerald-200 hover:border-emerald-400 text-slate-800 cursor-pointer hover:bg-emerald-50/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            isBooked
                              ? 'bg-slate-300'
                              : isSelected
                              ? 'bg-emerald-600 ring-2 ring-emerald-200'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="text-xs font-medium">{slot.label}</span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isBooked
                            ? 'bg-slate-200 text-slate-500'
                            : isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isBooked ? 'Booked' : isSelected ? 'Selected' : 'Available'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: ADDRESS & GOOGLE MAP LOCATION PICKER */}
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    3. Service Location & Address
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Drag pin or search to set exact location
                  </span>
                </label>

                {/* OpenStreetMap Interactive Location Selector */}
                <OpenStreetMapView
                  selectedLocation={coordinates}
                  onLocationSelect={handleLocationSelected}
                  interactiveSelect={true}
                  searchable={true}
                  destinationLabel="Your Service Address"
                  height="220px"
                />

                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (e.target.value.trim()) setAddressError('');
                  }}
                  placeholder="House/Flat number, building, landmark, locality"
                  className={`w-full text-xs bg-slate-50 border rounded-xl px-3.5 py-2.5 text-slate-900 font-medium ${
                    addressError
                      ? 'border-red-400 focus:outline-red-500 bg-red-50/40'
                      : 'border-slate-200 focus:outline-emerald-500'
                  }`}
                  required
                />
                {addressError && (
                  <p className="text-[11px] text-red-600 font-medium">{addressError}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  4. Problem Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="Describe the issue (e.g. leaking kitchen pipeline, tap replacement, switch repair...)"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-emerald-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* FAIR WAGE PRICING BREAKDOWN */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Cooperative Standard Wage (1 hr slot):</span>
                <span className="font-semibold text-slate-900">₹{basePrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Welfare Cess & ₹5L Insurance:</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="font-semibold text-slate-900">+ ₹{welfareCess}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Platform Tech Fee:</span>
                <span className="font-semibold text-slate-900">+ ₹{platformFee}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-sm text-slate-900">
                <span>Total Escrow Amount:</span>
                <span className="text-emerald-700 text-base font-black">₹{totalAmount}</span>
              </div>
              <p className="text-[10px] text-slate-500 italic pt-0.5">
                Funds remain safe in Escrow and are only released upon your OTP verification after job completion.
              </p>
            </div>

            {/* CONFIRM BUTTON */}
            <button
              type="submit"
              disabled={!selectedSlot || selectedSlot.isBooked || !selectedSlot.isAvailable}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm & Book Slot ({selectedSlot?.label || 'Select Slot'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
