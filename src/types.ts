export type UserRole = 'customer' | 'worker' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'te';

export type AuthProviderType = 'google' | 'phone' | 'admin_credentials';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  workerId?: string;
  applicationId?: string;
  workerStatus?: 'Pending' | 'Verified' | 'Rejected' | 'Removed' | 'Inactive' | 'approved' | 'pending' | 'rejected' | 'removed' | 'inactive';
  authProvider: AuthProviderType;
  cooperativeName?: string;
  token?: string;
}

export type PaymentMode = 'Online' | 'Offline';

export type ServiceType =
  | 'Plumbing'
  | 'Electrical'
  | 'Carpentry'
  | 'Painting'
  | 'Cleaning'
  | 'Driving'
  | 'Gardening'
  | 'Appliance Repair'
  | 'Caregiving'
  | 'Locksmith & Security';

export interface CooperativeSociety {
  id: string;
  name: string;
  code: string;
  state: string;
  district: string;
  location?: string;
  membersCount: number;
  memberCount?: number;
  establishedYear: number;
  registrationNumber: string;
  verifiedWorkersCount: number;
  contactNumber: string;
  contactPhone?: string;
  rating?: number;
  completedJobsTotal?: number;
}

export interface Review {
  id: string;
  customerName: string;
  customerLocation: string;
  rating: number;
  date: string;
  comment: string;
  serviceType: ServiceType;
  verifiedBooking: boolean;
}

export interface Certification {
  id: string;
  title: string;
  issuingBody: string;
  year: number;
  certificateNumber: string;
  verified: boolean;
}

export interface AvailabilitySlot {
  id: string;
  startTime: string; // e.g. '10:00 AM'
  endTime: string;   // e.g. '11:00 AM'
  label: string;     // e.g. '10:00 AM – 11:00 AM'
  isBooked: boolean;
  bookedBy?: string; // customer name
  bookingId?: string;
  isAvailable: boolean; // toggleable by worker
  isPending?: boolean; // when customer requested but worker has not yet accepted
}

export interface WorkerDocument {
  id: string;
  worker_id?: string;
  name: string;
  type: string;
  document_type?: string;
  fileSize: string;
  fileUrl?: string;
  file_path?: string;
  verified: boolean;
  verification_status?: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  uploaded_at?: string;
}

export interface WorkSample {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface Worker {
  id: string;
  profile_id?: string;
  name: string;
  avatar: string;
  skill: ServiceType;
  secondarySkills?: ServiceType[];
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  distanceKm: number;
  basePricePerHour: number;
  availability: 'Available Now' | 'Busy' | 'Available Today' | 'Offline';
  isVerified: boolean;
  cooperativeId: string;
  cooperativeName: string;
  completedJobs: number;
  workingHours: string;
  location: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  bio: string;
  languages: string[];
  certifications: Certification[];
  verificationStatus: 'Verified' | 'Pending' | 'Rejected' | 'Removed' | 'Inactive' | 'approved' | 'pending' | 'rejected' | 'removed' | 'inactive';
  status?: 'active' | 'inactive' | 'removed' | 'pending' | 'rejected';
  approval_status?: 'pending' | 'approved' | 'rejected' | 'removed';
  is_active?: boolean;
  approved_at?: string;
  approved_by?: string;
  removedAt?: string;
  removedBy?: string;
  removalReason?: string;
  verificationDocType: string;
  verificationDate?: string;
  safetyRating: number;
  insuranceCovered: boolean;
  emergencyAvailable: boolean;
  availabilitySlots?: AvailabilitySlot[];
  workingDays?: string[];
  reviews: Review[];
  // Extended Registration and Verification Fields
  applicationId?: string;
  appliedDate?: string;
  dob?: string;
  gender?: string;
  email?: string;
  password?: string;
  address?: {
    houseNumber?: string;
    street?: string;
    town?: string;
    district?: string;
    state?: string;
    pinCode?: string;
  };
  maskedAadhaar?: string;
  membershipId?: string;
  documents?: WorkerDocument[];
  workSamples?: WorkSample[];
  workDescription?: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    upiId?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation?: string;
  };
  insuranceDetails?: {
    membership?: string;
    policyNumber?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'travelling'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'paid'
  | 'cancelled'
  | 'rejected'
  | 'Pending'
  | 'Waiting for Response'
  | 'Worker Accepted'
  | 'Worker Rejected'
  | 'Worker Travelling'
  | 'Worker Arrived'
  | 'Service In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Confirmed'
  | 'Scheduled';

export interface Booking {
  id: string;
  customer_id?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  latitude?: number;
  longitude?: number;
  customerCoordinates?: { lat: number; lng: number };
  worker_id?: string;
  workerId: string;
  workerName: string;
  workerSkill: ServiceType;
  workerAvatar: string;
  workerPhone: string;
  workerLocation?: { lat: number; lng: number };
  serviceType: ServiceType;
  date: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  timeSlot: string;
  slotId?: string;
  problemDescription: string;
  estimatedPrice: number;
  platformFee: number;
  welfareCess: number;
  totalAmount: number;
  amount?: number;
  status: BookingStatus;
  isEmergency: boolean;
  etaMinutes: number;
  createdAt: string;
  created_at?: string;
  otpCode: string;
  otp?: string;
  otp_code?: string;
  otp_verified?: boolean;
  otp_verified_at?: string;
  paymentStatus: 'Pending' | 'Paid (Escrow)' | 'Settled to Worker' | 'Paid (Online)' | 'Paid (Cash / Offline)' | 'Paid (Direct)' | 'paid' | 'pending';
  paymentMode?: PaymentMode;
  extraMaterialsCost?: number;
  paymentReceivedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  distanceKm?: number;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  worker_id: string;
  amount: number;
  workerNet?: number;
  worker_net?: number;
  extra_parts_amount?: number;
  payment_method: PaymentMode;
  payment_status: 'pending' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface WorkerNotification {
  id: string;
  workerId?: string;
  type: 'service_request' | 'emergency_request' | 'reminder' | 'payment' | 'system' | 'status_update';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  bookingId?: string;
  actionUrl?: string;
  isEmergency?: boolean;
}

export interface DemandForecastItem {
  service: ServiceType;
  demandLevel: 'High' | 'Medium' | 'Low';
  trendPercentage: number;
  surgeReason: string;
  recommendedWorkers: number;
  activeWorkersInZone: number;
  zone: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'worker' | 'system';
  text: string;
  timestamp: string;
  isAudio?: boolean;
}
