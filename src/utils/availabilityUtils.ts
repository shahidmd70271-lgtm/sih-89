import { AvailabilitySlot, Booking, DateSlotOverride, Worker } from '../types';

export const DEFAULT_BASE_SLOTS: AvailabilitySlot[] = [
  { id: 'slot-1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
  { id: 'slot-2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
  { id: 'slot-3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
  { id: 'slot-4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
  { id: 'slot-5', startTime: '06:00 PM', endTime: '07:00 PM', label: '06:00 PM – 07:00 PM', isBooked: false, isAvailable: true },
];

export const ALL_DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DEFAULT_WORKING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Normalizes user/system date strings into a canonical ISO date key: `YYYY-MM-DD`.
 * Handles 'Today', 'Tomorrow', ISO strings, and standard calendar dates.
 */
export function normalizeDateKey(dateInput: string): string {
  if (!dateInput) return new Date().toISOString().split('T')[0];

  const trimmed = dateInput.trim();
  const lower = trimmed.toLowerCase();

  const now = new Date();
  if (lower === 'today' || lower.startsWith('today')) {
    return now.toISOString().split('T')[0];
  }

  if (lower === 'tomorrow' || lower.startsWith('tomorrow')) {
    const tom = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return tom.toISOString().split('T')[0];
  }

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try parsing date string
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return now.toISOString().split('T')[0];
}

/**
 * Returns the day of the week ('Monday', 'Tuesday', etc.) for a normalized YYYY-MM-DD date.
 */
export function getDayOfWeekFromDateKey(dateKey: string): string {
  const dateObj = new Date(dateKey + 'T12:00:00Z'); // Noon UTC to prevent timezone rollover
  if (isNaN(dateObj.getTime())) return 'Monday';
  return dateObj.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
}

/**
 * Formats a date key into a user-friendly label (e.g. "Monday, Sep 1, 2026")
 */
export function formatDateKeyDisplay(dateKey: string): string {
  const dateObj = new Date(dateKey + 'T12:00:00Z');
  if (isNaN(dateObj.getTime())) return dateKey;
  return dateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * Computes exact slot availability for a specific calendar date and worker.
 *
 * Rules:
 * 1. Base slots are sourced from `worker.availabilitySlots` or `DEFAULT_BASE_SLOTS`.
 * 2. Weekly default: Day must be in `worker.workingDays` (defaulting to Mon-Sat).
 * 3. Date-Specific Override: If an override exists in `worker.dateOverrides` for `(date, slotId)`,
 *    it strictly takes precedence over weekly defaults.
 * 4. Database Bookings: Existing bookings for that date & worker mark the slot as `isBooked` (or `isPending`).
 */
export function computeWorkerSlotsForDate(
  worker: Worker,
  targetDate: string,
  bookings: Booking[] = []
): AvailabilitySlot[] {
  const normalizedDate = normalizeDateKey(targetDate);
  const dayOfWeek = getDayOfWeekFromDateKey(normalizedDate);

  const activeWorkingDays = worker.workingDays && worker.workingDays.length > 0
    ? worker.workingDays
    : DEFAULT_WORKING_DAYS;

  const isDayInWeeklySchedule = activeWorkingDays.includes(dayOfWeek);

  const baseSlots = worker.availabilitySlots && worker.availabilitySlots.length > 0
    ? worker.availabilitySlots
    : DEFAULT_BASE_SLOTS;

  const overrides = worker.dateOverrides || [];

  return baseSlots.map((baseSlot) => {
    // Check for date-specific override
    const override = overrides.find(
      (o) => o.date === normalizedDate && o.slotId === baseSlot.id
    );

    let isAvailable = false;
    let isOverridden = false;

    if (override !== undefined) {
      // Date-specific override takes precedence
      isAvailable = override.isAvailable;
      isOverridden = true;
    } else {
      // Fallback to recurring weekly schedule and base slot availability
      isAvailable = isDayInWeeklySchedule && (baseSlot.isAvailable ?? true);
    }

    // Check if slot is booked or requested in database bookings
    const matchingBooking = bookings.find((b) => {
      if (b.workerId !== worker.id) return false;
      if (b.status === 'cancelled' || b.status === 'rejected') return false;

      const bookingNormalizedDate = normalizeDateKey(b.date || b.booking_date || '');
      const isDateMatch =
        bookingNormalizedDate === normalizedDate ||
        b.date === targetDate ||
        (targetDate === 'Today' && b.date === 'Today') ||
        (targetDate === 'Tomorrow' && b.date === 'Tomorrow');

      if (!isDateMatch) return false;

      const isSlotMatch =
        b.slotId === baseSlot.id ||
        (b.timeSlot && (b.timeSlot === baseSlot.label || b.timeSlot === baseSlot.startTime));

      return isSlotMatch;
    });

    const isBooked = !!matchingBooking && (
      matchingBooking.status === 'accepted' ||
      matchingBooking.status === 'completed' ||
      matchingBooking.status === 'Completed' ||
      matchingBooking.status === 'in_progress' ||
      matchingBooking.status === 'Worker Accepted' ||
      matchingBooking.status === 'Confirmed' ||
      matchingBooking.status === 'Scheduled'
    );

    const isPending = !!matchingBooking && (
      matchingBooking.status === 'requested' ||
      matchingBooking.status === 'Pending' ||
      matchingBooking.status === 'Waiting for Response'
    );

    return {
      ...baseSlot,
      isAvailable: isAvailable && !isBooked && !isPending,
      isBooked,
      isPending,
      isOverridden,
      bookingId: matchingBooking?.id,
      bookedBy: matchingBooking?.customerName,
    };
  });
}

/**
 * Toggles or sets a date-specific slot override for a worker.
 * Returns the new `dateOverrides` array.
 */
export function toggleSlotForDate(
  currentOverrides: DateSlotOverride[] = [],
  targetDate: string,
  slotId: string,
  currentIsAvailable: boolean
): DateSlotOverride[] {
  const normalizedDate = normalizeDateKey(targetDate);
  const newIsAvailable = !currentIsAvailable;

  const existingIndex = currentOverrides.findIndex(
    (o) => o.date === normalizedDate && o.slotId === slotId
  );

  const updated = [...currentOverrides];
  if (existingIndex >= 0) {
    updated[existingIndex] = {
      ...updated[existingIndex],
      isAvailable: newIsAvailable,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated.push({
      date: normalizedDate,
      slotId,
      isAvailable: newIsAvailable,
      updatedAt: new Date().toISOString(),
    });
  }

  return updated;
}
