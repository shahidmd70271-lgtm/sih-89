import { AuthUser, Booking, CooperativeSociety, Customer, Review, ServiceType, Worker, WorkerNotification } from '../types';

export interface IAuthService {
  customerSignUp(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: AuthUser | null; message: string; requiresEmailConfirmation?: boolean }>;
  customerSignIn(params: { email: string; password: string }): Promise<AuthUser>;
  signInWithGoogle(email?: string, name?: string): Promise<AuthUser>;
  signInWithPhone(phone: string, otp: string, name?: string): Promise<AuthUser>;
  verifyPhoneOtp(phone: string, otp: string): Promise<boolean>;
  adminSignIn(email: string, passcode: string): Promise<AuthUser>;
  workerSignIn(
    credentials: { emailOrPhone: string; password?: string },
    existingWorkers?: Worker[]
  ): Promise<{ user: AuthUser; worker?: Worker; status: 'Pending' | 'Verified' | 'Rejected' | 'NotFound' }>;
  getCurrentUser(): AuthUser | null;
  signOut(): Promise<void>;
}

export interface ISahaayakService {
  // Workers
  getWorkers(): Promise<Worker[]>;
  getApprovedWorkers(): Promise<Worker[]>;
  getPendingWorkers(): Promise<Worker[]>;
  getWorkerById(id: string): Promise<Worker | null>;
  createWorkerApplication(workerData: Partial<Worker>): Promise<Worker>;
  approveWorkerApplication(workerId: string): Promise<Worker>;
  rejectWorkerApplication(workerId: string, reason?: string): Promise<void>;
  removeWorker(workerId: string, adminId?: string, reason?: string): Promise<Worker>;
  updateWorkerOnlineStatus(workerId: string, isOnline: boolean): Promise<void>;
  
  // Bookings
  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking | null>;
  createBooking(bookingData: Partial<Booking>): Promise<Booking>;
  acceptBooking(bookingId: string, workerId: string): Promise<Booking>;
  rejectBooking(bookingId: string, workerId: string, reason?: string): Promise<Booking>;
  updateBookingStatus(bookingId: string, status: string): Promise<Booking>;
  completeJobAndRecordPayment(
    bookingId: string,
    paymentMode: any,
    extraMaterialsCost?: number
  ): Promise<{ booking: Booking; payment: any }>;
  confirmPaymentReceived(bookingId: string): Promise<Booking>;

  // Cooperatives
  getCooperatives(): Promise<CooperativeSociety[]>;
  createCooperative(coopData: Partial<CooperativeSociety>): Promise<CooperativeSociety>;

  // Customers
  getCustomerById(id: string): Promise<Customer | null>;
  getCustomers(): Promise<Customer[]>;
}
