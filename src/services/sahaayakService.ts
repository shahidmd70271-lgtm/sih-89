import {
  Booking,
  BookingStatus,
  CooperativeSociety,
  Customer,
  Payment,
  PaymentMode,
  ServiceType,
  Worker,
  WorkerDocument,
} from '../types';
import { COOPERATIVE_SOCIETIES } from '../data/mockData';
import { ISahaayakService } from './types';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { isValidUuid } from '../utils/uuidUtils';


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
    availabilitySlots: (() => {
      const raw = row.availability_slots || row.availabilitySlots;
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.baseSlots)) {
        return raw.baseSlots;
      }
      if (Array.isArray(raw) && raw.length > 0) {
        return raw;
      }
      return [
        { id: 'slot-1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
        { id: 'slot-2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-5', startTime: '06:00 PM', endTime: '07:00 PM', label: '06:00 PM – 07:00 PM', isBooked: false, isAvailable: true },
      ];
    })(),
    dateOverrides: (() => {
      const raw = row.availability_slots || row.availabilitySlots;
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.dateOverrides)) {
        return raw.dateOverrides;
      }
      return row.date_overrides || row.dateOverrides || [];
    })(),
    workingDays: (() => {
      const raw = row.availability_slots || row.availabilitySlots;
      if (raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray(raw.workingDays)) {
        return raw.workingDays;
      }
      return row.working_days || row.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    })(),
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
  const candidateProfileId = authUserId || w.profile_id;
  const validProfileId = isValidUuid(candidateProfileId) ? candidateProfileId : null;

  return {
    id: w.id,
    profile_id: validProfileId,
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
    availability_slots: {
      baseSlots: w.availabilitySlots || [
        { id: 'slot-1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
        { id: 'slot-2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
        { id: 'slot-5', startTime: '06:00 PM', endTime: '07:00 PM', label: '06:00 PM – 07:00 PM', isBooked: false, isAvailable: true },
      ],
      dateOverrides: w.dateOverrides || [],
      workingDays: w.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    },
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

export const mapDbRowToBooking = (row: any): Booking => {
  const isEmergency = Boolean(row.is_emergency || row.isEmergency);
  const otpCode = row.otp || row.otp_code || row.otpCode || '5842';
  const totalAmount = Number(row.total_amount != null ? row.total_amount : row.totalAmount) || 329;
  const estimatedPrice = Number(row.estimated_price != null ? row.estimated_price : row.estimatedPrice) || 299;
  const platformFee = Number(row.platform_fee != null ? row.platform_fee : row.platformFee) || 15;
  const welfareCess = Number(row.welfare_cess != null ? row.welfare_cess : row.welfareCess) || 15;

  return {
    id: row.id,
    customer_id: row.customer_id || row.customerId || undefined,
    customerName: row.customer_name || row.customerName || 'Customer',
    customerPhone: row.customer_phone || row.customerPhone || '',
    customerAddress: row.customer_address || row.customerAddress || 'Local Area',
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    customerCoordinates:
      row.latitude != null && row.longitude != null
        ? { lat: Number(row.latitude), lng: Number(row.longitude) }
        : undefined,
    worker_id: row.worker_id || row.workerId,
    workerId: row.worker_id || row.workerId || '',
    workerName: row.worker_name || row.workerName || 'Trade Worker',
    workerSkill: (row.service_type || row.worker_skill || row.workerSkill || 'Plumbing') as ServiceType,
    workerAvatar: row.worker_avatar || row.workerAvatar || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    workerPhone: row.worker_phone || row.workerPhone || '',
    serviceType: (row.service_type || row.worker_skill || row.workerSkill || 'Plumbing') as ServiceType,
    date: row.scheduled_date || row.date || row.booking_date || 'Today',
    booking_date: row.scheduled_date || row.date || row.booking_date || 'Today',
    start_time: row.start_time || row.startTime,
    end_time: row.end_time || row.endTime,
    timeSlot: row.time_slot || row.timeSlot || '10:00 AM – 11:00 AM',
    slotId: row.slot_id || row.slotId,
    problemDescription: row.problem_description || row.problemDescription || 'Service requested.',
    estimatedPrice,
    platformFee,
    welfareCess,
    totalAmount,
    amount: totalAmount,
    status: (row.status || 'requested') as BookingStatus,
    isEmergency,
    etaMinutes: Number(row.eta_minutes != null ? row.eta_minutes : row.etaMinutes) || 0,
    createdAt: row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : 'Just now',
    created_at: row.created_at || new Date().toISOString(),
    otpCode,
    otp_code: otpCode,
    otp: otpCode,
    otp_verified: Boolean(row.otp_verified),
    otp_verified_at: row.otp_verified_at,
    paymentStatus: row.payment_status || row.paymentStatus || 'pending',
  };
};

export class SahaayakService implements ISahaayakService {
  private workers: Worker[] = [];
  private bookings: Booking[] = [];
  private payments: Payment[] = [];
  private cooperatives: CooperativeSociety[] = [];

  constructor() {
  }



  // ===================== WORKERS =====================
  async getWorkers(): Promise<Worker[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        console.log('[Supabase getWorkers] Fetching workers from Supabase public.workers table...');
        const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
        if (error) {
          console.warn('[Supabase getWorkers] Query warning:', error.message);
          return this.workers;
        }
        if (data) {
          console.log(`[Supabase getWorkers] Retrieved ${data.length} worker records from database.`);
          const mapped = data.map(mapDbRowToWorker);
          this.workers = mapped;
          return mapped;
        }
      } catch (err: any) {
        console.warn('[Supabase getWorkers] Exception during fetch, returning cached workers:', err);
        return this.workers;
      }
    }
    return this.workers;
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
        let query = supabase.from('workers').select('*');
        if (isValidUuid(id)) {
          query = query.or(`id.eq.${id},profile_id.eq.${id}`);
        } else {
          query = query.eq('id', id);
        }
        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return mapDbRowToWorker(data);
        }
      } catch {
        // fallback
      }
    }
    const worker = this.workers.find((w) => w.id === id || (isValidUuid(id) && w.profile_id === id));
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
    let authUserId: string | undefined = isValidUuid(workerData.profile_id) ? workerData.profile_id : undefined;

    // If caller is currently authenticated in Supabase, associate their valid UUID
    if (!authUserId && isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isValidUuid(user.id)) {
          authUserId = user.id;
          console.log('[Supabase Worker Registration] Associated authenticated user UUID:', authUserId);
        }
      } catch {
        // non-blocking
      }
    }

    console.log('[Supabase Worker Registration] Starting registration pipeline:', {
      email: cleanEmail,
      name: workerData.name,
      skill: workerData.skill,
      isSupabaseConfigured,
      hasSupabaseClient: !!supabase,
      hasAuthUserId: !!authUserId,
    });

    // 1. If Supabase is configured and credentials provided, create real Supabase Auth user
    if (isSupabaseConfigured && supabase && cleanEmail && cleanPass) {
      try {
        console.log('[Supabase Worker Registration] Step 1: Calling supabase.auth.signUp()...');
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

        console.log('[Supabase Worker Registration] Step 1 Auth signUp response:', {
          userId: authData?.user?.id,
          session: authData?.session ? 'ACTIVE_SESSION' : 'NULL (Unconfirmed email / Anon)',
          error: authError ? {
            code: (authError as any).code,
            message: authError.message,
            status: authError.status,
          } : null,
        });

        if (authError) {
          if (
            authError.message.toLowerCase().includes('already registered') ||
            authError.message.toLowerCase().includes('already in use')
          ) {
            console.log('[Supabase Worker Registration] Account already exists in auth.users, attempting signInWithPassword...');
            const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass,
            });
            if (!signInErr && signInData.user && isValidUuid(signInData.user.id)) {
              authUserId = signInData.user.id;
              console.log('[Supabase Worker Registration] Re-authenticated existing user UUID:', authUserId);
            } else {
              console.error('[Supabase Worker Registration] Existing user sign-in failed:', signInErr);
              throw new Error(
                signInErr?.message === 'Email not confirmed'
                  ? 'An account with this email exists but its email address has not been confirmed yet in Supabase Auth.'
                  : 'An account with this email is already registered. Please sign in or provide the correct password.'
              );
            }
          } else {
            console.error('[Supabase Worker Registration] auth.signUp failed:', authError);
            throw new Error(`Supabase Auth error: ${authError.message} (${authError.status || (authError as any).code})`);
          }
        } else if (authData.user && isValidUuid(authData.user.id)) {
          authUserId = authData.user.id;
        }
        // Note: We rely on the Supabase database trigger 'on_auth_user_created'
        // to automatically create the entry in public.profiles.
      } catch (authErr: any) {
        console.error('[Supabase Worker Registration] Auth pipeline failed:', authErr);
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
        console.log('[Supabase Worker Registration] Step 2: Inserting row into public.workers table...');
        const dbRow = mapWorkerToDbRow(newWorker, authUserId);
        console.log('[Supabase Worker Registration] Worker DB row to insert:', dbRow);

        const { data: wkrData, error: insertErr } = await supabase
          .from('workers')
          .insert([dbRow])
          .select();

        console.log('[Supabase Worker Registration] Step 2 public.workers response:', {
          data: wkrData,
          error: insertErr ? {
            code: insertErr.code,
            message: insertErr.message,
            details: insertErr.details,
            hint: insertErr.hint,
          } : null,
        });

        if (insertErr) {
          console.error('[Supabase Worker Registration] Worker insert failed:', insertErr);
          throw new Error(`Failed to persist worker record in Supabase: ${insertErr.message} (Code: ${insertErr.code}). ${insertErr.hint || ''}`);
        }

        // Use the ID returned from the database if available, otherwise fall back to our generated ID
        const finalWorkerId = wkrData?.[0]?.id || newWorker.id;

        // 3. Insert documents into worker_documents table if present
        if (workerData.documents && workerData.documents.length > 0) {
          console.log('[Supabase Worker Registration] Step 3: Inserting worker_documents records...');
          const docRows = workerData.documents.map((doc) => ({
            worker_id: finalWorkerId,
            document_type: doc.type || doc.document_type || 'Identity Proof',
            document_name: doc.name || 'Verification Document',
            document_url: doc.fileUrl || doc.file_path || 'https://sahaayak.gov.in/docs/sample_kyc.pdf',
            file_size: doc.fileSize || '1.2 MB',
            verification_status: 'pending',
            uploaded_at: new Date().toISOString(),
          }));
          const { data: docsData, error: docErr } = await supabase
            .from('worker_documents')
            .insert(docRows)
            .select();

          console.log('[Supabase Worker Registration] Step 3 worker_documents response:', {
            data: docsData,
            error: docErr ? {
              code: docErr.code,
              message: docErr.message,
              details: docErr.details,
              hint: docErr.hint,
            } : null,
          });

          if (docErr) {
            console.warn('[Supabase Worker Registration] Non-blocking documents insert warning:', docErr.message);
          }
        }

        console.log('[Supabase Worker Registration] Step 4: Querying fresh worker records from Supabase...');
        const freshWorkers = await this.getWorkers();
        const created = freshWorkers.find((w) => w.id === finalWorkerId || w.profile_id === authUserId);
        console.log('[Supabase Worker Registration] Confirmed persistence in Supabase:', created?.id);
        return created || newWorker;
      } catch (err: any) {
        console.error('[Supabase Worker Registration] Database persistence failed:', err);
        throw err;
      }
    }

    this.workers = [newWorker, ...this.workers.filter((w) => w.id !== newWorker.id)];
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

    return { ...worker };
  }

  async updateWorkerOnlineStatus(workerId: string, isOnline: boolean): Promise<void> {
    const worker = this.workers.find((w) => w.id === workerId);
    if (worker) {
      worker.availability = isOnline ? 'Available Today' : 'Offline';
    }
  }

  async updateWorkerAvailabilityConfig(
    workerId: string,
    config: {
      workingDays?: string[];
      availabilitySlots?: any[];
      dateOverrides?: any[];
    }
  ): Promise<void> {
    const worker = this.workers.find((w) => w.id === workerId);
    if (worker) {
      if (config.workingDays) worker.workingDays = config.workingDays;
      if (config.availabilitySlots) worker.availabilitySlots = config.availabilitySlots;
      if (config.dateOverrides) worker.dateOverrides = config.dateOverrides;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: any = {
          availability_slots: {
            baseSlots: config.availabilitySlots || worker?.availabilitySlots || [
              { id: 'slot-1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
              { id: 'slot-2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
              { id: 'slot-3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
              { id: 'slot-4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
              { id: 'slot-5', startTime: '06:00 PM', endTime: '07:00 PM', label: '06:00 PM – 07:00 PM', isBooked: false, isAvailable: true },
            ],
            dateOverrides: config.dateOverrides || worker?.dateOverrides || [],
            workingDays: config.workingDays || worker?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          },
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('workers')
          .update(payload)
          .eq('id', workerId);

        if (error) {
          console.warn('[updateWorkerAvailabilityConfig] Supabase update warning:', error.message);
        }
      } catch (err) {
        console.warn('[updateWorkerAvailabilityConfig] Error updating worker availability in Supabase:', err);
      }
    }
  }

  // ===================== BOOKINGS =====================
  async getBookings(): Promise<Booking[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        console.log('[Supabase getBookings] Fetching bookings from Supabase public.bookings table...');
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('[Supabase getBookings] Query warning:', error.message);
          return this.bookings;
        }
        if (data) {
          console.log(`[Supabase getBookings] Retrieved ${data.length} booking records.`);
          const mapped = data.map(mapDbRowToBooking);
          this.bookings = mapped;
          return mapped;
        }
      } catch (err: any) {
        console.warn('[Supabase getBookings] Exception during fetch, returning cached bookings:', err);
        return this.bookings;
      }
    }
    return this.bookings;
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

    let validCustomerId =
      bookingData.customer_id && isValidUuid(bookingData.customer_id)
        ? bookingData.customer_id
        : undefined;

    if (!validCustomerId && isSupabaseConfigured && supabase) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.id && isValidUuid(authData.user.id)) {
          validCustomerId = authData.user.id;
        }
      } catch {
        // fallback
      }
    }

    const newBooking: Booking = {
      id: randomId,
      customer_id: validCustomerId,
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

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Bookings cannot be created without a backend.');
    }

    try {
      const { data: insertedRows, error: insertErr } = await supabase.from('bookings').insert([
        {
          id: newBooking.id,
          customer_id: validCustomerId || null,
          customer_name: newBooking.customerName || 'Customer',
          customer_phone: newBooking.customerPhone || '9876543210',
          customer_address: newBooking.customerAddress || 'Customer Address',
          latitude: newBooking.latitude || (newBooking.customerCoordinates?.lat) || 28.5700,
          longitude: newBooking.longitude || (newBooking.customerCoordinates?.lng) || 77.2200,
          worker_id: newBooking.workerId || '',
          worker_name: newBooking.workerName || 'Worker',
          worker_skill: newBooking.workerSkill || newBooking.serviceType || 'Plumbing',
          worker_avatar: newBooking.workerAvatar || '',
          worker_phone: newBooking.workerPhone || '9876543210',
          service_type: newBooking.serviceType || newBooking.workerSkill || 'Plumbing',
          scheduled_date: newBooking.date || 'Today',
          time_slot: newBooking.timeSlot || '10:00 AM – 11:00 AM',
          slot_id: newBooking.slotId || null,
          problem_description: newBooking.problemDescription || 'Service requested.',
          estimated_price: newBooking.estimatedPrice || 299,
          platform_fee: newBooking.platformFee || 15,
          welfare_cess: newBooking.welfareCess || 15,
          total_amount: newBooking.totalAmount || 329,
          status: newBooking.status || 'requested',
          is_emergency: !!newBooking.isEmergency,
          eta_minutes: newBooking.etaMinutes || 0,
          otp: newBooking.otp || '5842',
          otp_verified: false,
          payment_status: 'pending',
          created_at: newBooking.created_at,
        },
      ]).select();

      if (insertErr) {
        console.error('[createBooking] Supabase insert error:', insertErr);
        throw new Error(`Failed to create booking in database: ${insertErr.message}`);
      }

      if (insertedRows && insertedRows.length > 0) {
        const canonicalBooking = mapDbRowToBooking(insertedRows[0]);
        this.bookings = [canonicalBooking, ...this.bookings.filter((b) => b.id !== canonicalBooking.id)];
        return canonicalBooking;
      }
    } catch (err) {
      console.warn('Supabase booking insert warning:', err);
      throw err;
    }

    this.bookings = [newBooking, ...this.bookings];
    return newBooking;
  }

  async acceptBooking(bookingId: string, workerId: string): Promise<Booking> {
    let booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
        if (data) booking = mapDbRowToBooking(data);
      } catch (e) {
        // non-blocking
      }
    }
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

    this.bookings = [booking, ...this.bookings.filter((b) => b.id !== bookingId)];
    return { ...booking };
  }

  async rejectBooking(bookingId: string, workerId: string, reason?: string): Promise<Booking> {
    let booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();
        if (data) booking = mapDbRowToBooking(data);
      } catch (e) {
        // non-blocking
      }
    }
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

    this.bookings = [booking, ...this.bookings.filter((b) => b.id !== bookingId)];
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
          }

    // Increment worker completed jobs
    const worker = this.workers.find((w) => w.id === booking.workerId);
    if (worker) {
      worker.completedJobs = (worker.completedJobs || 0) + 1;
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
        const [{ data: dbPayments }, { data: dbBookings }] = await Promise.all([
          supabase
            .from('payments')
            .select('*')
            .eq('worker_id', workerId),
          supabase
            .from('bookings')
            .select('*')
            .eq('worker_id', workerId),
        ]);

        const allBookings = dbBookings || [];
        const allPayments = dbPayments || [];

        const completedBookings = allBookings.filter(
          (b: any) =>
            b.status === 'completed' ||
            b.status === 'Completed' ||
            b.status === 'paid' ||
            b.payment_status === 'paid'
        );

        let totalNetEarnings = 0;
        let todayNetEarnings = 0;
        const todayIso = new Date().toISOString().split('T')[0];

        const history: Payment[] = [];

        for (const b of completedBookings) {
          const matchingPay = allPayments.find((p: any) => p.booking_id === b.id);
          const grossAmount = Number(matchingPay?.amount || b.total_amount || b.estimated_price || 299);
          const extraCost = Number(matchingPay?.extra_parts_amount || b.extra_materials_cost || 0);
          const baseWage = grossAmount - extraCost;
          const net = matchingPay?.worker_net != null
            ? Number(matchingPay.worker_net)
            : Math.round(baseWage * 0.90) + extraCost;

          totalNetEarnings += net;

          const bookingDate = b.completed_at || b.scheduled_date || b.created_at || '';
          if (bookingDate.startsWith(todayIso) || b.scheduled_date === 'Today') {
            todayNetEarnings += net;
          }

          history.push({
            id: matchingPay?.id || `pay-${b.id}`,
            booking_id: b.id,
            worker_id: workerId,
            customer_id: b.customer_id,
            amount: grossAmount,
            workerNet: net,
            worker_net: net,
            extra_parts_amount: extraCost,
            payment_method: (matchingPay?.payment_mode || b.payment_mode || 'Online') as PaymentMode,
            payment_mode: matchingPay?.payment_mode || b.payment_mode || 'Online',
            payment_status: 'paid',
            created_at: b.completed_at || b.created_at || new Date().toISOString(),
          });
        }

        return {
          todayEarnings: todayNetEarnings > 0 ? todayNetEarnings : totalNetEarnings,
          totalEarnings: totalNetEarnings,
          completedJobs: completedBookings.length,
          pendingRequestsCount: allBookings.filter((b: any) => b.status === 'requested' || b.status === 'Pending').length,
          acceptedJobsCount: allBookings.filter((b: any) =>
            ['accepted', 'Worker Accepted', 'travelling', 'Worker Travelling', 'arrived', 'Worker Arrived', 'in_progress', 'Service In Progress'].includes(b.status)
          ).length,
          paidJobsCount: completedBookings.length,
          paymentsHistory: history,
        };
      } catch (err) {
        console.warn('Supabase query error on earnings, using local store:', err);
      }
    }

    // Fallback over in-memory bookings for this worker
    const workerBookings = this.bookings.filter(
      (b) => b.workerId === workerId || (b as any).worker_id === workerId
    );
    const completedBookings = workerBookings.filter(
      (b) => b.status === 'completed' || b.status === 'paid' || b.status === 'Completed' || b.paymentStatus === 'paid'
    );

    let totalNet = 0;
    const history: Payment[] = [];
    for (const b of completedBookings) {
      const gross = b.totalAmount || b.estimatedPrice || 299;
      const extra = b.extraMaterialsCost || 0;
      const net = Math.round((gross - extra) * 0.90) + extra;
      totalNet += net;
      history.push({
        id: `pay-${b.id}`,
        booking_id: b.id,
        worker_id: workerId,
        customer_id: b.customer_id,
        amount: gross,
        workerNet: net,
        worker_net: net,
        extra_parts_amount: extra,
        payment_method: (b.paymentMode || 'Online') as PaymentMode,
        payment_mode: b.paymentMode || 'Online',
        payment_status: 'paid',
        created_at: b.completedAt || new Date().toISOString(),
      });
    }

    return {
      todayEarnings: totalNet,
      totalEarnings: totalNet,
      completedJobs: completedBookings.length,
      pendingRequestsCount: workerBookings.filter((b) => b.status === 'requested' || b.status === 'Pending').length,
      acceptedJobsCount: workerBookings.filter((b) =>
        ['accepted', 'Worker Accepted', 'travelling', 'Worker Travelling', 'arrived', 'Worker Arrived', 'in_progress', 'Service In Progress'].includes(b.status)
      ).length,
      paidJobsCount: completedBookings.length,
      paymentsHistory: history,
    };
  }

  async getCooperatives(): Promise<CooperativeSociety[]> {
    if (this.cooperatives && this.cooperatives.length > 0) {
      return this.cooperatives;
    }
    this.cooperatives = [...COOPERATIVE_SOCIETIES];
    return this.cooperatives;
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

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Cooperative creation cannot proceed without a backend.');
    }

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
      throw err;
    }

    this.cooperatives = [newCoop, ...this.cooperatives];
    return newCoop;
  }

  // ===================== CUSTOMERS =====================
  async getCustomerById(id: string): Promise<Customer | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            full_name: data.full_name,
            email: data.email,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn('Supabase getCustomerById notice:', err);
      }
    }
    return null;
  }

  async getCustomers(): Promise<Customer[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            full_name: d.full_name,
            email: d.email,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn('Supabase getCustomers notice:', err);
      }
    }
    return [];
  }
}

export const sahaayakService = new SahaayakService();
