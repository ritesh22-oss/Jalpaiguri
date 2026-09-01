import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Worker,
  CivicReport,
  LocalAlert,
  BloodDonor,
  BloodRequest,
  Doctor,
  Hospital,
  Job,
  RentalProperty,
  LostFoundItem,
  AppNotification,
  ServiceRequest,
  WorkerFilterState,
  ChatMessage
} from '../types';
import {
  INITIAL_WORKERS,
  INITIAL_CIVIC_REPORTS,
  INITIAL_LOCAL_ALERTS,
  INITIAL_BLOOD_DONORS,
  INITIAL_BLOOD_REQUESTS,
  INITIAL_DOCTORS,
  INITIAL_HOSPITALS,
  INITIAL_JOBS,
  INITIAL_RENTALS,
  INITIAL_LOST_FOUND,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import confetti from 'canvas-confetti';

interface AppContextType {
  workers: Worker[];
  civicReports: CivicReport[];
  localAlerts: LocalAlert[];
  bloodDonors: BloodDonor[];
  bloodRequests: BloodRequest[];
  doctors: Doctor[];
  hospitals: Hospital[];
  jobs: Job[];
  rentals: RentalProperty[];
  lostFound: LostFoundItem[];
  notifications: AppNotification[];
  serviceRequests: ServiceRequest[];
  savedItemIds: string[];
  chatMessages: Record<string, ChatMessage[]>;
  workerFilters: WorkerFilterState;
  setWorkerFilters: React.Dispatch<React.SetStateAction<WorkerFilterState>>;
  selectedAlertId: string | null;
  setSelectedAlertId: (id: string | null) => void;
  // Actions
  addWorker: (worker: Worker) => void;
  addRental: (rental: RentalProperty) => void;
  toggleSaveItem: (id: string) => void;
  isItemSaved: (id: string) => boolean;
  submitCivicReport: (report: Omit<CivicReport, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'timeline'>) => CivicReport;
  upvoteCivicReport: (id: string) => void;
  confirmLocalAlert: (alertId: string) => void;
  addLocalAlert: (alert: Omit<LocalAlert, 'id' | 'timeAgo' | 'confirmedCount'>) => void;
  submitServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => ServiceRequest;
  updateServiceRequestStatus: (id: string, status: ServiceRequest['status']) => void;
  registerBloodDonor: (donor: Omit<BloodDonor, 'id' | 'verified' | 'donationsCount'>) => void;
  submitBloodRequest: (req: Omit<BloodRequest, 'id' | 'status' | 'postedAt'>) => BloodRequest;
  applyForJob: (jobId: string, applicantName: string) => void;
  postJob: (job: Omit<Job, 'id' | 'postedTime'>) => void;
  reportLostFound: (item: Omit<LostFoundItem, 'id' | 'status'>) => void;
  sendChatMessage: (recipientId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  language: string;
  setLanguage: (lang: string) => void;
  // Admin functions
  adminVerificationQueue: { id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }[];
  approveWorkerVerification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const s = localStorage.getItem('jpg_workers');
    return s ? JSON.parse(s) : INITIAL_WORKERS;
  });

  const [civicReports, setCivicReports] = useState<CivicReport[]>(() => {
    const s = localStorage.getItem('jpg_civic_reports');
    return s ? JSON.parse(s) : INITIAL_CIVIC_REPORTS;
  });

  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>(() => {
    const s = localStorage.getItem('jpg_local_alerts');
    return s ? JSON.parse(s) : INITIAL_LOCAL_ALERTS;
  });

  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => {
    const s = localStorage.getItem('jpg_blood_donors');
    return s ? JSON.parse(s) : INITIAL_BLOOD_DONORS;
  });

  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() => {
    const s = localStorage.getItem('jpg_blood_requests');
    return s ? JSON.parse(s) : INITIAL_BLOOD_REQUESTS;
  });

  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [hospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [jobs, setJobs] = useState<Job[]>(() => {
    const s = localStorage.getItem('jpg_jobs');
    return s ? JSON.parse(s) : INITIAL_JOBS;
  });
  const [rentals, setRentals] = useState<RentalProperty[]>(() => {
    const s = localStorage.getItem('jpg_rentals');
    return s ? JSON.parse(s) : INITIAL_RENTALS;
  });
  const [lostFound, setLostFound] = useState<LostFoundItem[]>(() => {
    const s = localStorage.getItem('jpg_lost_found');
    return s ? JSON.parse(s) : INITIAL_LOST_FOUND;
  });
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('jpg_language') || 'en';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('jpg_language', lang);
  };

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => {
    const s = localStorage.getItem('jpg_service_requests');
    return s ? JSON.parse(s) : [
      {
        id: 'REQ-7821',
        workerId: 'w1',
        workerName: 'Ramesh Sarkar',
        serviceCategory: 'Electrician',
        description: 'Main switch tripping repeatedly and burning smell near MCB box',
        location: 'Kadamtala, Jalpaiguri',
        preferredDate: 'Today',
        preferredTime: 'Within 1 hour',
        status: 'Accepted',
        createdAt: '15 mins ago'
      }
    ];
  });

  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    const s = localStorage.getItem('jpg_saved');
    return s ? JSON.parse(s) : ['w1', 'doc-1'];
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    w1: [
      { id: 'm1', senderId: 'w1', senderName: 'Ramesh Sarkar', text: 'Namaskar! I saw your request for MCB wiring. I am on my way and will reach in 15 minutes.', timestamp: '12:45 PM', isMe: false }
    ]
  });

  const [workerFilters, setWorkerFilters] = useState<WorkerFilterState>({
    category: 'All',
    distance: 'Any',
    availableNowOnly: false,
    availableTodayOnly: false,
    minRating: 4.0
  });

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>('alt-1');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [adminVerificationQueue, setAdminVerificationQueue] = useState<{ id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }[]>([
    { id: 'v1', name: 'Ramesh Kumar', profession: 'Electrician', date: 'Oct 24, 2023', status: 'Pending' },
    { id: 'v2', name: 'Sunita Das', profession: 'Plumber', date: 'Oct 24, 2023', status: 'Pending' },
    { id: 'v3', name: 'Amit Biswas', profession: 'Carpenter', date: 'Oct 23, 2023', status: 'Pending' }
  ]);

  // Sync to storage
  useEffect(() => {
    localStorage.setItem('jpg_workers', JSON.stringify(workers));
  }, [workers]);

  useEffect(() => {
    localStorage.setItem('jpg_rentals', JSON.stringify(rentals));
  }, [rentals]);

  useEffect(() => {
    localStorage.setItem('jpg_lost_found', JSON.stringify(lostFound));
  }, [lostFound]);

  useEffect(() => {
    localStorage.setItem('jpg_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('jpg_blood_donors', JSON.stringify(bloodDonors));
  }, [bloodDonors]);

  useEffect(() => {
    localStorage.setItem('jpg_blood_requests', JSON.stringify(bloodRequests));
  }, [bloodRequests]);

  useEffect(() => {
    localStorage.setItem('jpg_civic_reports', JSON.stringify(civicReports));
  }, [civicReports]);

  useEffect(() => {
    localStorage.setItem('jpg_local_alerts', JSON.stringify(localAlerts));
  }, [localAlerts]);

  useEffect(() => {
    localStorage.setItem('jpg_service_requests', JSON.stringify(serviceRequests));
  }, [serviceRequests]);

  useEffect(() => {
    localStorage.setItem('jpg_saved', JSON.stringify(savedItemIds));
  }, [savedItemIds]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    if (type === 'success') {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 }
        });
      } catch (e) {}
    }
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const addWorker = (newWorker: Worker) => {
    setWorkers((prev) => [newWorker, ...prev]);
    showToast(`${newWorker.name} has been listed in Workers directory!`);
  };

  const addRental = (newRental: RentalProperty) => {
    setRentals((prev) => [newRental, ...prev]);
    showToast('Rental property listed successfully!');
  };

  const toggleSaveItem = (id: string) => {
    setSavedItemIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        showToast('Removed from saved items', 'info');
        return prev.filter((item) => item !== id);
      } else {
        showToast('Added to saved items', 'success');
        return [...prev, id];
      }
    });
  };

  const isItemSaved = (id: string) => savedItemIds.includes(id);

  const submitCivicReport = (reportData: Omit<CivicReport, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'timeline'>): CivicReport => {
    const randomId = 'JPG-' + Math.floor(10000 + Math.random() * 90000);
    const newReport: CivicReport = {
      ...reportData,
      id: randomId,
      reportedAt: 'Just now',
      status: 'Submitted',
      upvotes: 1,
      hasUpvoted: true,
      timeline: [
        { title: 'Submitted by Citizen', time: 'Just now', done: true },
        { title: 'Municipal Authority Review', time: 'Pending', done: false },
        { title: 'Action Dispatched', time: 'Pending', done: false },
        { title: 'Resolved', time: 'Pending', done: false }
      ]
    };
    setCivicReports((prev) => [newReport, ...prev]);
    showToast(`Civic report ${randomId} submitted successfully!`);
    return newReport;
  };

  const upvoteCivicReport = (id: string) => {
    setCivicReports((prev) =>
      prev.map((rep) => {
        if (rep.id === id) {
          const hasUpvoted = !rep.hasUpvoted;
          return {
            ...rep,
            upvotes: hasUpvoted ? rep.upvotes + 1 : rep.upvotes - 1,
            hasUpvoted
          };
        }
        return rep;
      })
    );
  };

  const confirmLocalAlert = (alertId: string) => {
    setLocalAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === alertId) {
          const userConfirmed = !alt.userConfirmed;
          const confirmedCount = userConfirmed ? alt.confirmedCount + 1 : alt.confirmedCount - 1;
          showToast(userConfirmed ? 'Thank you for confirming this alert!' : 'Confirmation removed', 'info');
          return { ...alt, userConfirmed, confirmedCount };
        }
        return alt;
      })
    );
  };

  const addLocalAlert = (alertData: Omit<LocalAlert, 'id' | 'timeAgo' | 'confirmedCount'>) => {
    const newAlert: LocalAlert = {
      ...alertData,
      id: 'alt-' + Date.now(),
      timeAgo: 'Just now',
      confirmedCount: 1,
      userConfirmed: true
    };
    setLocalAlerts((prev) => [newAlert, ...prev]);
    showToast('Community alert published successfully!');
  };

  const submitServiceRequest = (reqData: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>): ServiceRequest => {
    const newReq: ServiceRequest = {
      ...reqData,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Submitted',
      createdAt: 'Just now'
    };
    setServiceRequests((prev) => [newReq, ...prev]);
    showToast(`Request sent to ${reqData.workerName || 'service provider'}!`);
    return newReq;
  };

  const updateServiceRequestStatus = (id: string, status: ServiceRequest['status']) => {
    setServiceRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
    showToast(`Request status updated: ${status}`);
  };

  const registerBloodDonor = (donorData: Omit<BloodDonor, 'id' | 'verified' | 'donationsCount'>) => {
    const newDonor: BloodDonor = {
      ...donorData,
      id: 'bd-' + Date.now(),
      verified: true,
      donationsCount: 0
    };
    setBloodDonors((prev) => [newDonor, ...prev]);
    showToast('You are registered as a life-saving blood donor!', 'success');
  };

  const submitBloodRequest = (reqData: Omit<BloodRequest, 'id' | 'status' | 'postedAt'>): BloodRequest => {
    const newReq: BloodRequest = {
      ...reqData,
      id: 'br-' + Date.now(),
      status: 'Urgent',
      postedAt: 'Just now'
    };
    setBloodRequests((prev) => [newReq, ...prev]);
    showToast('Emergency blood request broadcasted to nearby donors!');
    return newReq;
  };

  const applyForJob = (jobId: string, applicantName: string) => {
    showToast(`Application submitted successfully to employer!`);
  };

  const postJob = (jobData: Omit<Job, 'id' | 'postedTime'>) => {
    const newJob: Job = {
      ...jobData,
      id: 'j-' + Date.now(),
      postedTime: 'Just now'
    };
    setJobs((prev) => [newJob, ...prev]);
    showToast('Job listing posted to Jalpaiguri community!');
  };

  const reportLostFound = (itemData: Omit<LostFoundItem, 'id' | 'status'>) => {
    const newItem: LostFoundItem = {
      ...itemData,
      id: 'lf-' + Date.now(),
      status: 'Open'
    };
    setLostFound((prev) => [newItem, ...prev]);
    showToast(`${itemData.type} item posted to community board!`);
  };

  const sendChatMessage = (recipientId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderId: 'me',
      senderName: 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatMessages((prev) => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), newMsg]
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const approveWorkerVerification = (id: string) => {
    setAdminVerificationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    showToast('Provider application approved and verified!');
  };

  return (
    <AppContext.Provider
      value={{
        workers,
        civicReports,
        localAlerts,
        bloodDonors,
        bloodRequests,
        doctors,
        hospitals,
        jobs,
        rentals,
        lostFound,
        notifications,
        serviceRequests,
        savedItemIds,
        chatMessages,
        workerFilters,
        setWorkerFilters,
        selectedAlertId,
        setSelectedAlertId,
        addWorker,
        addRental,
        toggleSaveItem,
        isItemSaved,
        submitCivicReport,
        upvoteCivicReport,
        confirmLocalAlert,
        addLocalAlert,
        submitServiceRequest,
        updateServiceRequestStatus,
        registerBloodDonor,
        submitBloodRequest,
        applyForJob,
        postJob,
        reportLostFound,
        sendChatMessage,
        markNotificationRead,
        showToast,
        toast,
        language,
        setLanguage,
        adminVerificationQueue,
        approveWorkerVerification
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
