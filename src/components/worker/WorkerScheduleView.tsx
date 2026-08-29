import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Lock,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvailabilitySlot } from '../../types';

export const WorkerScheduleView: React.FC = () => {
  const { workers, toggleWorkerSlot, setWorkerSlotAvailability, t } = useApp();
  const worker = workers[0]; // Ravi Kumar

  const [workingDays, setWorkingDays] = useState<string[]>(
    worker.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [isSaved, setIsSaved] = useState(false);
  const [newSlotStart, setNewSlotStart] = useState('08:00 AM');
  const [newSlotEnd, setNewSlotEnd] = useState('09:00 AM');
  const [showAddSlot, setShowAddSlot] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleToggleSlot = (slotId: string, currentAvailable: boolean, isBooked?: boolean) => {
    if (isBooked) return; // Cannot toggle booked slots
    toggleWorkerSlot(worker.id, slotId);
  };

  const handleSaveSchedule = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('workerPortalHeader')}</span>
            <span>/</span>
            <span>Availability & Working Slots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Schedule & Time Slots Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define your active service days and configure 1-hour appointment slots for citizens.
          </p>
        </div>

        <button
          onClick={handleSaveSchedule}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Schedule</span>
        </button>
      </div>

      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-2 text-xs text-emerald-950 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Your availability schedule has been updated across the Sahaayak network!</span>
        </div>
      )}

      {/* Working Days Selector */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Weekly Working Days</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the days of the week you are on-duty for dispatch.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {workingDays.length} Days Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
          {daysOfWeek.map((day) => {
            const isWorking = workingDays.includes(day);
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  toggleDay(day);
                  setSelectedDay(day);
                }}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isWorking
                    ? isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                      : 'bg-emerald-50/70 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold truncate">{day.slice(0, 3)}</span>
                <span className={`text-[10px] font-semibold ${isWorking ? (isSelected ? 'text-emerald-100' : 'text-emerald-700') : 'text-slate-400'}`}>
                  {isWorking ? 'Active' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Time Slot Management */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>1-Hour Booking Slots ({selectedDay})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any slot to toggle availability. Booked slots are locked.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Requested
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2"></span> Booked
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ml-2"></span> Off
            </span>
          </div>
        </div>

        {/* Slot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {(worker.availabilitySlots || []).map((slot) => {
            const isBooked = slot.isBooked;
            const isPending = slot.isPending && !isBooked;
            const isAvailable = slot.isAvailable && !isBooked && !isPending;

            return (
              <div
                key={slot.id}
                onClick={() => handleToggleSlot(slot.id, slot.isAvailable, isBooked || isPending)}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  isBooked
                    ? 'bg-blue-50 border-blue-200 text-blue-950 cursor-not-allowed'
                    : isPending
                    ? 'bg-amber-50 border-amber-300 text-amber-950 cursor-pointer shadow-xs'
                    : isAvailable
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 hover:bg-emerald-100/60 cursor-pointer shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300 cursor-pointer'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className={`w-3.5 h-3.5 ${
                        isBooked
                          ? 'text-blue-600'
                          : isPending
                          ? 'text-amber-600'
                          : isAvailable
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold font-mono">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium">
                    {isBooked ? (
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Booked by Citizen
                      </span>
                    ) : isPending ? (
                      <span className="text-amber-800 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" /> Booking Requested
                      </span>
                    ) : isAvailable ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ready for Booking
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Unavailable
                      </span>
                    )}
                  </p>
                </div>

                <div className="shrink-0">
                  {isBooked ? (
                    <span className="px-2.5 py-1 rounded-lg bg-blue-200 text-blue-800 text-[10px] font-bold">
                      LOCKED
                    </span>
                  ) : isPending ? (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-900 text-[10px] font-bold">
                      PENDING
                    </span>
                  ) : (
                    <button
                      type="button"
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                        isAvailable
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {isAvailable ? 'Disable' : 'Enable'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cooperative Duty Guideline Info */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            <strong>NLCF Cooperative Schedule Policy:</strong> Available slots are dynamically matched with citizen requests across nearby societies. Ensure unneeded slots are disabled ahead of time to avoid cancellations and protect your 5-star reputation score.
          </p>
        </div>
      </div>
    </div>
  );
};
