import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  LanguageCode,
  Worker,
  Booking,
  BookingStatus,
  ServiceType,
  ChatMessage,
  AvailabilitySlot,
  WorkerNotification,
  AuthUser,
  PaymentMode,
  Payment,
  CooperativeSociety,
  DateSlotOverride,
} from '../types';
import { COOPERATIVE_SOCIETIES } from '../data/mockData';
import { translate } from '../translations';
import { authService } from '../services/authService';
import { sahaayakService, mapDbRowToWorker } from '../services/sahaayakService';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { computeWorkerSlotsForDate, toggleSlotForDate } from '../utils/availabilityUtils';
import { isBookingActiveForExecution } from '../utils/statusUtils';
import { isValidUuid } from '../utils/uuidUtils';

interface AppContextType {
  // Auth state
  authLoading: boolean;
  currentUser: AuthUser | null;
  currentRole: UserRole;
  userRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;

  // Auth Modals & Actions
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  isWorkerAuthModalOpen: boolean;
  setIsWorkerAuthModalOpen: (open: boolean) => void;
  registerCustomer: (params: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; autoLoggedIn: boolean }>;
  loginAsCustomer: (params: {
    email?: string;
    password?: string;
    provider?: 'google' | 'phone';
    phone?: string;
    name?: string;
    otp?: string;
  }) => Promise<AuthUser>;
  loginAsWorker: (credentials: {
    emailOrPhone: string;
    password?: string;
  }) => Promise<{
    user: AuthUser;
    worker?: Worker;
    status: 'Pending' | 'Verified' | 'Rejected' | 'NotFound';
  }>;
  loginAsAdmin: (email: string, passcode: string) => Promise<AuthUser>;
  logout: () => Promise<void>;

  // Data & State
  workers: Worker[];
  currentWorker: Worker | null;
  cooperatives: CooperativeSociety[];
  bookings: Booking[];
  activeBooking: Booking | null;
  selectedWorker: Worker | null;
  selectedServiceFilter: ServiceType | 'All';
  setSelectedServiceFilter: (service: ServiceType | 'All') => void;

  // Worker online/offline state
  isWorkerOnline: boolean;
  setIsWorkerOnline: (online: boolean) => void;

  // Worker Notification Center
  workerNotifications: WorkerNotification[];
  unreadNotificationsCount: number;
  isWorkerNotifPanelOpen: boolean;
  setIsWorkerNotifPanelOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addWorkerNotification: (notification: Omit<WorkerNotification, 'id' | 'timestamp' | 'isRead'>) => void;

  // Modals state
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  isWorkerProfileModalOpen: boolean;
  setIsWorkerProfileModalOpen: (open: boolean) => void;
  isMessagesModalOpen: boolean;
  setIsMessagesModalOpen: (open: boolean) => void;
  isCallModalOpen: boolean;
  setIsCallModalOpen: (open: boolean) => void;
  isWorkerJoinModalOpen: boolean;
  setIsWorkerJoinModalOpen: (open: boolean) => void;

  // Actions
  openBookingForWorker: (worker: Worker, isEmergency?: boolean) => void;
  openWorkerProfile: (worker: Worker) => void;
  createNewBooking: (newBookingData: Partial<Booking>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  acceptBookingByWorker: (bookingId: string, workerId?: string) => Promise<void>;
  rejectBookingByWorker: (bookingId: string, workerId?: string, reason?: string) => Promise<void>;
  verifyOtpAndStartService: (bookingId: string, enteredOtp: string) => Promise<{ success: boolean; message: string }>;
  verifyWorker: (workerId: string, status: 'Verified' | 'Rejected') => void;
  approveWorkerVerification: (workerId: string) => Promise<void>;
  rejectWorkerVerification: (workerId: string) => Promise<void>;
  removeWorkerFromNetwork: (workerId: string, reason?: string) => Promise<void>;
  addNewWorker: (workerData: Partial<Worker>) => Promise<Worker>;
  addCooperative: (coopData: Partial<CooperativeSociety>) => Promise<CooperativeSociety>;
  setActiveBookingById: (bookingId: string) => void;
  openEmergencySOS: (preselectedService?: ServiceType) => void;
  toggleWorkerSlot: (workerId: string, slotId: string) => void;
  setWorkerSlotAvailability: (workerId: string, slotId: string, isAvailable: boolean) => void;
  toggleWorkerDateSlot: (workerId: string, dateString: string, slotId: string) => Promise<void>;
  setWorkerWorkingDays: (workerId: string, days: string[]) => Promise<void>;

  // Job & Payment Completion
  recordPaymentAndCompleteJob: (
    bookingId: string,
    paymentMode: PaymentMode,
    extraMaterialsCost?: number
  ) => Promise<void>;
  confirmPaymentReceived: (bookingId: string) => Promise<void>;

  // Real Worker Earnings
  getWorkerEarnings: (workerId?: string) => Promise<{
    todayEarnings: number;
    totalEarnings: number;
    completedJobs: number;
    pendingRequestsCount: number;
    acceptedJobsCount: number;
    paidJobsCount: number;
    paymentsHistory: Payment[];
  }>;

  // Messages state
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'customer' | 'worker') => void;

  // Translation helper
  t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const parseRouteFromUrl = (): { view?: string; role?: UserRole } | null => {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase();
  const path = window.location.pathname.replace(/^\//, '').trim().toLowerCase();
  const rawRoute = hash || path;

  if (!rawRoute) return null;

  // Admin routes
  if (
    rawRoute === 'admin' ||
    rawRoute === 'admin-desk' ||
    rawRoute === 'admin-verification' ||
    rawRoute === 'admin/verification'
  ) {
    return { view: 'admin-verification', role: 'admin' };
  }
  if (rawRoute === 'admin-dashboard' || rawRoute === 'admin-overview' || rawRoute === 'admin/dashboard') {
    return { view: 'admin-dashboard', role: 'admin' };
  }
  if (rawRoute === 'admin-cooperatives' || rawRoute === 'admin/cooperatives') {
    return { view: 'admin-cooperatives', role: 'admin' };
  }
  if (rawRoute === 'admin-analytics' || rawRoute === 'admin/analytics') {
    return { view: 'admin-analytics', role: 'admin' };
  }
  if (rawRoute === 'admin-ai-forecast' || rawRoute === 'admin/ai-forecast') {
    return { view: 'admin-ai-forecast', role: 'admin' };
  }

  // Worker routes
  if (rawRoute === 'worker' || rawRoute === 'worker-portal' || rawRoute === 'worker-dashboard' || rawRoute === 'worker/dashboard') {
    return { view: 'worker-dashboard', role: 'worker' };
  }
  if (rawRoute === 'worker-jobs' || rawRoute === 'worker/jobs') {
    return { view: 'worker-jobs', role: 'worker' };
  }
  if (rawRoute === 'worker-schedule' || rawRoute === 'worker/schedule') {
    return { view: 'worker-schedule', role: 'worker' };
  }
  if (rawRoute === 'worker-earnings' || rawRoute === 'worker/earnings') {
    return { view: 'worker-earnings', role: 'worker' };
  }
  if (rawRoute === 'worker-welfare' || rawRoute === 'worker/welfare') {
    return { view: 'worker-welfare', role: 'worker' };
  }
  if (rawRoute === 'worker-profile' || rawRoute === 'worker/profile') {
    return { view: 'worker-profile', role: 'worker' };
  }

  // Customer routes
  if (rawRoute === 'find-services' || rawRoute === 'services' || rawRoute === 'catalog') {
    return { view: 'find-services', role: 'customer' };
  }
  if (rawRoute === 'customer-bookings' || rawRoute === 'my-bookings' || rawRoute === 'bookings') {
    return { view: 'customer-bookings', role: 'customer' };
  }
  if (rawRoute === 'customer-profile' || rawRoute === 'customer/profile' || rawRoute === 'profile') {
    return { view: 'customer-profile', role: 'customer' };
  }
  if (rawRoute === 'customer-messages' || rawRoute === 'customer/messages' || rawRoute === 'messages') {
    return { view: 'customer-messages', role: 'customer' };
  }
  if (rawRoute === 'customer-payments' || rawRoute === 'customer/payments' || rawRoute === 'fair-payments' || rawRoute === 'payments') {
    return { view: 'customer-payments', role: 'customer' };
  }
  if (rawRoute === 'customer' || rawRoute === 'customer-dashboard') {
    return { view: 'customer-dashboard', role: 'customer' };
  }
  if (rawRoute === 'landing' || rawRoute === 'home') {
    return { view: 'landing', role: 'customer' };
  }

  return {
    view: rawRoute,
    role: rawRoute.startsWith('admin-') ? 'admin' : rawRoute.startsWith('worker-') ? 'worker' : 'customer',
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session & Role
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    return authService.getCurrentUser();
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const urlRoute = parseRouteFromUrl();
    if (urlRoute?.role) return urlRoute.role;
    const saved = authService.getCurrentUser();
    return saved ? saved.role : 'customer';
  });

  const [activeView, setActiveViewState] = useState<string>(() => {
    const urlRoute = parseRouteFromUrl();
    if (urlRoute?.view) return urlRoute.view;
    const saved = authService.getCurrentUser();
    if (saved?.role === 'admin') return 'admin-verification';
    if (saved?.role === 'worker') return 'worker-dashboard';
    if (saved?.role === 'customer') return 'customer-dashboard';
    return 'landing';
  });

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    if (view.startsWith('admin-')) {
      setCurrentRoleState('admin');
    } else if (view.startsWith('worker-')) {
      setCurrentRoleState('worker');
    } else if (
      view === 'find-services' ||
      view === 'customer-dashboard' ||
      view === 'customer-bookings' ||
      view === 'my-bookings' ||
      view === 'customer-profile' ||
      view === 'customer-messages' ||
      view === 'customer-payments'
    ) {
      setCurrentRoleState('customer');
    }
    try {
      if (typeof window !== 'undefined') {
        const targetHash = view === 'landing' ? '' : `#${view}`;
        window.history.replaceState(null, '', window.location.pathname + targetHash);
      }
    } catch {
      // ignore
    }
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
  };

  // Synchronize browser history / URL hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const urlRoute = parseRouteFromUrl();
      if (urlRoute?.view) {
        setActiveViewState(urlRoute.view);
        if (urlRoute.role) {
          setCurrentRoleState(urlRoute.role);
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('sahaayak_language');
      if (saved === 'en' || saved === 'hi' || saved === 'te') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sahaayak_language', lang);
    } catch {
      // ignore
    }
  };

  // Auth Loading & Modals
  const [authLoading, setAuthLoading] = useState(true);
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [isWorkerAuthModalOpen, setIsWorkerAuthModalOpen] = useState(false);
  const [isWorkerJoinModalOpen, setIsWorkerJoinModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isWorkerProfileModalOpen, setIsWorkerProfileModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  // Real database state (initial empty state, filled by real user actions)
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cooperatives, setCooperatives] = useState<CooperativeSociety[]>(COOPERATIVE_SOCIETIES);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<ServiceType | 'All'>('All');
  const [isWorkerOnline, setIsWorkerOnline] = useState<boolean>(true);

  // Worker Notifications & Chat
  const [workerNotifications, setWorkerNotifications] = useState<WorkerNotification[]>([]);
  const [isWorkerNotifPanelOpen, setIsWorkerNotifPanelOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // 1. App Startup: Restore Auth Session from Supabase Auth & Hydrate Worker Profile
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Worker Auth] Initializing session verification...');
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase.auth.getSession();

          if (error) {
            console.error('[Worker Auth] getSession error:', error.message);
            return;
          }

          if (!mounted) return;

          if (data?.session?.user) {
            const authUserId = data.session.user.id;
            console.log('[Worker Auth] Restored session for user ID:', authUserId);

            // 1. Check if user is a Worker in public.workers
            try {
              let workerQuery = supabase.from('workers').select('*');
              if (isValidUuid(authUserId)) {
                if (data.session.user.email) {
                  workerQuery = workerQuery.or(`profile_id.eq.${authUserId},email.eq.${data.session.user.email}`);
                } else {
                  workerQuery = workerQuery.eq('profile_id', authUserId);
                }
              } else if (data.session.user.email) {
                workerQuery = workerQuery.eq('email', data.session.user.email);
              }
              const { data: workerRow } = await workerQuery.maybeSingle();

              if (workerRow && mounted) {
                const mappedWorker = mapDbRowToWorker(workerRow);
                const isApproved =
                  mappedWorker.isVerified ||
                  mappedWorker.verificationStatus === 'Verified' ||
                  mappedWorker.verificationStatus === 'approved';

                if (isApproved) {
                  const workerUser: AuthUser = {
                    id: authUserId,
                    name: mappedWorker.name,
                    email: mappedWorker.email || data.session.user.email,
                    phone: mappedWorker.phone,
                    role: 'worker',
                    avatar: mappedWorker.avatar,
                    workerId: mappedWorker.id,
                    applicationId: mappedWorker.applicationId,
                    workerStatus: 'Verified',
                    cooperativeName: mappedWorker.cooperativeName,
                    authProvider: 'phone',
                    token: data.session.access_token,
                  };

                  console.log('[Worker Auth] Worker ID:', mappedWorker.id, 'Name:', mappedWorker.name);
                  setCurrentUser(workerUser);
                  setCurrentRoleState('worker');
                  setWorkers((prev) => {
                    const exists = prev.some((w) => w.id === mappedWorker.id);
                    return exists ? prev : [mappedWorker, ...prev];
                  });

                  setActiveViewState((currView) => {
                    if (currView === 'landing' || !currView) {
                      return 'worker-dashboard';
                    }
                    return currView;
                  });
                }
              } else if (mounted) {
                // Check if user is customer or admin in public.profiles
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', authUserId)
                  .maybeSingle();

                if (profile && mounted) {
                  const role = (profile.role as UserRole) || 'customer';
                  const user: AuthUser = {
                    id: authUserId,
                    name: profile.full_name || 'Sahaayak User',
                    email: profile.email || data.session.user.email,
                    role: role,
                    avatar: profile.avatar_url,
                    authProvider: 'phone',
                    token: data.session.access_token,
                  };
                  setCurrentUser(user);
                  setCurrentRoleState(role);
                  if (role === 'admin') {
                    setActiveViewState((currView) => (currView === 'landing' || !currView ? 'admin-verification' : currView));
                  } else if (role === 'customer') {
                    setActiveViewState((currView) => (currView === 'landing' || !currView ? 'customer-dashboard' : currView));
                  }
                }
              }
            } catch (wErr) {
              console.warn('[Worker Auth] Profile lookup notice:', wErr);
            }
          }
        }
      } catch (err) {
        console.warn('[Worker Auth] Auth init exception:', err);
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initializeAuth();

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[Worker Auth] onAuthStateChange event:', event, 'session:', Boolean(session));
        if (event === 'SIGNED_OUT') {
          if (authService.getCurrentUser() === null) {
            setCurrentUser(null);
            setCurrentRoleState('customer');
            setActiveViewState('landing');
          }
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // 2. Conditional Portal Data Loader (Loads data on-demand based on active view)
  useEffect(() => {
    const isLandingOnly = activeView === 'landing' && !currentUser && !isBookingModalOpen;
    if (isLandingOnly) {
      return;
    }

    let isMounted = true;

    const loadPortalData = async () => {
      try {
        const needsWorkers =
          activeView === 'find-services' ||
          activeView === 'booking-flow' ||
          isBookingModalOpen ||
          currentRole === 'worker' ||
          activeView.startsWith('worker-') ||
          currentRole === 'admin' ||
          activeView.startsWith('admin-');

        const needsBookings =
          activeView === 'my-bookings' ||
          activeView === 'customer-dashboard' ||
          currentRole === 'worker' ||
          activeView.startsWith('worker-') ||
          currentRole === 'admin' ||
          activeView.startsWith('admin-') ||
          Boolean(currentUser);

        const needsReviews =
          activeView === 'find-services' ||
          activeView === 'my-bookings' ||
          currentRole === 'admin' ||
          activeView.startsWith('admin-');

        const promises: Promise<any>[] = [];

        if (needsWorkers && workers.length === 0) {
          promises.push(
            sahaayakService.getWorkers().then((dbWorkers) => {
              if (isMounted) {
                console.log('[Worker Data] Profile loaded. Total workers:', dbWorkers.length);
                setWorkers(dbWorkers);
              }
            }).catch((err) => console.warn('[AppContext] Workers load notice:', err))
          );
        }

        if (needsBookings) {
          promises.push(
            sahaayakService.getBookings().then((dbBookings) => {
              if (isMounted) {
                console.log('[Worker Data] Bookings loaded. Total:', dbBookings.length);
                setBookings(dbBookings);
                const initialActive = dbBookings.find((b) => isBookingActiveForExecution(b.status));
                if (initialActive) {
                  setActiveBookingId(initialActive.id);
                }
              }
            }).catch((err) => console.warn('[AppContext] Bookings load notice:', err))
          );
        }

        await Promise.all(promises);
      } catch (err) {
        console.warn('[AppContext] Portal data fetch notice:', err);
      }
    };

    loadPortalData();

    return () => {
      isMounted = false;
    };
  }, [activeView, currentRole, currentUser, isBookingModalOpen]);

  // 3. Worker Realtime & Polling Heartbeat (Active ONLY in Worker Portal or when Worker is signed in)
  useEffect(() => {
    const isWorkerActive =
      currentRole === 'worker' ||
      activeView.startsWith('worker-') ||
      Boolean(currentUser && currentUser.role === 'worker');

    if (!isWorkerActive || !isSupabaseConfigured || !supabase) {
      return;
    }

    const workerId = currentUser?.workerId || currentUser?.id || 'all';
    console.log('[Worker Realtime] Subscribing for worker ID:', workerId);

    let bookingsChannel: any = null;
    let pollInterval: any = null;

    try {
      bookingsChannel = supabase
        .channel(`worker-realtime-bookings-${workerId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
          },
          async (payload) => {
            console.log('[Worker Realtime] New booking change received:', payload.eventType, (payload.new as any)?.id);
            try {
              const freshBookings = await sahaayakService.getBookings();
              setBookings(freshBookings);
              console.log('[Worker Realtime] Bookings updated from realtime. Count:', freshBookings.length);
            } catch (e) {
              console.warn('[Worker Realtime] Bookings reload notice:', e);
            }
          }
        )
        .subscribe((status, err) => {
          console.log('[Worker Realtime] Channel status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('[Worker Realtime] SUBSCRIBED successfully to bookings');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('[Worker Realtime] Channel error/timeout:', err);
          }
        });

      pollInterval = setInterval(async () => {
        try {
          const freshBookings = await sahaayakService.getBookings();
          setBookings(freshBookings);
        } catch (e) {
          // silent catch on background poll
        }
      }, 6000);
    } catch (err) {
      console.warn('[Worker Realtime] Subscription exception:', err);
    }

    return () => {
      console.log('[Worker Realtime] Cleaning up worker realtime channel');
      if (pollInterval) clearInterval(pollInterval);
      if (bookingsChannel && supabase) {
        supabase.removeChannel(bookingsChannel);
      }
    };
  }, [currentRole, activeView.startsWith('worker-'), currentUser?.id]);

  // Fallback worker profile from authenticated session while database query resolves
  const fallbackWorkerFromUser: Worker | null = useMemo(() => {
    if (currentUser?.role !== 'worker') return null;
    return {
      id: currentUser.workerId || currentUser.id,
      name: currentUser.name || 'Registered Worker',
      email: currentUser.email,
      phone: currentUser.phone || '9876543210',
      avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      skill: (currentUser as any).skill || 'Plumbing',
      experienceYears: 5,
      distanceKm: 2.5,
      basePricePerHour: 250,
      rating: 5.0,
      reviewsCount: 1,
      completedJobs: 1,
      workingHours: '9:00 AM - 7:00 PM',
      bio: 'Labour cooperative certified specialist.',
      languages: ['Hindi', 'English'],
      certifications: [],
      verificationDocType: 'Labour Cooperative Verification Dossier',
      safetyRating: 5.0,
      insuranceCovered: true,
      emergencyAvailable: true,
      reviews: [],
      availability: 'Available Today',
      isVerified: true,
      verificationStatus: 'Verified',
      approval_status: 'approved',
      cooperativeId: (currentUser as any).cooperativeId || 'coop-1',
      cooperativeName: currentUser.cooperativeName || 'National Federation of Labour Cooperatives (NLCF)',
      location: 'Delhi NCR',
      profile_id: currentUser.id,
      applicationId: currentUser.applicationId || 'APP-WKR',
      availabilitySlots: [],
    };
  }, [currentUser?.id, currentUser?.role, currentUser?.workerId, currentUser?.name, currentUser?.email, currentUser?.phone, currentUser?.avatar, currentUser?.cooperativeName]);

  // Current logged in worker resolution: strictly resolve to authenticated worker with seamless fallback
  const currentWorker = useMemo(() => {
    if (currentUser?.role !== 'worker') return null;
    return (
      (currentUser.workerId ? workers.find((w) => w.id === currentUser.workerId) : null) ||
      workers.find(
        (w) =>
          w.profile_id === currentUser.id ||
          (w.email && currentUser.email && w.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (w.phone && currentUser.phone && w.phone === currentUser.phone) ||
          (w.name && currentUser.name && w.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim())
      ) ||
      fallbackWorkerFromUser
    );
  }, [currentUser, workers, fallbackWorkerFromUser]);

  // Synchronize worker notifications dynamically from requested bookings
  useEffect(() => {
    const targetWorker = currentWorker || (workers.length > 0 ? workers[0] : null);
    if (!targetWorker) return;

    const isWorkerBooking = (b: Booking) => {
      return (
        b.workerId === targetWorker.id ||
        (b as any).worker_id === targetWorker.id ||
        (targetWorker.profile_id &&
          (b.workerId === targetWorker.profile_id || (b as any).worker_id === targetWorker.profile_id)) ||
        (b.workerName && targetWorker.name && b.workerName.toLowerCase().trim() === targetWorker.name.toLowerCase().trim())
      );
    };

    const workerRequestedBookings = bookings.filter(
      (b) =>
        (isWorkerBooking(b) || (b.isEmergency && b.serviceType === targetWorker.skill)) &&
        (b.status === 'requested' || b.status === 'Pending' || b.status === 'Waiting for Response')
    );

    setWorkerNotifications((prev) => {
      let changed = false;
      const updated = [...prev];
      for (const b of workerRequestedBookings) {
        const notifId = `notif-${b.id}`;
        if (!updated.some((n) => n.id === notifId || n.bookingId === b.id)) {
          changed = true;
          updated.unshift({
            id: notifId,
            workerId: targetWorker.id,
            bookingId: b.id,
            type: b.isEmergency ? 'emergency_request' : 'service_request',
            title: b.isEmergency ? 'New Emergency Request' : 'New Service Request',
            message: `${b.customerName || 'Customer'} requested ${b.serviceType} Service (${b.timeSlot || 'Scheduled'}).`,
            timestamp: b.createdAt || 'Just now',
            isRead: false,
            isEmergency: b.isEmergency,
          });
        }
      }
      return changed ? updated : prev;
    });
  }, [bookings, currentWorker, workers]);

  const activeBooking = (() => {
    // If activeBookingId is set, verify that it is actually active
    if (activeBookingId) {
      const b = bookings.find((bk) => bk.id === activeBookingId);
      if (b && isBookingActiveForExecution(b.status)) {
        return b;
      }
    }

    // If current user is a worker, find the worker's active booking
    if (currentWorker) {
      const workerActive = bookings.find((b) => {
        const isMatch =
          b.workerId === currentWorker.id ||
          (b as any).worker_id === currentWorker.id ||
          (currentWorker.profile_id &&
            (b.workerId === currentWorker.profile_id || (b as any).worker_id === currentWorker.profile_id));
        return isMatch && isBookingActiveForExecution(b.status);
      });
      return workerActive || null;
    }

    // If current user is a customer, find their active ongoing booking
    if (currentUser?.role === 'customer') {
      const customerActive = bookings.find((b) => {
        const isMatch = b.customer_id === currentUser.id || b.customerName === currentUser.name;
        return isMatch && (b.status === 'requested' || isBookingActiveForExecution(b.status));
      });
      return customerActive || null;
    }

    return null;
  })();

  const unreadNotificationsCount = workerNotifications.filter((n) => !n.isRead).length;

  const t = (key: string, params?: Record<string, string | number>): string => {
    return translate(language, key, params);
  };

  // Auth Operations
  const registerCustomer = async (params: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ success: boolean; message: string; autoLoggedIn: boolean }> => {
    const result = await authService.customerSignUp(params);
    if (result.user) {
      setCurrentUser(result.user);
      setCurrentRole('customer');
      setActiveView('customer-dashboard');
      return { success: true, message: result.message, autoLoggedIn: true };
    }
    return { success: true, message: result.message, autoLoggedIn: false };
  };

  const loginAsCustomer = async (params: {
    email?: string;
    password?: string;
    provider?: 'google' | 'phone';
    phone?: string;
    name?: string;
    otp?: string;
  }): Promise<AuthUser> => {
    let user: AuthUser;
    if (params.email && params.password) {
      user = await authService.customerSignIn({
        email: params.email,
        password: params.password,
      });
    } else if (params.provider === 'google') {
      user = await authService.signInWithGoogle(params.email, params.name);
    } else {
      user = await authService.signInWithPhone(params.phone || '', params.otp || '5842', params.name);
    }
    setCurrentUser(user);
    setCurrentRole('customer');
    setActiveView('customer-dashboard');
    return user;
  };

  const loginAsWorker = async (
    credentials: { emailOrPhone: string; password?: string }
  ): Promise<{
    user: AuthUser;
    worker?: Worker;
    status: 'Pending' | 'Verified' | 'Rejected' | 'NotFound';
  }> => {
    const result = await authService.workerSignIn(credentials, workers);
    if (result.status === 'Verified') {
      setCurrentUser(result.user);
      setCurrentRole('worker');
      setActiveView('worker-dashboard');
    }
    return result;
  };

  const loginAsAdmin = async (email: string, passcode: string): Promise<AuthUser> => {
    const adminUser = await authService.adminSignIn(email, passcode);
    setCurrentUser(adminUser);
    setCurrentRole('admin');
    setActiveView('admin-verification');
    return adminUser;
  };

  const logout = async (): Promise<void> => {
    await authService.signOut();
    setCurrentUser(null);
    setCurrentRole('customer');
    setActiveView('landing');
  };

  const addWorkerNotification = (n: Omit<WorkerNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: WorkerNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: 'Just now',
      isRead: false,
    };
    setWorkerNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setWorkerNotifications((prev) =>
      prev.map((n) => (n.id === id || n.bookingId === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setWorkerNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setWorkerNotifications((prev) => prev.filter((n) => n.id !== id && n.bookingId !== id));
  };

  const clearAllNotifications = () => {
    setWorkerNotifications([]);
  };

  const openBookingForWorker = (worker: Worker, isEmergency = false) => {
    setSelectedWorker(worker);
    if (isEmergency) {
      setIsEmergencyModalOpen(true);
    } else {
      setIsBookingModalOpen(true);
    }
  };

  const openWorkerProfile = (worker: Worker) => {
    setSelectedWorker(worker);
    setIsWorkerProfileModalOpen(true);
  };

  const openEmergencySOS = (preselectedService?: ServiceType) => {
    if (preselectedService) {
      setSelectedServiceFilter(preselectedService);
    }
    setIsEmergencyModalOpen(true);
  };

  const setActiveBookingById = (bookingId: string) => {
    setActiveBookingId(bookingId);
    if (currentRole === 'worker') {
      setActiveView('worker-live-job');
    } else {
      setActiveView('my-bookings');
    }
  };

  const toggleWorkerDateSlot = async (workerId: string, dateString: string, slotId: string) => {
    let updatedWorker: Worker | null = null;

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const currentSlots = computeWorkerSlotsForDate(w, dateString, bookings);
        const currentSlot = currentSlots.find((s) => s.id === slotId);
        const currentIsAvailable = currentSlot ? currentSlot.isAvailable : true;
        const newOverrides = toggleSlotForDate(w.dateOverrides, dateString, slotId, currentIsAvailable);
        updatedWorker = { ...w, dateOverrides: newOverrides };
        return updatedWorker;
      })
    );

    if (updatedWorker) {
      await sahaayakService.updateWorkerAvailabilityConfig(workerId, {
        dateOverrides: (updatedWorker as Worker).dateOverrides,
        workingDays: (updatedWorker as Worker).workingDays,
        availabilitySlots: (updatedWorker as Worker).availabilitySlots,
      });
    }
  };

  const setWorkerWorkingDays = async (workerId: string, days: string[]) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        return { ...w, workingDays: days };
      })
    );

    await sahaayakService.updateWorkerAvailabilityConfig(workerId, {
      workingDays: days,
    });
  };

  const toggleWorkerSlot = (workerId: string, slotId: string) => {
    // Default backward compatible helper toggling for Today
    toggleWorkerDateSlot(workerId, 'Today', slotId);
  };

  const setWorkerSlotAvailability = (workerId: string, slotId: string, isAvailable: boolean) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const updatedSlots = (w.availabilitySlots || []).map((s) =>
          s.id === slotId ? { ...s, isAvailable } : s
        );
        return { ...w, availabilitySlots: updatedSlots };
      })
    );
  };

  const createNewBooking = async (newBookingData: Partial<Booking>): Promise<Booking> => {
    const worker = workers.find((w) => w.id === newBookingData.workerId) || selectedWorker;
    if (!worker) {
      throw new Error('Please select a valid worker to book.');
    }

    const isWorkerAvailable =
      worker.isVerified &&
      (worker.verificationStatus === 'Verified' || worker.verificationStatus === 'approved') &&
      worker.verificationStatus !== 'Removed' &&
      worker.verificationStatus !== 'Inactive' &&
      (worker as any).status !== 'removed' &&
      (worker as any).status !== 'inactive';

    const validCustId = currentUser?.id && isValidUuid(currentUser.id) ? currentUser.id : undefined;

    const createdBooking = await sahaayakService.createBooking({
      ...newBookingData,
      customer_id: validCustId,
      customerName: currentUser?.name || newBookingData.customerName || 'Customer',
      customerPhone: currentUser?.phone || newBookingData.customerPhone || '',
      workerId: worker.id,
      workerName: worker.name,
      workerSkill: worker.skill,
      workerAvatar: worker.avatar,
      workerPhone: worker.phone,
      serviceType: worker.skill,
    });

    setBookings((prev) => [createdBooking, ...prev.filter((b) => b.id !== createdBooking.id)]);
    setActiveBookingId(createdBooking.id);

    addWorkerNotification({
      workerId: worker.id,
      type: createdBooking.isEmergency ? 'emergency_request' : 'service_request',
      title: createdBooking.isEmergency ? 'New Emergency Request' : 'New Service Request',
      message: `${createdBooking.customerName} requested ${createdBooking.serviceType} Service (${createdBooking.timeSlot}).`,
      bookingId: createdBooking.id,
      isEmergency: createdBooking.isEmergency,
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'system',
        text: `New service request #${createdBooking.id} created for ${worker.name}. Service OTP generated.`,
        timestamp: 'Just now',
      },
    ]);

    return createdBooking;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const updated = await sahaayakService.updateBookingStatus(bookingId, status);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updated, status } : b))
    );

    const targetBooking = bookings.find((b) => b.id === bookingId) || activeBooking;
    if (status === 'travelling') {
      addWorkerNotification({
        workerId: targetBooking?.workerId || currentWorker?.id || '',
        type: 'status_update',
        title: 'Transit Started',
        message: `You are now en route to ${targetBooking?.customerName || 'customer location'}.`,
        bookingId,
      });
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          text: `Worker started travelling to service location. Estimated arrival time updated.`,
          timestamp: 'Just now',
        },
      ]);
    } else if (status === 'arrived') {
      addWorkerNotification({
        workerId: targetBooking?.workerId || currentWorker?.id || '',
        type: 'status_update',
        title: 'Arrived at Site',
        message: `Arrived at customer location. Ask customer for service OTP to start.`,
        bookingId,
      });
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'system',
          text: `Worker arrived at doorstep. Please share your 4-digit service PIN to begin service.`,
          timestamp: 'Just now',
        },
      ]);
    }
  };

  const acceptBookingByWorker = async (bookingId: string, workerId?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const assignedWorkerId = workerId || booking.workerId;
    const updated = await sahaayakService.acceptBooking(bookingId, assignedWorkerId);

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updated, status: 'accepted' } : b))
    );
    setActiveBookingId(bookingId);

    addWorkerNotification({
      workerId: assignedWorkerId,
      type: 'status_update',
      title: 'Booking Accepted',
      message: `Booking #${booking.id} accepted successfully for ${booking.customerName}.`,
      bookingId: booking.id,
    });

    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'system',
        text: `Worker ${booking.workerName} accepted booking #${booking.id}. OTP for service verification is available in your bookings tab.`,
        timestamp: 'Just now',
      },
    ]);
  };

  const rejectBookingByWorker = async (bookingId: string, workerId?: string, reason?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const assignedWorkerId = workerId || booking.workerId;
    await sahaayakService.rejectBooking(bookingId, assignedWorkerId, reason);

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'rejected',
              rejectionReason: reason || 'Worker unavailable',
              rejectedAt: 'Just now',
            }
          : b
      )
    );
  };

  const verifyOtpAndStartService = async (bookingId: string, enteredOtp: string) => {
    const result = await sahaayakService.verifyOtpAndStartService(bookingId, enteredOtp);
    if (result.success) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'in_progress', otp_verified: true } : b))
      );
    }
    return result;
  };

  const verifyWorker = (workerId: string, status: 'Verified' | 'Rejected') => {
    if (status === 'Verified') {
      sahaayakService.approveWorkerApplication(workerId);
    } else {
      sahaayakService.rejectWorkerApplication(workerId);
    }
    setWorkers((prev) =>
      prev.map((w) =>
        w.id === workerId
          ? {
              ...w,
              verificationStatus: status,
              isVerified: status === 'Verified',
              verificationDate: status === 'Verified' ? new Date().toISOString().split('T')[0] : undefined,
            }
          : w
      )
    );
  };

  const approveWorkerVerification = async (workerId: string) => {
    await sahaayakService.approveWorkerApplication(workerId);
    const freshWorkers = await sahaayakService.getWorkers();
    setWorkers(freshWorkers);
  };

  const rejectWorkerVerification = async (workerId: string) => {
    await sahaayakService.rejectWorkerApplication(workerId);
    const freshWorkers = await sahaayakService.getWorkers();
    setWorkers(freshWorkers);
  };

  const removeWorkerFromNetwork = async (workerId: string, reason?: string) => {
    if (currentUser?.role !== 'admin') {
      throw new Error('Unauthorized: Only administrators can remove workers from the cooperative network.');
    }
    await sahaayakService.removeWorker(workerId, currentUser.id, reason);
    const freshWorkers = await sahaayakService.getWorkers();
    setWorkers(freshWorkers);
  };

  const addNewWorker = async (workerData: Partial<Worker>): Promise<Worker> => {
    const createdWorker = await sahaayakService.createWorkerApplication(workerData);
    const freshWorkers = await sahaayakService.getWorkers();
    setWorkers(freshWorkers);
    return createdWorker;
  };

  const addCooperative = async (coopData: Partial<CooperativeSociety>): Promise<CooperativeSociety> => {
    const createdCoop = await sahaayakService.createCooperative(coopData);
    setCooperatives((prev) => [createdCoop, ...prev]);
    return createdCoop;
  };

  // Job and Payment Handling
  const recordPaymentAndCompleteJob = async (
    bookingId: string,
    paymentMode: PaymentMode,
    extraMaterialsCost = 0
  ) => {
    const { booking } = await sahaayakService.completeJobAndRecordPayment(
      bookingId,
      paymentMode,
      extraMaterialsCost
    );

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...booking } : b))
    );

    // Refresh workers to update completed jobs count
    const updatedWorkers = await sahaayakService.getWorkers();
    setWorkers(updatedWorkers);
  };

  const confirmPaymentReceived = async (bookingId: string) => {
    const updatedBooking = await sahaayakService.confirmPaymentReceived(bookingId);
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updatedBooking } : b))
    );

    const updatedWorkers = await sahaayakService.getWorkers();
    setWorkers(updatedWorkers);
  };

  const getWorkerEarnings = async (workerId?: string) => {
    const targetId = workerId || currentWorker?.id || '';
    return sahaayakService.getWorkerEarnings(targetId);
  };

  const sendChatMessage = (text: string, sender: 'customer' | 'worker' = 'customer') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);

    if (sender === 'customer') {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'worker',
            text: 'Namaste! I am on my way with necessary equipment.',
            timestamp: 'Just now',
          },
        ]);
      }, 1500);
    }
  };

  return (
    <AppContext.Provider
      value={{
        authLoading,
        currentUser,
        currentRole,
        userRole: currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        language,
        setLanguage,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        isWorkerAuthModalOpen,
        setIsWorkerAuthModalOpen,
        registerCustomer,
        loginAsCustomer,
        loginAsWorker,
        loginAsAdmin,
        logout,
        currentWorker,
        workers,
        bookings,
        cooperatives,
        activeBooking,
        selectedWorker,
        selectedServiceFilter,
        setSelectedServiceFilter,
        isWorkerOnline,
        setIsWorkerOnline,
        workerNotifications,
        unreadNotificationsCount,
        isWorkerNotifPanelOpen,
        setIsWorkerNotifPanelOpen,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        clearAllNotifications,
        addWorkerNotification,
        isBookingModalOpen,
        setIsBookingModalOpen,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isWorkerProfileModalOpen,
        setIsWorkerProfileModalOpen,
        isMessagesModalOpen,
        setIsMessagesModalOpen,
        isCallModalOpen,
        setIsCallModalOpen,
        isWorkerJoinModalOpen,
        setIsWorkerJoinModalOpen,
        openBookingForWorker,
        openWorkerProfile,
        createNewBooking,
        updateBookingStatus,
        acceptBookingByWorker,
        rejectBookingByWorker,
        verifyOtpAndStartService,
        verifyWorker,
        approveWorkerVerification,
        rejectWorkerVerification,
        removeWorkerFromNetwork,
        addNewWorker,
        addCooperative,
        setActiveBookingById,
        openEmergencySOS,
        toggleWorkerSlot,
        setWorkerSlotAvailability,
        toggleWorkerDateSlot,
        setWorkerWorkingDays,
        recordPaymentAndCompleteJob,
        confirmPaymentReceived,
        getWorkerEarnings,
        chatMessages,
        sendChatMessage,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
