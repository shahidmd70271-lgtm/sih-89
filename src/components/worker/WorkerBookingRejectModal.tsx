import React, { useState } from 'react';
import {
  XCircle,
  X,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  User,
  Check,
} from 'lucide-react';
import { Booking } from '../../types';
import { useApp } from '../../context/AppContext';
import { ServiceIcon } from '../common/ServiceIcon';

interface WorkerBookingRejectModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReject: (bookingId: string, reason: string) => void;
}

const REJECTION_REASONS = [
  "I'm not available at this time slot",
  'Location is too far away (> 5 km)',
  'Schedule / Time conflict with ongoing job',
  'Outside my specialized trade skill area',
  'Health or personal emergency',
  'Other reason',
];

export const WorkerBookingRejectModal: React.FC<WorkerBookingRejectModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirmReject,
}) => {
  const { t } = useApp();
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen || !booking) return null;

  const finalReason =
    selectedReason === 'Other reason' && customReason.trim()
      ? customReason.trim()
      : selectedReason;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            id="close-reject-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/60 text-red-200 text-xs font-semibold mb-2 border border-red-700">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Decline Service Request</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Reject this service request?
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Request #{booking.id} • {booking.customerName}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Brief info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <ServiceIcon name={booking.serviceType} className="w-4 h-4 text-emerald-600" />
                {booking.serviceType}
              </span>
              <span className="font-bold text-emerald-700">₹{booking.estimatedPrice}</span>
            </div>
            <p className="text-slate-600 italic">"{booking.problemDescription}"</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-[11px] pt-1">
              <span>📅 {booking.date}</span>
              <span>⏰ {booking.timeSlot}</span>
              <span>📍 {booking.customerAddress}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold text-slate-900">
              Please select a reason for declining:
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600 focus:ring-emerald-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Other reason' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify your reason (optional)..."
                rows={2}
                className="w-full mt-2 p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            )}
          </div>

          {/* Notice */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              Declining will free this slot on your calendar and automatically allow the customer to select another verified cooperative worker.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              id="cancel-reject-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-reject-booking-btn"
              type="button"
              onClick={() => {
                onConfirmReject(booking.id, finalReason);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-red-700 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Confirm Reject</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
