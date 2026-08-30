import {
  Booking,
  BookingStatus,
  CooperativeSociety,
  Payment,
  PaymentMode,
  ServiceType,
  Worker,
  WorkerDocument,
} from '../types';
import { COOPERATIVE_SOCIETIES } from '../data/mockData';
import { ISahaayakService } from './types';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';

const STORAGE_KEY_WORKERS = 'sahaayak_real_workers_db';
const STORAGE_KEY_BOOKINGS = 'sahaayak_real_bookings_db';
const STORAGE_KEY_PAYMENTS = 'sahaayak_real_payments_db';
const STORAGE_KEY_COOPERATIVES = 'sahaayak_real_cooperatives_db';

export const mapDbRowToWorker = (row: any): Worker => {
  const isApproved =
    row.approval_status === 'approved' ||
    row.approval_status === 'Verified' ||
    row.is_verified === true ||
    row.isVerified === true;

  const isRejected =
    row.approval_status === 'rejected' ||
    row.approval_status === 'Rejected' ||
    row.verificationStatus === 'Rejected' ||
    row.verificationStatus === 'rejected';

  const isRemoved =
    row.approval_status === 'removed' ||
    row.approval_status === 'Removed' ||
    row.status === 'removed' ||
    row.status === 'inactive' ||
    row.verificationStatus === 'Removed' ||
    row.verificationStatus === 'Inactive';

  const verificationStatus: Worker['verificationStatus'] = isRemoved
    ? 'Removed'
    : isApproved
    ? 'Verified'
    : isRejected
    ? 'Rejected'
    : 'Pending';

  return {
    id: row.id,
    profile_id: row.profile_id,
    applicationId: row.application_id || row.applicationId || row.id,
    appliedDate: row.applied_date || row.appliedDate || 'Today',
    name: row.name || 'Worker Applicant',
    avatar: row.avatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    skill: (row.primary_skill || row.skill || 'Plumbing') as ServiceType,
    secondarySkills: row.secondary_skills || row.secondarySkills || [],
    rating: Number(row.safety_rating || row.rating) || 5.0,
    reviewsCount: Array.isArray(row.reviews) ? row.reviews.length : (Number(row.reviews_count) || 0),
    experienceYears: Number(row.experience != null ? row.experience : row.experienceYears) || 3,
    distanceKm: Number(row.distanceKm) || 1.5,
    basePricePerHour: Number(row.base_price_per_hour != null ? row.base_price_per_hour : row.basePricePerHour) || 250,
    availability: (row.availability_status || row.availability || 'Available Today') as any,
    isVerified: isApproved && !isRemoved,
    verificationStatus,
    status: isRemoved ? 'removed' : isApproved ? 'active' : isRejected ? 'rejected' : 'pending',
    approval_status: row.approval_status || (isApproved ? 'approved' : 'pending'),
    is_active: isApproved && !isRemoved,
    cooperativeId: row.cooperative_id || row.cooperativeId || 'coop-1',
    cooperativeName: row.cooperative_name || row.cooperativeName || 'National Federation of Labour Cooperatives (NLCF)',
    completedJobs: Number(row.completed_jobs != null ? row.completed_jobs : row.completedJobs) || 0,
    workingHours: row.working_hours || row.workingHours || '9:00 AM - 7:00 PM',
    location: row.location || (row.address?.town ? `${row.address.town}, ${row.address.state || ''}` : 'Local Cooperative Area'),
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    phone: row.phone || '',
    email: row.email || '',
    bio: row.bio || 'Skilled Labour Cooperative trade worker.',
    languages: row.languages || ['English', 'Hindi'],
    certifications: row.certifications || [],
    verificationDocType: row.verification_doc_type || row.verificationDocType || 'Labour Cooperative Verification Dossier',
    verificationDate: row.verification_date || row.verificationDate,
    safetyRating: Number(row.safety_rating) || 5.0,
    insuranceCovered: row.insurance_covered !== false,
    emergencyAvailable: row.emergency_available !== false,
    availabilitySlots: row.availability_slots || row.availabilitySlots || [
      { id: 's1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
      { id: 's2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
      { id: 's3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
      { id: 's4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
    ],
    reviews: row.reviews || [],
    dob: row.dob,
    gender: row.gender,
    address: row.address || {},
    maskedAadhaar: row.masked_aadhaar || row.maskedAadhaar,
    membershipId: row.membership_id || row.membershipId,
    documents: row.documents || [],
    workSamples: row.work_samples || row.workSamples || [],
    workDescription: row.work_description || row.workDescription,
    bankDetails: row.bank_details || row.bankDetails,
    emergencyContact: row.emergency_contact || row.emergencyContact,
    insuranceDetails: row.insurance_details || row.insuranceDetails,
    removedAt: row.removed_at || row.removedAt,
    removedBy: row.removed_by || row.removedBy,
    removalReason: row.removal_reason || row.removalReason,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
};

export const mapWorkerToDbRow = (w: Worker, authUserId?: string) => {
  return {
    id: w.id,
    profile_id: authUserId || w.profile_id || null,
    application_id: w.applicationId || w.id,
    applied_date: w.appliedDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    name: w.name,
    avatar: w.avatar,
    primary_skill: w.skill,
    secondary_skills: w.secondarySkills || [],
    experience: w.experienceYears || 0,
    base_price_per_hour: w.basePricePerHour || 250,
    city: w.address?.town || 'Delhi NCR',
    location: w.location || 'Local Cooperative Area',
    latitude: w.latitude != null ? w.latitude : null,
    longitude: w.longitude != null ? w.longitude : null,
    phone: w.phone || null,
    email: w.email || null,
    bio: w.bio || 'Skilled Labour Cooperative trade worker.',
    languages: w.languages || ['English', 'Hindi'],
    cooperative_id: w.cooperativeId || 'coop-1',
    cooperative_name: w.cooperativeName || 'National Federation of Labour Cooperatives (NLCF)',
    completed_jobs: w.completedJobs || 0,
    working_hours: w.workingHours || '9:00 AM - 7:00 PM',
    availability_status: w.availability || 'Available Today',
    approval_status: (w.approval_status || (w.isVerified ? 'approved' : 'pending')) as string,
    is_verified: !!w.isVerified,
    is_active: !!w.is_active,
    verification_doc_type: w.verificationDocType || 'Labour Cooperative Verification Dossier',
    verification_date: w.verificationDate || null,
    membership_id: w.membershipId || null,
    masked_aadhaar: w.maskedAadhaar || null,
    dob: w.dob || null,
    gender: w.gender || null,
    safety_rating: w.safetyRating || 5.0,
    insurance_covered: w.insuranceCovered !== false,
    emergency_available: w.emergencyAvailable !== false,
    address: w.address || {},
    bank_details: w.bankDetails || {},
    emergency_contact: w.emergencyContact || {},
    insurance_details: w.insuranceDetails || {},
    availability_slots: w.availabilitySlots || [],
    certifications: w.certifications || [],
    work_samples: w.workSamples || [],
    reviews: w.reviews || [],
    removed_at: w.removedAt || null,
    removed_by: w.removedBy || null,
    removal_reason: w.removalReason || null,
    created_at: w.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export class SahaayakService implements ISahaayakService {
  private workers: Worker[] = [];
  private bookings: Booking[] = [];
  private payments: Payment[] = [];
  private cooperatives: CooperativeSociety[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase(): void {
    try {
      const storedWorkers = localStorage.getItem(STORAGE_KEY_WORKERS);
      // Clean, real data only: default to empty array if no real worker has registered
      this.workers = storedWorkers ? JSON.parse(storedWorkers) : [];
    } catch {
      this.workers = [];
    }

    try {
      const storedBookings = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      this.bookings = storedBookings ? JSON.parse(storedBookings) : [];
    } catch {
      this.bookings = [];
    }

    try {
      const storedPayments = localStorage.getItem(STORAGE_KEY_PAYMENTS);
      this.payments = storedPayments ? JSON.parse(storedPayments) : [];
    } catch {
      this.payments = [];
    }

    try {
      const storedCoops = localStorage.getItem(STORAGE_KEY_COOPERATIVES);
      this.cooperatives = storedCoops ? JSON.parse(storedCoops) : [...COOPERATIVE_SOCIETIES];
    } catch {
      this.cooperatives = [...COOPERATIVE_SOCIETIES];
    }
  }

  private persistWorkers(): void {
    try {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(this.workers));
    } catch {
      // ignore
    }
  }

  private persistBookings(): void {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(this.bookings));
    } catch {
      // ignore
    }
  }

  private persistPayments(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(this.payments));
    } catch {
      // ignore
    }
  }

  private persistCooperatives(): void {
    try {
      localStorage.setItem(STORAGE_KEY_COOPERATIVES, JSON.stringify(this.cooperatives));
    } catch {
      // ignore
    }
  }

  // ===================== WORKERS =====================
  async getWorkers(): Promise<Worker[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('workers').select('*');
        if (!error && data) {
          const mapped = data.map(mapDbRowToWorker);
          this.workers = mapped;
          this.persistWorkers();
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase query error, fallback to persistent store:', err);
      }
    }
    return [...this.workers];
  }

  async getApprovedWorkers(): Promise<Worker[]> {
    const all = await this.getWorkers();
    return all.filter(
      (w) =>
        Boolean(
          w.isVerified &&
          (w.verificationStatus === 'Verified' || w.verificationStatus === 'approved') &&
          !(w as any).is_removed &&
          (w as any).status !== 'removed' &&
          (w as any).status !== 'inactive'
        )
    );
  }

  async getPendingWorkers(): Promise<Worker[]> {
    const all = await this.getWorkers();
    return all.filter(
      (w) =>
        !w.isVerified &&
        w.verificationStatus !== 'Rejected' &&
        w.verificationStatus !== 'rejected' &&
        w.verificationStatus !== 'Removed' &&
        w.verificationStatus !== 'Inactive' &&
        (w as any).status !== 'removed' &&
        (w as any).status !== 'inactive'
    );
  }

  async getWorkerById(id: string): Promise<Worker | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('workers')
          .select('*')
          .or(`id.eq.${id},profile_id.eq.${id}`)
          .maybeSingle();
        if (!error && data) {
          return mapDbRowToWorker(data);
        }
      } catch {
        // fallback
      }
    }
    const worker = this.workers.find((w) => w.id === id || w.profile_id === id);
    return worker ? { ...worker } : null;
  }

  async createWorkerApplication(workerData: Partial<Worker>): Promise<Worker> {
    const appId = `SHK-WKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const cleanEmail = (workerData.email || '').trim().toLowerCase();
    const cleanPass = (workerData.password || '').trim();
    const cleanPhone = (workerData.phone || '').trim();
    let authUserId = workerData.profile_id || `prof-${Date.now()}`;

    // 1. If Supabase is configured and credentials provided, create real Supabase Auth user
    if (isSupabaseConfigured && supabase && cleanEmail && cleanPass) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: {
              role: 'worker',
              full_name: workerData.name || 'Worker Applicant',
              phone: cleanPhone,
            },
          },
        });

        if (authError) {
          if (
            authError.message.toLowerCase().includes('already registered') ||
            authError.message.toLowerCase().includes('already in use')
          ) {
            // Existing user, sign in to link user ID
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass,
            });
            if (!signInErr && signInData.user) {
              authUserId = signInData.user.id;
            } else {
              throw new Error('An account with this email is already registered. Please sign in or provide the correct password.');
            }
          } else {
            throw new Error(authError.message || 'Worker registration failed in Supabase Auth.');
          }
        } else if (authData.user) {
          authUserId = authData.user.id;
        }

        // Upsert profiles table with role = 'worker'
        if (authUserId) {
          const { error: profileError } = await supabase.from('profiles').upsert([
            {
              id: authUserId,
              role: 'worker',
              full_name: workerData.name || 'Worker Applicant',
              email: cleanEmail,
              phone: cleanPhone || null,
              avatar_url: workerData.avatar || null,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]);
          if (profileError) {
            console.warn('Profiles upsert warning:', profileError.message);
          }
        }
      } catch (authErr: any) {
        console.warn('Supabase Auth error during worker registration:', authErr);
        throw authErr;
      }
    }

    const newWorkerId = `wkr-${Date.now()}`;
    const newWorker: Worker = {
      id: newWorkerId,
      profile_id: authUserId,
      applicationId: appId,
      appliedDate: now,
      name: workerData.name || 'Worker Applicant',
      avatar:
        workerData.avatar ||
        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      skill: workerData.skill || 'Plumbing',
      secondarySkills: workerData.secondarySkills || [],
      rating: 5.0,
      reviewsCount: 0,
      experienceYears: Number(workerData.experienceYears) || 3,
      distanceKm: workerData.distanceKm || 1.5,
      basePricePerHour: Number(workerData.basePricePerHour) || 250,
      availability: 'Available Today',
      isVerified: false,
      verificationStatus: 'Pending',
      status: 'pending',
      approval_status: 'pending',
      is_active: false,
      cooperativeId: workerData.cooperativeId || 'coop-1',
      cooperativeName: workerData.cooperativeName || 'National Federation of Labour Cooperatives (NLCF)',
      completedJobs: 0,
      workingHours: workerData.workingHours || '9:00 AM - 7:00 PM',
      location: workerData.location || (workerData.address?.town ? `${workerData.address.town}, ${workerData.address.state || ''}` : 'Local Cooperative Area'),
      latitude: workerData.latitude,
      longitude: workerData.longitude,
      phone: cleanPhone,
      bio: workerData.bio || 'Skilled Labour Cooperative trade worker.',
      languages: workerData.languages && workerData.languages.length > 0 ? workerData.languages : ['English', 'Hindi'],
      certifications: workerData.certifications || [],
      verificationDocType: workerData.verificationDocType || 'Labour Cooperative Verification Dossier',
      safetyRating: 5.0,
      insuranceCovered: true,
      emergencyAvailable: true,
      availabilitySlots: workerData.availabilitySlots || [
        { id: 's1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
        { id: 's2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
        { id: 's3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
        { id: 's4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
      ],
      reviews: [],
      dob: workerData.dob,
      gender: workerData.gender,
      email: cleanEmail,
      password: cleanPass,
      address: workerData.address,
      maskedAadhaar: workerData.maskedAadhaar,
      membershipId: workerData.membershipId,
      documents: workerData.documents || [],
      workSamples: workerData.workSamples || [],
      workDescription: workerData.workDescription,
      bankDetails: workerData.bankDetails,
      emergencyContact: workerData.emergencyContact,
      insuranceDetails: workerData.insuranceDetails,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const dbRow = mapWorkerToDbRow(newWorker, authUserId);
        const { error: insertErr } = await supabase.from('workers').insert([dbRow]);
        if (insertErr) {
          console.warn('Worker insert warning into Supabase:', insertErr.message);
          throw new Error(`Failed to persist worker record in Supabase: ${insertErr.message}`);
        }

        // Insert documents into worker_documents table if present
        if (workerData.documents && workerData.documents.length > 0) {
          const docRows = workerData.documents.map((doc) => ({
            worker_id: newWorker.id,
            document_type: doc.type || doc.document_type || 'Identity Proof',
            document_name: doc.name || 'Verification Document',
            document_url: doc.fileUrl || doc.file_path || 'https://sahaayak.gov.in/docs/sample_kyc.pdf',
            file_size: doc.fileSize || '1.2 MB',
            verification_status: 'pending',
            uploaded_at: new Date().toISOString(),
          }));
          await supabase.from('worker_documents').insert(docRows);
        }
      } catch (err: any) {
        console.error('Database persistence error during worker registration:', err);
        throw err;
      }
    }

    this.workers = [newWorker, ...this.workers.filter((w) => w.id !== newWorker.id)];
    this.persistWorkers();
    return newWorker;
  }

  async approveWorkerApplication(workerId: string): Promise<Worker> {
    const worker = this.workers.find((w) => w.id === workerId || w.applicationId === workerId);
    if (!worker) throw new Error('Worker application not found');

    worker.isVerified = true;
    worker.verificationStatus = 'Verified';
    worker.status = 'active';
    worker.approval_status = 'approved';
    worker.is_active = true;
    worker.availability = 'Available Today';
    worker.verificationDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    worker.updated_at = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateErr } = await supabase
          .from('workers')
          .update({
            is_verified: true,
            approval_status: 'approved',
            is_active: true,
            availability_status: 'Available Today',
            verification_date: worker.verificationDate,
            updated_at: worker.updated_at,
          })
          .eq('id', worker.id);
        if (updateErr) {
          console.warn('Worker approval update error in Supabase:', updateErr.message);
        }
      } catch (err) {
        console.warn('Worker approval update exception:', err);
      }
    }

    this.persistWorkers();
    return { ...worker };
  }

  async rejectWorkerApplication(workerId: string, reason?: string): Promise<void> {
    const worker = this.workers.find((w) => w.id === workerId || w.applicationId === workerId);
    if (worker) {
      worker.isVerified = false;
      worker.verificationStatus = 'Rejected';
      worker.status = 'rejected';
      worker.approval_status = 'rejected';
      worker.is_active = false;
      worker.availability = 'Offline';
      worker.removalReason = reason || 'Application rejected during verification';
      worker.updated_at = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        try {
          const { error: updateErr } = await supabase
            .from('workers')
            .update({
              is_verified: false,
              approval_status: 'rejected',
              is_active: false,
              availability_status: 'Offline',
              removal_reason: worker.removalReason,
              updated_at: worker.updated_at,
            })
            .eq('id', worker.id);
          if (updateErr) {
            console.warn('Worker rejection update error in Supabase:', updateErr.message);
          }
        } catch (err) {
          console.warn('Worker rejection exception:', err);
        }
      }

      this.persistWorkers();
    }
  }

  async removeWorker(workerId: string, adminId?: string, reason?: string): Promise<Worker> {
    const worker = this.workers.find((w) => w.id === workerId || w.applicationId === workerId);
    if (!worker) throw new Error('Worker not found');

    worker.isVerified = false;
    worker.verificationStatus = 'Removed';
    worker.status = 'removed';
    worker.approval_status = 'removed';
    worker.is_active = false;
    worker.availability = 'Offline';
    worker.removedAt = new Date().toISOString();
    worker.removedBy = adminId || 'admin';
    worker.removalReason = reason || 'Worker removed by Sahaayak Administrator';
    worker.updated_at = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      try {
        const { error: updateErr } = await supabase
          .from('workers')
          .update({
            is_verified: false,
            approval_status: 'removed',
            is_active: false,
            availability_status: 'Offline',
            removed_at: worker.removedAt,
            removed_by: worker.removedBy,
            removal_reason: worker.removalReason,
            updated_at: worker.updated_at,
          })
          .eq('id', worker.id);
        if (updateErr) {
          console.warn('Worker removal update error in Supabase:', updateErr.message);
        }
      } catch (err) {
        console.warn('Worker removal exception:', err);
      }
    }

    this.persistWorkers();
    return { ...worker };
  }

  async updateWorkerOnlineStatus(workerId: string, isOnline: boolean): Promise<void> {
    const worker = this.workers.find((w) => w.id === workerId);
    if (worker) {
      worker.availability = isOnline ? 'Available Today' : 'Offline';
      this.persistWorkers();
    }
  }

  // ===================== BOOKINGS =====================
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('bookings').select('*');
        if (!error && data) {
          return data as Booking[];
        }
      } catch {
        // fallback
      }
    }
    return [...this.bookings];
  }

  async getBookingById(id: string): Promise<Booking | null> {
    const booking = this.bookings.find((b) => b.id === id);
    return booking ? { ...booking } : null;
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const randomId = `SHK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const estimatedPrice = bookingData.estimatedPrice || 299;
    const platformFee = 15;
    const welfareCess = Math.round(estimatedPrice * 0.05);
    const totalAmount = estimatedPrice + platformFee + welfareCess;

    const newBooking: Booking = {
      id: randomId,
      customer_id: bookingData.customer_id,
      customerName: bookingData.customerName || 'Customer',
      customerPhone: bookingData.customerPhone || '',
      customerAddress: bookingData.customerAddress || 'Customer Address',
      latitude: bookingData.latitude,
      longitude: bookingData.longitude,
      customerCoordinates:
        typeof bookingData.latitude === 'number' && typeof bookingData.longitude === 'number'
          ? { lat: bookingData.latitude, lng: bookingData.longitude }
          : undefined,
      worker_id: bookingData.workerId,
      workerId: bookingData.workerId || '',
      workerName: bookingData.workerName || 'Worker',
      workerSkill: bookingData.workerSkill || 'Plumbing',
      workerAvatar: bookingData.workerAvatar || '',
      workerPhone: bookingData.workerPhone || '',
      serviceType: bookingData.serviceType || 'Plumbing',
      date: bookingData.date || 'Today',
      booking_date: bookingData.date || 'Today',
      timeSlot: bookingData.timeSlot || '10:00 AM – 11:00 AM',
      slotId: bookingData.slotId,
      problemDescription: bookingData.problemDescription || 'Service requested.',
      estimatedPrice,
      platformFee,
      welfareCess,
      totalAmount,
      amount: totalAmount,
      status: 'requested', // Real booking starts in requested status
      isEmergency: !!bookingData.isEmergency,
      etaMinutes: bookingData.isEmergency ? 15 : 0,
      createdAt: 'Just now',
      created_at: new Date().toISOString(),
      otpCode: randomOtp,
      otp_code: randomOtp,
      otp: randomOtp,
      otp_verified: false,
      paymentStatus: 'pending',
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('bookings').insert([
          {
            id: newBooking.id,
            customer_id: newBooking.customer_id,
            customer_name: newBooking.customerName,
            customer_phone: newBooking.customerPhone,
            customer_address: newBooking.customerAddress,
            latitude: newBooking.latitude || null,
            longitude: newBooking.longitude || null,
            worker_id: newBooking.workerId,
            worker_name: newBooking.workerName,
            worker_skill: newBooking.workerSkill,
            worker_avatar: newBooking.workerAvatar,
            worker_phone: newBooking.workerPhone,
            service_type: newBooking.serviceType,
            scheduled_date: newBooking.date,
            time_slot: newBooking.timeSlot,
            slot_id: newBooking.slotId,
            problem_description: newBooking.problemDescription,
            estimated_price: newBooking.estimatedPrice,
            platform_fee: newBooking.platformFee,
            welfare_cess: newBooking.welfareCess,
            total_amount: newBooking.totalAmount,
            status: newBooking.status,
            is_emergency: newBooking.isEmergency,
            eta_minutes: newBooking.etaMinutes,
            otp: newBooking.otp,
            otp_verified: false,
            payment_status: 'pending',
            created_at: newBooking.created_at,
          },
        ]);
      } catch (err) {
        console.warn('Supabase booking insert warning:', err);
      }
    }

    this.bookings = [newBooking, ...this.bookings];
    this.persistBookings();
    return newBooking;
  }

  async acceptBooking(bookingId: string, workerId: string): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = 'accepted';
    booking.acceptedAt = 'Just now';

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase booking accept error:', err);
      }
    }

    this.persistBookings();
    return { ...booking };
  }

  async rejectBooking(bookingId: string, workerId: string, reason?: string): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = 'rejected';
    booking.rejectionReason = reason || 'Worker unavailable';
    booking.rejectedAt = 'Just now';

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .update({
            status: 'rejected',
            rejection_reason: booking.rejectionReason,
            rejected_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase booking reject error:', err);
      }
    }

    this.persistBookings();
    return { ...booking };
  }

  async verifyOtpAndStartService(bookingId: string, enteredOtp: string): Promise<{ success: boolean; message: string }> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Booking not found' };

    const expectedOtp = booking.otp || booking.otpCode || booking.otp_code || '';
    const isCorrect = enteredOtp.trim() === expectedOtp.trim();

    if (!isCorrect) {
      return { success: false, message: 'Invalid OTP code. Please ask customer for the correct PIN.' };
    }

    booking.otp_verified = true;
    booking.otp_verified_at = new Date().toISOString();
    booking.status = 'in_progress';

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .update({
            status: 'in_progress',
            otp_verified: true,
            otp_verified_at: booking.otp_verified_at,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase OTP verify update error:', err);
      }
    }

    this.persistBookings();
    return { success: true, message: 'OTP verified successfully. Service started.' };
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.status = status;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('bookings')
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase booking status update error:', err);
      }
    }

    this.persistBookings();
    return { ...booking };
  }

  async completeJobAndRecordPayment(
    bookingId: string,
    paymentMode: PaymentMode,
    extraMaterialsCost = 0
  ): Promise<{ booking: Booking; payment: Payment }> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const platformFee = booking.platformFee ?? 15;
    const welfareCess = booking.welfareCess ?? 15;
    const baseWage = booking.estimatedPrice || 299;
    const totalAmount = baseWage + extraMaterialsCost + platformFee + welfareCess;

    booking.status = 'completed';
    booking.paymentMode = paymentMode;
    booking.extraMaterialsCost = extraMaterialsCost;
    booking.totalAmount = totalAmount;
    booking.completedAt = 'Just now';

    // Create payment record
    const workerNet = Math.round(baseWage * 0.90) + extraMaterialsCost;
    const paymentRecord: Payment = {
      id: `pay-${Date.now()}`,
      booking_id: booking.id,
      customer_id: booking.customer_id || 'customer',
      worker_id: booking.workerId,
      amount: totalAmount,
      workerNet,
      worker_net: workerNet,
      extra_parts_amount: extraMaterialsCost,
      payment_method: paymentMode,
      payment_status: paymentMode === 'Online' ? 'paid' : 'pending',
      paid_at: paymentMode === 'Online' ? new Date().toISOString() : undefined,
      created_at: new Date().toISOString(),
    };

    if (paymentMode === 'Online') {
      booking.paymentStatus = 'paid';
      booking.status = 'paid';
      booking.paymentReceivedAt = 'Just now';

      // Increment worker completed jobs
      const worker = this.workers.find((w) => w.id === booking.workerId);
      if (worker) {
        worker.completedJobs = (worker.completedJobs || 0) + 1;
        this.persistWorkers();
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').insert([
          {
            id: paymentRecord.id,
            booking_id: paymentRecord.booking_id,
            customer_id: booking.customer_id,
            worker_id: paymentRecord.worker_id,
            amount: paymentRecord.amount,
            worker_net: workerNet,
            extra_parts_amount: extraMaterialsCost,
            payment_mode: paymentMode,
            payment_status: paymentRecord.payment_status,
            paid_at: paymentRecord.paid_at,
            created_at: paymentRecord.created_at,
          },
        ]);

        await supabase
          .from('bookings')
          .update({
            status: booking.status,
            payment_status: booking.paymentStatus,
            payment_mode: paymentMode,
            extra_materials_cost: extraMaterialsCost,
            total_amount: booking.totalAmount,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase complete payment error:', err);
      }
    }

    this.payments = [paymentRecord, ...this.payments];
    this.persistPayments();
    this.persistBookings();

    return { booking: { ...booking }, payment: paymentRecord };
  }

  async confirmPaymentReceived(bookingId: string): Promise<Booking> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    booking.paymentStatus = 'paid';
    booking.status = 'paid';
    booking.paymentReceivedAt = 'Just now';

    // Update payment record in database
    const payment = this.payments.find((p) => p.booking_id === bookingId);
    if (payment) {
      payment.payment_status = 'paid';
      payment.paid_at = new Date().toISOString();
      this.persistPayments();
    }

    // Increment worker completed jobs
    const worker = this.workers.find((w) => w.id === booking.workerId);
    if (worker) {
      worker.completedJobs = (worker.completedJobs || 0) + 1;
      this.persistWorkers();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('payments')
          .update({
            payment_status: 'paid',
            received_at: new Date().toISOString(),
          })
          .eq('booking_id', bookingId);

        await supabase
          .from('bookings')
          .update({
            status: 'paid',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', bookingId);
      } catch (err) {
        console.warn('Supabase confirm payment error:', err);
      }
    }

    this.persistBookings();
    return { ...booking };
  }

  // ===================== REAL WORKER EARNINGS =====================
  async getWorkerEarnings(workerId: string): Promise<{
    todayEarnings: number;
    totalEarnings: number;
    completedJobs: number;
    pendingRequestsCount: number;
    acceptedJobsCount: number;
    paidJobsCount: number;
    paymentsHistory: Payment[];
  }> {
    if (isSupabaseConfigured && supabase && workerId) {
      try {
        const { data: dbPayments } = await supabase
          .from('payments')
          .select('*')
          .eq('worker_id', workerId)
          .eq('payment_status', 'paid');

        if (dbPayments && dbPayments.length > 0) {
          const totalEarned = dbPayments.reduce((acc: number, p: any) => acc + Number(p.worker_net || p.amount || 0), 0);
          const { data: dbBookings } = await supabase
            .from('bookings')
            .select('*')
            .eq('worker_id', workerId);

          const allBookings = dbBookings || [];
          return {
            todayEarnings: totalEarned,
            totalEarnings: totalEarned,
            completedJobs: allBookings.filter((b: any) => b.status === 'completed' || b.status === 'paid').length,
            pendingRequestsCount: allBookings.filter((b: any) => b.status === 'requested').length,
            acceptedJobsCount: allBookings.filter((b: any) => b.status === 'accepted' || b.status === 'in_progress').length,
            paidJobsCount: dbPayments.length,
            paymentsHistory: dbPayments as Payment[],
          };
        }
      } catch (err) {
        console.warn('Supabase query error on earnings, using local store:', err);
      }
    }

    // Only calculate from actual paid bookings/payments for this worker
    const workerPayments = this.payments.filter(
      (p) => p.worker_id === workerId && p.payment_status === 'paid'
    );

    const totalEarnings = workerPayments.reduce((sum, p) => sum + (p.workerNet || p.amount || 0), 0);

    const workerBookings = this.bookings.filter((b) => b.workerId === workerId);
    const completedJobs = workerBookings.filter(
      (b) => b.status === 'completed' || b.status === 'paid' || b.status === 'Completed'
    ).length;
    const paidJobsCount = workerBookings.filter(
      (b) => b.paymentStatus === 'paid' || b.paymentStatus === 'Settled to Worker'
    ).length;
    const pendingRequestsCount = workerBookings.filter(
      (b) => b.status === 'requested' || b.status === 'Pending' || b.status === 'Waiting for Response'
    ).length;
    const acceptedJobsCount = workerBookings.filter(
      (b) =>
        b.status === 'accepted' ||
        b.status === 'in_progress' ||
        b.status === 'Worker Accepted' ||
        b.status === 'Worker Travelling' ||
        b.status === 'travelling' ||
        b.status === 'Worker Arrived' ||
        b.status === 'arrived' ||
        b.status === 'Service In Progress'
    ).length;

    return {
      todayEarnings: totalEarnings, // Real calculated earnings
      totalEarnings,
      completedJobs,
      pendingRequestsCount,
      acceptedJobsCount,
      paidJobsCount,
      paymentsHistory: workerPayments,
    };
  }

  async getCooperatives(): Promise<CooperativeSociety[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('cooperatives').select('*');
        if (!error && data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            code: d.code || `COOP-${d.id}`,
            state: d.state || 'Delhi NCR',
            district: d.district || d.location || 'Central',
            location: d.location || d.district || 'New Delhi',
            membersCount: Number(d.members_count || d.member_count) || 100,
            memberCount: Number(d.members_count || d.member_count) || 100,
            establishedYear: Number(d.established_year) || 2020,
            registrationNumber: d.registration_number || 'MSCS/CR/2026/001',
            verifiedWorkersCount: Number(d.verified_workers_count) || 50,
            contactNumber: d.contact_number || d.contact_phone || '+91 11 2685 4120',
            contactPhone: d.contact_phone || d.contact_number || '+91 11 2685 4120',
            rating: Number(d.rating) || 4.8,
            completedJobsTotal: Number(d.completed_jobs_total) || 120,
          }));
          this.cooperatives = mapped;
          this.persistCooperatives();
          return mapped;
        }
      } catch {
        // fallback
      }
    }
    return [...this.cooperatives];
  }

  async createCooperative(coopData: Partial<CooperativeSociety>): Promise<CooperativeSociety> {
    const newCoopId = `coop-${Date.now()}`;
    const newCoop: CooperativeSociety = {
      id: newCoopId,
      name: coopData.name?.trim() || 'Labour Welfare Cooperative Society',
      code: coopData.code?.trim() || `LCS-${Date.now().toString().slice(-4)}`,
      state: coopData.state?.trim() || 'Delhi NCR',
      district: coopData.district?.trim() || 'Central',
      location: coopData.location?.trim() || `${coopData.district || 'City'}, ${coopData.state || 'State'}`,
      membersCount: Number(coopData.membersCount || coopData.memberCount) || 50,
      memberCount: Number(coopData.memberCount || coopData.membersCount) || 50,
      establishedYear: Number(coopData.establishedYear) || new Date().getFullYear(),
      registrationNumber: coopData.registrationNumber?.trim() || `MSCS/CR/${Date.now().toString().slice(-4)}`,
      verifiedWorkersCount: Number(coopData.verifiedWorkersCount) || 0,
      contactNumber: coopData.contactNumber?.trim() || coopData.contactPhone?.trim() || '+91 11 2685 4120',
      contactPhone: coopData.contactPhone?.trim() || coopData.contactNumber?.trim() || '+91 11 2685 4120',
      rating: 5.0,
      completedJobsTotal: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('cooperatives').insert([
          {
            id: newCoop.id,
            name: newCoop.name,
            code: newCoop.code,
            state: newCoop.state,
            district: newCoop.district,
            location: newCoop.location,
            members_count: newCoop.membersCount,
            established_year: newCoop.establishedYear,
            registration_number: newCoop.registrationNumber,
            verified_workers_count: newCoop.verifiedWorkersCount,
            contact_number: newCoop.contactNumber,
            rating: newCoop.rating,
            completed_jobs_total: newCoop.completedJobsTotal,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.warn('Supabase cooperative insert warning:', err);
      }
    }

    this.cooperatives = [newCoop, ...this.cooperatives];
    this.persistCooperatives();
    return newCoop;
  }
}

export const sahaayakService = new SahaayakService();
