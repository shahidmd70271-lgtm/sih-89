import React from 'react';
import {
  CheckCircle2,
  X,
  Clock,
  MapPin,
  Calendar,
  DollarSign,
  User,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';

interface WorkerBookingAcceptModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAccept: (bookingId: string) => void;
}

export const WorkerBookingAcceptModal: React.FC<WorkerBookingAcceptModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirmAccept,
}) => {
  const { t } = useApp();

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-6 relative">
          <button
            id="close-accept-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-emerald-800/80 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/90 text-emerald-200 text-xs font-semibold mb-2 border border-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Confirm Service Acceptance</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Accept this service request?
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            Request #{booking.id} • {booking.isEmergency ? '🚨 Emergency Request' : 'Standard Scheduled Booking'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Service & Customer Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ServiceIcon name={booking.serviceType} className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                    {booking.serviceType}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {booking.problemDescription}
                  </h3>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Your Earnings
                </span>
                <span className="text-xl font-black text-emerald-700">
                  ₹{booking.estimatedPrice}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200/80 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Customer: <strong className="text-slate-900">{booking.customerName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {booking.customerAddress} ({booking.distanceKm || 1.2} km)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Date: <strong className="text-slate-900">{booking.date}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Time: <strong className="text-slate-900">{booking.timeSlot}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Upon confirmation, this time slot will be reserved for you. The customer will be immediately notified with your verification credentials and direct contact details.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="cancel-accept-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-accept-booking-btn"
              type="button"
              onClick={() => {
                onConfirmAccept(booking.id);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
