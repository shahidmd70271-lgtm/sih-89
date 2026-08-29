import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  INITIAL_WORKERS,
  INITIAL_BOOKINGS,
  INITIAL_WORKER_NOTIFICATIONS,
} from '../data/mockData';
import { translate, translations } from '../translations';

interface AppContextType {
  currentRole: UserRole;
  userRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  workers: Worker[];
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
  createNewBooking: (newBookingData: Partial<Booking>) => Booking;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  acceptBookingByWorker: (bookingId: string, workerId?: string) => void;
  rejectBookingByWorker: (bookingId: string, workerId?: string, reason?: string) => void;
  verifyWorker: (workerId: string, status: 'Verified' | 'Rejected') => void;
  approveWorkerVerification: (workerId: string) => void;
  rejectWorkerVerification: (workerId: string) => void;
  addNewWorker: (workerData: Partial<Worker>) => Worker;
  setActiveBookingById: (bookingId: string) => void;
  openEmergencySOS: (preselectedService?: ServiceType) => void;
  toggleWorkerSlot: (workerId: string, slotId: string) => void;
  setWorkerSlotAvailability: (workerId: string, slotId: string, isAvailable: boolean) => void;
  
  // Messages state
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string, sender?: 'customer' | 'worker') => void;

  // Translation helper
  t: (key: string, params?: Record<string, string | number>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeView, setActiveView] = useState<string>('landing');
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('sahaayak_language');
      if (saved === 'en' || saved === 'hi' || saved === 'te') {
        return saved;
      }
    } catch (e) {
      // localStorage may be restricted in sandbox
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('sahaayak_language', lang);
    } catch (e) {
      // ignore
    }
  };

  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [activeBookingId, setActiveBookingId] = useState<string | null>('SHK-2026-8801');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(INITIAL_WORKERS[0]);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<ServiceType | 'All'>('All');

  // Worker Online Status
  const [isWorkerOnline, setIsWorkerOnline] = useState<boolean>(true);

  // Worker Notifications
  const [workerNotifications, setWorkerNotifications] = useState<WorkerNotification[]>(INITIAL_WORKER_NOTIFICATIONS);
  const [isWorkerNotifPanelOpen, setIsWorkerNotifPanelOpen] = useState(false);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isWorkerProfileModalOpen, setIsWorkerProfileModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isWorkerJoinModalOpen, setIsWorkerJoinModalOpen] = useState(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'system',
      text: 'Booking request registered. Waiting for worker response.',
      timestamp: '12 mins ago',
    },
    {
      id: 'msg-2',
      sender: 'worker',
      text: 'Namaste Rahul ji! I have accepted your request. Carrying heavy pipe sealing sealant and toolkit.',
      timestamp: '6 mins ago',
    },
    {
      id: 'msg-3',
      sender: 'customer',
      text: 'Thanks Ravi, please take elevator to 4th floor Flat 402. The leak is under the main kitchen sink.',
      timestamp: '4 mins ago',
    },
  ]);

  const activeBooking = bookings.find((b) => b.id === activeBookingId) || bookings[0] || null;
  const unreadNotificationsCount = workerNotifications.filter((n) => !n.isRead).length;

  const t = (key: string, params?: Record<string, string | number>): string => {
    return translate(language, key, params);
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
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setWorkerNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setWorkerNotifications((prev) => prev.filter((n) => n.id !== id));
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
    setActiveView('my-bookings');
  };

  const toggleWorkerSlot = (workerId: string, slotId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== workerId) return w;
        const updatedSlots = (w.availabilitySlots || []).map((s) =>
          s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s
        );
        return { ...w, availabilitySlots: updatedSlots };
      })
    );
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

  const createNewBooking = (newBookingData: Partial<Booking>): Booking => {
    const randomId = `SHK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomOtp = `${Math.floor(1000 + Math.random() * 9000)}`;
    
    const worker = workers.find((w) => w.id === newBookingData.workerId) || selectedWorker || workers[0];
    const estimatedPrice = newBookingData.estimatedPrice || worker.basePricePerHour || 299;
    const platformFee = 15;
    const welfareCess = Math.round(estimatedPrice * 0.05);
    const totalAmount = estimatedPrice + platformFee + welfareCess;

    // A customer booking ALWAYS starts in 'Pending' (Waiting for Worker response)
    const newBooking: Booking = {
      id: randomId,
      customerName: newBookingData.customerName || 'Rahul Sharma',
      customerPhone: newBookingData.customerPhone || '+91 98765 00001',
      customerAddress: newBookingData.customerAddress || 'Flat 402, Nilgiri Apartments, Sector 14',
      customerCoordinates: { lat: 28.5355, lng: 77.241 },
      workerId: worker.id,
      workerName: worker.name,
      workerSkill: worker.skill,
      workerAvatar: worker.avatar,
      workerPhone: worker.phone,
      workerLocation: { lat: 28.5422, lng: 77.234 },
      serviceType: worker.skill,
      date: newBookingData.date || 'Today, 29 Aug 2026',
      timeSlot: newBookingData.timeSlot || (newBookingData.isEmergency ? 'Immediate Dispatch (within 30 mins)' : '10:00 AM – 11:00 AM'),
      slotId: newBookingData.slotId,
      problemDescription: newBookingData.problemDescription || 'General household service repair required.',
      estimatedPrice,
      platformFee,
      welfareCess,
      totalAmount,
      status: 'Pending', // Strictly pending! Worker must manually decide
      isEmergency: !!newBookingData.isEmergency,
      distanceKm: newBookingData.distanceKm || worker.distanceKm || 1.2,
      etaMinutes: newBookingData.isEmergency ? 15 : 0,
      createdAt: 'Just now',
      otpCode: randomOtp,
      paymentStatus: 'Pending',
    };

    // Mark worker's slot as isPending (Booking Requested), NOT permanently booked yet
    if (newBookingData.slotId || newBookingData.timeSlot) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.id !== worker.id) return w;
          const updatedSlots = (w.availabilitySlots || []).map((s) => {
            if (s.id === newBookingData.slotId || s.label === newBookingData.timeSlot) {
              return {
                ...s,
                isPending: true,
                bookedBy: newBooking.customerName,
                bookingId: newBooking.id,
              };
            }
            return s;
          });
          return { ...w, availabilitySlots: updatedSlots };
        })
      );
    }

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newBooking.id);

    // Push notification to worker only if worker is online (or if emergency, notify relevant workers)
    if (newBooking.isEmergency) {
      addWorkerNotification({
        workerId: worker.id,
        type: 'emergency_request',
        title: 'New Emergency Request',
        message: `🚨 Emergency ${newBooking.serviceType} request — ${newBooking.distanceKm} km away.`,
        bookingId: newBooking.id,
        isEmergency: true,
      });
    } else {
      addWorkerNotification({
        workerId: worker.id,
        type: 'service_request',
        title: 'New Service Request',
        message: `${newBooking.customerName} requested ${newBooking.serviceType} Service (${newBooking.timeSlot}).`,
        bookingId: newBooking.id,
      });
    }

    // Add initial chat system message
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'system',
        text: `New service request #${newBooking.id} submitted for ${worker.name}. Waiting for worker acceptance. OTP for service verification is ${randomOtp}.`,
        timestamp: 'Just now',
      },
    ]);

    return newBooking;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  const acceptBookingByWorker = (bookingId: string, workerId?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const assignedWorker = workers.find((w) => w.id === (workerId || booking.workerId)) || workers[0];

    // Update booking status to Worker Accepted
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            workerId: assignedWorker.id,
            workerName: assignedWorker.name,
            workerSkill: assignedWorker.skill,
            workerAvatar: assignedWorker.avatar,
            workerPhone: assignedWorker.phone,
            status: 'Worker Accepted',
            paymentStatus: 'Paid (Escrow)',
            acceptedAt: 'Just now',
          };
        }
        return b;
      })
    );

    // Lock the worker's slot permanently as booked
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== assignedWorker.id) return w;
        const updatedSlots = (w.availabilitySlots || []).map((s) => {
          if (s.id === booking.slotId || s.label === booking.timeSlot) {
            return {
              ...s,
              isBooked: true,
              isPending: false,
              bookedBy: booking.customerName,
              bookingId: booking.id,
            };
          }
          return s;
        });
        return { ...w, availabilitySlots: updatedSlots };
      })
    );

    // Add worker notification
    addWorkerNotification({
      workerId: assignedWorker.id,
      type: 'status_update',
      title: 'Booking Accepted',
      message: `Booking #${booking.id} accepted successfully for ${booking.customerName}.`,
      bookingId: booking.id,
    });

    // Add system chat message
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'system',
        text: `Worker ${assignedWorker.name} accepted your booking #${booking.id} for ${booking.timeSlot}.`,
        timestamp: 'Just now',
      },
    ]);
  };

  const rejectBookingByWorker = (bookingId: string, workerId?: string, reason?: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    const assignedWorker = workers.find((w) => w.id === (workerId || booking.workerId)) || workers[0];

    // Update booking status to Worker Rejected
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'Worker Rejected',
            rejectionReason: reason || 'Worker unavailable at requested time',
            rejectedAt: 'Just now',
          };
        }
        return b;
      })
    );

    // Free the slot back to Available Again
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id !== assignedWorker.id) return w;
        const updatedSlots = (w.availabilitySlots || []).map((s) => {
          if (s.id === booking.slotId || s.label === booking.timeSlot) {
            return {
              ...s,
              isBooked: false,
              isPending: false,
              isAvailable: true,
              bookedBy: undefined,
              bookingId: undefined,
            };
          }
          return s;
        });
        return { ...w, availabilitySlots: updatedSlots };
      })
    );

    // Add worker notification
    addWorkerNotification({
      workerId: assignedWorker.id,
      type: 'status_update',
      title: 'Booking Rejected',
      message: `Booking #${booking.id} rejected.`,
      bookingId: booking.id,
    });

    // Add system chat message
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'system',
        text: `Your selected worker was unavailable for booking #${booking.id} (${reason || 'Unavailable'}). Please select another available worker.`,
        timestamp: 'Just now',
      },
    ]);
  };

  const verifyWorker = (workerId: string, status: 'Verified' | 'Rejected') => {
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

  const approveWorkerVerification = (workerId: string) => {
    verifyWorker(workerId, 'Verified');
  };

  const rejectWorkerVerification = (workerId: string) => {
    setWorkers((prev) => prev.filter((w) => w.id !== workerId));
    setSelectedWorker((prev) => (prev?.id === workerId ? null : prev));
  };

  const addNewWorker = (workerData: Partial<Worker>): Worker => {
    const appId = `SHK-WKR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const defaultSlots: AvailabilitySlot[] = [
      { id: 's1', startTime: '10:00 AM', endTime: '11:00 AM', label: '10:00 AM – 11:00 AM', isBooked: false, isAvailable: true },
      { id: 's2', startTime: '12:00 PM', endTime: '01:00 PM', label: '12:00 PM – 01:00 PM', isBooked: false, isAvailable: true },
      { id: 's3', startTime: '02:00 PM', endTime: '03:00 PM', label: '02:00 PM – 03:00 PM', isBooked: false, isAvailable: true },
      { id: 's4', startTime: '04:00 PM', endTime: '05:00 PM', label: '04:00 PM – 05:00 PM', isBooked: false, isAvailable: true },
      { id: 's5', startTime: '06:00 PM', endTime: '07:00 PM', label: '06:00 PM – 07:00 PM', isBooked: false, isAvailable: true },
    ];

    const newWorker: Worker = {
      id: `worker-${Date.now()}`,
      applicationId: appId,
      appliedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      name: workerData.name || 'New Registered Shramik',
      avatar:
        workerData.avatar ||
        'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
      skill: workerData.skill || 'Plumbing',
      secondarySkills: workerData.secondarySkills || [],
      rating: 5.0,
      reviewsCount: 0,
      experienceYears: workerData.experienceYears || 3,
      distanceKm: workerData.distanceKm || 1.8,
      basePricePerHour: workerData.basePricePerHour || 250,
      availability: 'Available Today',
      isVerified: false,
      cooperativeId: workerData.cooperativeId || 'coop-1',
      cooperativeName: workerData.cooperativeName || 'Delhi Shramik Seva Sahakari Samiti',
      completedJobs: 0,
      workingHours: workerData.workingHours || '9:00 AM - 7:00 PM',
      location: workerData.location || 'Sector 14, Gurugram',
      phone: workerData.phone || '+91 98123 45678',
      bio: workerData.bio || 'Registered member of Labour Cooperative Society with verified trade expertise.',
      languages: workerData.languages && workerData.languages.length > 0 ? workerData.languages : ['Hindi', 'English'],
      certifications:
        workerData.certifications && workerData.certifications.length > 0
          ? workerData.certifications
          : [
              {
                id: `cert-${Date.now()}`,
                title: `${workerData.skill || 'Trade'} Certification`,
                issuingBody: workerData.cooperativeName || 'Labour Cooperative Society',
                year: 2026,
                certificateNumber: `COOP-REG-${Math.floor(1000 + Math.random() * 9000)}`,
                verified: false,
              },
            ],
      verificationStatus: 'Pending',
      verificationDocType: workerData.verificationDocType || 'Cooperative Attested Dossier',
      safetyRating: 4.9,
      insuranceCovered: true,
      emergencyAvailable: true,
      availabilitySlots: defaultSlots,
      reviews: [],
      dob: workerData.dob,
      gender: workerData.gender,
      email: workerData.email,
      address: workerData.address,
      maskedAadhaar: workerData.maskedAadhaar,
      membershipId: workerData.membershipId,
      documents: workerData.documents,
      workSamples: workerData.workSamples,
      workDescription: workerData.workDescription,
      emergencyContact: workerData.emergencyContact,
      insuranceDetails: workerData.insuranceDetails,
    };

    setWorkers((prev) => [newWorker, ...prev]);
    return newWorker;
  };

  const sendChatMessage = (text: string, sender: 'customer' | 'worker' = 'customer') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender,
      text,
      timestamp: 'Just now',
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated worker reply after 1.5s if customer typed
    if (sender === 'customer') {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'worker',
            text: 'Got it! I am just reaching the turning near your building now.',
            timestamp: 'Just now',
          },
        ]);
      }, 1500);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        userRole: currentRole,
        setCurrentRole,
        activeView,
        setActiveView,
        language,
        setLanguage,
        workers,
        bookings,
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
        verifyWorker,
        approveWorkerVerification,
        rejectWorkerVerification,
        addNewWorker,
        setActiveBookingById,
        openEmergencySOS,
        toggleWorkerSlot,
        setWorkerSlotAvailability,
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

