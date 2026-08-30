import { BookingStatus } from '../types';

export function normalizeBookingStatus(rawStatus?: string): BookingStatus {
  if (!rawStatus) return 'requested';
  const s = rawStatus.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'accepted' || s === 'worker_accepted' || s === 'confirmed' || s === 'scheduled') return 'accepted';
  if (s === 'travelling' || s === 'worker_travelling' || s === 'in_transit') return 'travelling';
  if (s === 'arrived' || s === 'worker_arrived') return 'arrived';
  if (s === 'in_progress' || s === 'service_in_progress') return 'in_progress';
  if (s === 'completed') return 'completed';
  if (s === 'paid') return 'paid';
  if (s === 'rejected' || s === 'worker_rejected') return 'rejected';
  if (s === 'cancelled') return 'cancelled';
  if (s === 'requested' || s === 'pending' || s === 'waiting_for_response') return 'requested';
  return rawStatus as BookingStatus;
}
