import React, { useState, useMemo } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvailabilitySlot } from '../../types';
import {
  computeWorkerSlotsForDate,
  formatDateKeyDisplay,
  getDayOfWeekFromDateKey,
  normalizeDateKey,
  ALL_DAYS_OF_WEEK,
  DEFAULT_WORKING_DAYS,
} from '../../utils/availabilityUtils';

export const WorkerScheduleView: React.FC = () => {
  const {
    currentWorker,
    bookings,
    toggleWorkerDateSlot,
    setWorkerWorkingDays,
    t,
  } = useApp();
  const worker = currentWorker;

  if (!worker) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">No Worker Profile Found</h3>
        <p className="text-xs text-slate-500">Please register or log in with your worker credentials.</p>
      </div>
    );
  }

  // Generate upcoming 14 calendar dates for quick selection
  const upcomingDates = useMemo(() => {
    const dates: { dateKey: string; label: string; weekday: string; dayNum: string; isToday: boolean; isTomorrow: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = d.toISOString().split('T')[0];
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate().toString();
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });

      dates.push({
        dateKey,
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `${weekday}, ${monthStr} ${dayNum}`,
        weekday,
        dayNum,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return dates;
  }, []);

  const [selectedDateKey, setSelectedDateKey] = useState<string>(upcomingDates[0].dateKey);
  const [workingDays, setWorkingDays] = useState<string[]>(
    worker.workingDays || DEFAULT_WORKING_DAYS
  );
  const [isSaved, setIsSaved] = useState(false);

  const selectedWeekday = useMemo(() => {
    return getDayOfWeekFromDateKey(selectedDateKey);
  }, [selectedDateKey]);

  // Compute exact slots for the selected date
  const computedSlots = useMemo(() => {
    return computeWorkerSlotsForDate(worker, selectedDateKey, bookings);
  }, [worker, selectedDateKey, bookings]);

  const toggleDay = async (day: string) => {
    let updated: string[];
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        updated = workingDays.filter((d) => d !== day);
      } else {
        return; // keep at least 1 day active
      }
    } else {
      updated = [...workingDays, day];
    }
    setWorkingDays(updated);
    await setWorkerWorkingDays(worker.id, updated);
  };

  const handleToggleSlot = async (slotId: string, isAvailable: boolean, isBooked?: boolean) => {
    if (isBooked) return; // Cannot toggle booked slots
    await toggleWorkerDateSlot(worker.id, selectedDateKey, slotId);
  };

  const handleSaveSchedule = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const activeOverridesForDate = useMemo(() => {
    return (worker.dateOverrides || []).filter((o) => o.date === selectedDateKey);
  }, [worker.dateOverrides, selectedDateKey]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 mb-1">
            <span>{t('workerPortalHeader') || 'Worker Portal'}</span>
            <span>/</span>
            <span>Availability & Working Slots</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Schedule & Time Slots Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure calendar date-specific availability and recurring weekly working days for citizen dispatch.
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
          <span>Your availability schedule has been synced and updated in Supabase!</span>
        </div>
      )}

      {/* 1. Upcoming Calendar Date Carousel Selector */}
      <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-emerald-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-400" />
              Calendar Date Selector
            </span>
            <h3 className="text-lg font-black text-white">
              Managing Slots for: <span className="text-emerald-300">{formatDateKeyDisplay(selectedDateKey)}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDateKey}
              onChange={(e) => {
                if (e.target.value) setSelectedDateKey(e.target.value);
              }}
              className="bg-slate-800 border border-emerald-600/50 text-white text-xs px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* 14-Day Horizontal Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {upcomingDates.map((item) => {
            const isSelected = selectedDateKey === item.dateKey;
            const itemDay = getDayOfWeekFromDateKey(item.dateKey);
            const isWorking = workingDays.includes(itemDay);

            return (
              <button
                key={item.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(item.dateKey)}
                className={`flex flex-col items-center justify-center p-3 min-w-[76px] rounded-2xl border transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-lg shadow-emerald-500/30 scale-105'
                    : isWorking
                    ? 'bg-slate-800/80 hover:bg-slate-800 text-white border-slate-700'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-slate-950' : 'text-slate-400'}`}>
                  {item.weekday}
                </span>
                <span className="text-base font-black my-0.5">{item.dayNum}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? 'bg-slate-900 text-emerald-300'
                      : item.isToday
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : isWorking
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.isToday ? 'Today' : item.isTomorrow ? 'Tmrw' : isWorking ? 'On-Duty' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Daily Time Slot Management for the Selected Date */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>1-Hour Time Slots for {formatDateKeyDisplay(selectedDateKey)}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Changes made here apply <strong>ONLY to {selectedWeekday}, {selectedDateKey}</strong> and do not modify other dates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Requested
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2"></span> Booked
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 ml-2"></span> Off
            </span>
          </div>
        </div>

        {/* Date Overrides Active Notice */}
        {activeOverridesForDate.length > 0 && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-950">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Date-Specific Override Active:</strong> You have custom availability overrides configured for {formatDateKeyDisplay(selectedDateKey)}.
            </span>
          </div>
        )}

        {/* Slot Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {computedSlots.map((slot) => {
            const isBooked = slot.isBooked;
            const isPending = slot.isPending && !isBooked;
            const isAvailable = slot.isAvailable && !isBooked && !isPending;
            const isOverridden = slot.isOverridden;

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

                  {isOverridden && (
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded inline-block">
                      Date Override
                    </span>
                  )}
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
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
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
      </div>

      {/* 3. Recurring Weekly Working Days Schedule */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Recurring Weekly Working Days (Default Schedule)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Days when you are normally on-duty. Date-specific overrides will still take precedence.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {workingDays.length} Days Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 pt-1">
          {ALL_DAYS_OF_WEEK.map((day) => {
            const isWorking = workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  isWorking
                    ? 'bg-emerald-50/80 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-xs font-bold truncate">{day.slice(0, 3)}</span>
                <span className={`text-[10px] font-semibold ${isWorking ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {isWorking ? 'Active' : 'Off'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cooperative Policy Banner */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <p>
          <strong>NLCF Cooperative Schedule Policy:</strong> Your calendar availability is synced with citizen bookings across nearby urban zones. Date-specific overrides enable you to take off specific hours without altering your weekly recurring shifts.
        </p>
      </div>
    </div>
  );
};
