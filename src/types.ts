export type UserRole = 'customer' | 'worker' | 'admin';

export type LanguageCode = 'en' | 'hi' | 'te';

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
  name: string;
  type: string;
  fileSize: string;
  fileUrl?: string;
  verified: boolean;
  uploadedAt: string;
}

export interface WorkSample {
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
}

export interface Worker {
  id: string;
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
  phone: string;
  bio: string;
  languages: string[];
  certifications: Certification[];
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
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
  emergencyContact?: {
    name: string;
    phone: string;
    relation?: string;
  };
  insuranceDetails?: {
    membership?: string;
    policyNumber?: string;
  };
}

export type BookingStatus =
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
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoordinates?: { lat: number; lng: number };
  workerId: string;
  workerName: string;
  workerSkill: ServiceType;
  workerAvatar: string;
  workerPhone: string;
  workerLocation?: { lat: number; lng: number };
  serviceType: ServiceType;
  date: string;
  timeSlot: string;
  slotId?: string;
  problemDescription: string;
  estimatedPrice: number;
  platformFee: number;
  welfareCess: number;
  totalAmount: number;
  status: BookingStatus;
  isEmergency: boolean;
  etaMinutes: number;
  createdAt: string;
  otpCode: string;
  paymentStatus: 'Pending' | 'Paid (Escrow)' | 'Settled to Worker';
  rejectionReason?: string;
  distanceKm?: number;
  acceptedAt?: string;
  rejectedAt?: string;
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
