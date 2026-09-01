import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
import { OFFICIAL_DOCTORS, OFFICIAL_HOSPITALS } from '../data/directoryData';
import { supabase, isSupabaseConfigured, apiFetch } from '../lib/supabase';
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
  addWorker: (worker: Worker) => Promise<void>;
  addRental: (rental: RentalProperty) => Promise<void>;
  toggleSaveItem: (id: string) => void;
  isItemSaved: (id: string) => boolean;
  submitCivicReport: (report: Omit<CivicReport, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'timeline'>) => Promise<CivicReport>;
  upvoteCivicReport: (id: string) => Promise<void>;
  confirmLocalAlert: (alertId: string) => Promise<void>;
  addLocalAlert: (alert: Omit<LocalAlert, 'id' | 'timeAgo' | 'confirmedCount'>) => Promise<void>;
  submitServiceRequest: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => Promise<ServiceRequest>;
  updateServiceRequestStatus: (id: string, status: ServiceRequest['status']) => Promise<void>;
  registerBloodDonor: (donor: Omit<BloodDonor, 'id' | 'verified' | 'donationsCount'>) => Promise<void>;
  submitBloodRequest: (req: Omit<BloodRequest, 'id' | 'status' | 'postedAt'>) => Promise<BloodRequest>;
  applyForJob: (jobId: string, applicantName: string) => void;
  postJob: (job: Omit<Job, 'id' | 'postedTime'>) => Promise<void>;
  reportLostFound: (item: Omit<LostFoundItem, 'id' | 'status'>) => Promise<void>;
  sendChatMessage: (recipientId: string, text: string, senderName?: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  language: string;
  setLanguage: (lang: string) => void;
  // Admin functions
  adminVerificationQueue: { id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }[];
  approveWorkerVerification: (id: string) => Promise<void>;
  isRealtimeConnected: boolean;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to sanitize stale mock names from cached local storage
function sanitizeCachedList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter((item: any) => {
      const name = (item.name || item.patientName || item.title || '').toLowerCase();
      const mockNames = ['ramesh sarkar', 'amit das', 'subir roy', 'pradip paul', 'tapas debnath', 'animesh saha', 'biplab barman'];
      return !mockNames.some((m) => name.includes(m));
    });
  } catch {
    return [];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workers, setWorkers] = useState<Worker[]>(() => sanitizeCachedList<Worker>('jpg_workers'));
  const [civicReports, setCivicReports] = useState<CivicReport[]>(() => sanitizeCachedList<CivicReport>('jpg_civic_reports'));
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>(() => sanitizeCachedList<LocalAlert>('jpg_local_alerts'));
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>(() => sanitizeCachedList<BloodDonor>('jpg_blood_donors'));
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>(() => sanitizeCachedList<BloodRequest>('jpg_blood_requests'));
  const [doctors] = useState<Doctor[]>(OFFICIAL_DOCTORS);
  const [hospitals] = useState<Hospital[]>(OFFICIAL_HOSPITALS);
  const [jobs, setJobs] = useState<Job[]>(() => sanitizeCachedList<Job>('jpg_jobs'));
  const [rentals, setRentals] = useState<RentalProperty[]>(() => sanitizeCachedList<RentalProperty>('jpg_rentals'));
  const [lostFound, setLostFound] = useState<LostFoundItem[]>(() => sanitizeCachedList<LostFoundItem>('jpg_lost_found'));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => sanitizeCachedList<AppNotification>('jpg_notifications'));

  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('jpg_language') || 'en';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('jpg_language', lang);
  };

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(() => sanitizeCachedList<ServiceRequest>('jpg_service_requests'));
  const [savedItemIds, setSavedItemIds] = useState<string[]>(() => {
    const s = localStorage.getItem('jpg_saved');
    return s ? JSON.parse(s) : [];
  });

  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const s = localStorage.getItem('jpg_chats');
    return s ? JSON.parse(s) : {};
  });

  const [workerFilters, setWorkerFilters] = useState<WorkerFilterState>({
    category: 'All',
    distance: 'Any',
    availableNowOnly: false,
    availableTodayOnly: false,
    minRating: 4.0
  });

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  const [adminVerificationQueue, setAdminVerificationQueue] = useState<{ id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }[]>(() => {
    return sanitizeCachedList<{ id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }>('jpg_admin_verifications');
  });

  // Sync state to local storage
  useEffect(() => { localStorage.setItem('jpg_workers', JSON.stringify(workers)); }, [workers]);
  useEffect(() => { localStorage.setItem('jpg_rentals', JSON.stringify(rentals)); }, [rentals]);
  useEffect(() => { localStorage.setItem('jpg_lost_found', JSON.stringify(lostFound)); }, [lostFound]);
  useEffect(() => { localStorage.setItem('jpg_jobs', JSON.stringify(jobs)); }, [jobs]);
  useEffect(() => { localStorage.setItem('jpg_blood_donors', JSON.stringify(bloodDonors)); }, [bloodDonors]);
  useEffect(() => { localStorage.setItem('jpg_blood_requests', JSON.stringify(bloodRequests)); }, [bloodRequests]);
  useEffect(() => { localStorage.setItem('jpg_civic_reports', JSON.stringify(civicReports)); }, [civicReports]);
  useEffect(() => { localStorage.setItem('jpg_local_alerts', JSON.stringify(localAlerts)); }, [localAlerts]);
  useEffect(() => { localStorage.setItem('jpg_service_requests', JSON.stringify(serviceRequests)); }, [serviceRequests]);
  useEffect(() => { localStorage.setItem('jpg_saved', JSON.stringify(savedItemIds)); }, [savedItemIds]);
  useEffect(() => { localStorage.setItem('jpg_chats', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('jpg_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('jpg_admin_verifications', JSON.stringify(adminVerificationQueue)); }, [adminVerificationQueue]);

  const refreshData = async () => {
    try {
      const [w, r, a, bd, br, j, rent, lf, srv, verif] = await Promise.allSettled([
        apiFetch<Worker[]>('/api/workers'),
        apiFetch<CivicReport[]>('/api/reports'),
        apiFetch<LocalAlert[]>('/api/alerts'),
        apiFetch<BloodDonor[]>('/api/blood/donors'),
        apiFetch<BloodRequest[]>('/api/blood/requests'),
        apiFetch<Job[]>('/api/jobs'),
        apiFetch<RentalProperty[]>('/api/rentals'),
        apiFetch<LostFoundItem[]>('/api/lostfound'),
        apiFetch<ServiceRequest[]>('/api/service-requests'),
        apiFetch<any[]>('/api/admin/verifications')
      ]);

      if (w.status === 'fulfilled' && Array.isArray(w.value)) setWorkers(w.value);
      if (r.status === 'fulfilled' && Array.isArray(r.value)) setCivicReports(r.value);
      if (a.status === 'fulfilled' && Array.isArray(a.value)) {
        setLocalAlerts(a.value);
        if (a.value[0]?.id) setSelectedAlertId(a.value[0].id);
      }
      if (bd.status === 'fulfilled' && Array.isArray(bd.value)) setBloodDonors(bd.value);
      if (br.status === 'fulfilled' && Array.isArray(br.value)) setBloodRequests(br.value);
      if (j.status === 'fulfilled' && Array.isArray(j.value)) setJobs(j.value);
      if (rent.status === 'fulfilled' && Array.isArray(rent.value)) setRentals(rent.value);
      if (lf.status === 'fulfilled' && Array.isArray(lf.value)) setLostFound(lf.value);
      if (srv.status === 'fulfilled' && Array.isArray(srv.value)) setServiceRequests(srv.value);
      if (verif.status === 'fulfilled' && Array.isArray(verif.value)) setAdminVerificationQueue(verif.value);
    } catch (err) {
      console.warn('Refresh data error:', err);
    }
  };

  // Initial Fetch & Real-Time Sync via Server-Sent Events (SSE) and Supabase
  useEffect(() => {
    refreshData();

    // Setup Realtime SSE Listener
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const setupSSE = () => {
      try {
        eventSource = new EventSource('/api/realtime/stream');

        eventSource.addEventListener('connected', () => {
          setIsRealtimeConnected(true);
        });

        eventSource.addEventListener('WORKER_ADDED', (e) => {
          const newWorker = JSON.parse(e.data);
          setWorkers((prev) => (prev.some((x) => x.id === newWorker.id) ? prev : [newWorker, ...prev]));
        });

        eventSource.addEventListener('CIVIC_REPORT_CREATED', (e) => {
          const report = JSON.parse(e.data);
          setCivicReports((prev) => (prev.some((x) => x.id === report.id) ? prev : [report, ...prev]));
        });

        eventSource.addEventListener('CIVIC_REPORT_UPVOTED', (e) => {
          const { id, upvotes } = JSON.parse(e.data);
          setCivicReports((prev) => prev.map((r) => (r.id === id ? { ...r, upvotes } : r)));
        });

        eventSource.addEventListener('ALERT_POSTED', (e) => {
          const alert = JSON.parse(e.data);
          setLocalAlerts((prev) => (prev.some((x) => x.id === alert.id) ? prev : [alert, ...prev]));
        });

        eventSource.addEventListener('ALERT_CONFIRMED', (e) => {
          const { id, confirmedCount } = JSON.parse(e.data);
          setLocalAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, confirmedCount } : a)));
        });

        eventSource.addEventListener('BLOOD_DONOR_REGISTERED', (e) => {
          const donor = JSON.parse(e.data);
          setBloodDonors((prev) => (prev.some((x) => x.id === donor.id) ? prev : [donor, ...prev]));
        });

        eventSource.addEventListener('BLOOD_REQUEST_SUBMITTED', (e) => {
          const bloodReq = JSON.parse(e.data);
          setBloodRequests((prev) => (prev.some((x) => x.id === bloodReq.id) ? prev : [bloodReq, ...prev]));
        });

        eventSource.addEventListener('JOB_POSTED', (e) => {
          const job = JSON.parse(e.data);
          setJobs((prev) => (prev.some((x) => x.id === job.id) ? prev : [job, ...prev]));
        });

        eventSource.addEventListener('RENTAL_ADDED', (e) => {
          const rental = JSON.parse(e.data);
          setRentals((prev) => (prev.some((x) => x.id === rental.id) ? prev : [rental, ...prev]));
        });

        eventSource.addEventListener('LOSTFOUND_REPORTED', (e) => {
          const item = JSON.parse(e.data);
          setLostFound((prev) => (prev.some((x) => x.id === item.id) ? prev : [item, ...prev]));
        });

        eventSource.addEventListener('SERVICE_REQUEST_CREATED', (e) => {
          const srv = JSON.parse(e.data);
          setServiceRequests((prev) => (prev.some((x) => x.id === srv.id) ? prev : [srv, ...prev]));
        });

        eventSource.addEventListener('SERVICE_REQUEST_UPDATED', (e) => {
          const { id, status } = JSON.parse(e.data);
          setServiceRequests((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
        });

        eventSource.addEventListener('CHAT_MESSAGE_SENT', (e) => {
          const { recipientId, message } = JSON.parse(e.data);
          setChatMessages((prev) => {
            const list = prev[recipientId] || [];
            if (list.some((m) => m.id === message.id)) return prev;
            return { ...prev, [recipientId]: [...list, message] };
          });
        });

        eventSource.addEventListener('ADMIN_VERIFICATION_APPROVED', (e) => {
          const { id, status } = JSON.parse(e.data);
          setAdminVerificationQueue((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
        });

        eventSource.onerror = () => {
          setIsRealtimeConnected(false);
          eventSource?.close();
          reconnectTimeout = setTimeout(setupSSE, 5000);
        };
      } catch (err) {
        setIsRealtimeConnected(false);
      }
    };

    setupSSE();

    // Supabase Postgres Realtime Subscriptions (if Supabase configured)
    let supabaseChannel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        supabaseChannel = supabase
          .channel('public-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'civic_reports' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setCivicReports((prev) => [payload.new as CivicReport, ...prev.filter((r) => r.id !== payload.new.id)]);
            } else if (payload.eventType === 'UPDATE') {
              setCivicReports((prev) => prev.map((r) => (r.id === payload.new.id ? (payload.new as CivicReport) : r)));
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setWorkers((prev) => [payload.new as Worker, ...prev.filter((w) => w.id !== payload.new.id)]);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'local_alerts' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setLocalAlerts((prev) => [payload.new as LocalAlert, ...prev.filter((a) => a.id !== payload.new.id)]);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_donors' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setBloodDonors((prev) => [payload.new as BloodDonor, ...prev.filter((b) => b.id !== payload.new.id)]);
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'blood_requests' }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setBloodRequests((prev) => [payload.new as BloodRequest, ...prev.filter((br) => br.id !== payload.new.id)]);
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('Supabase realtime subscription error:', err);
      }
    }

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (supabaseChannel && supabase) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, []);

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

  const addWorker = async (newWorker: Worker) => {
    setWorkers((prev) => [newWorker, ...prev.filter((w) => w.id !== newWorker.id)]);
    showToast(`${newWorker.name} has been listed in Workers directory!`);
    try {
      await apiFetch('/api/workers', {
        method: 'POST',
        body: JSON.stringify(newWorker)
      });
    } catch (e) {
      console.warn('Sync worker error', e);
    }
  };

  const addRental = async (newRental: RentalProperty) => {
    setRentals((prev) => [newRental, ...prev.filter((r) => r.id !== newRental.id)]);
    showToast('Rental property listed successfully!');
    try {
      await apiFetch('/api/rentals', {
        method: 'POST',
        body: JSON.stringify(newRental)
      });
    } catch (e) {
      console.warn('Sync rental error', e);
    }
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

  const submitCivicReport = async (reportData: Omit<CivicReport, 'id' | 'reportedAt' | 'status' | 'upvotes' | 'timeline'>): Promise<CivicReport> => {
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
    setCivicReports((prev) => [newReport, ...prev.filter((r) => r.id !== newReport.id)]);
    showToast(`Civic report ${randomId} submitted successfully!`);
    try {
      await apiFetch('/api/reports', {
        method: 'POST',
        body: JSON.stringify(newReport)
      });
    } catch (e) {
      console.warn('Sync report error', e);
    }
    return newReport;
  };

  const upvoteCivicReport = async (id: string) => {
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
    try {
      await apiFetch(`/api/reports/${id}/upvote`, { method: 'POST' });
    } catch (e) {
      console.warn('Sync upvote error', e);
    }
  };

  const confirmLocalAlert = async (alertId: string) => {
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
    try {
      await apiFetch(`/api/alerts/${alertId}/confirm`, { method: 'POST' });
    } catch (e) {
      console.warn('Sync alert confirm error', e);
    }
  };

  const addLocalAlert = async (alertData: Omit<LocalAlert, 'id' | 'timeAgo' | 'confirmedCount'>) => {
    const newAlert: LocalAlert = {
      ...alertData,
      id: 'alt-' + Date.now(),
      timeAgo: 'Just now',
      confirmedCount: 1,
      userConfirmed: true
    };
    setLocalAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);
    showToast('Community alert published successfully!');
    try {
      await apiFetch('/api/alerts', {
        method: 'POST',
        body: JSON.stringify(newAlert)
      });
    } catch (e) {
      console.warn('Sync alert error', e);
    }
  };

  const submitServiceRequest = async (reqData: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>): Promise<ServiceRequest> => {
    const newReq: ServiceRequest = {
      ...reqData,
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Submitted',
      createdAt: 'Just now'
    };
    setServiceRequests((prev) => [newReq, ...prev.filter((s) => s.id !== newReq.id)]);
    showToast(`Request sent to ${reqData.workerName || 'service provider'}!`);
    try {
      await apiFetch('/api/service-requests', {
        method: 'POST',
        body: JSON.stringify(newReq)
      });
    } catch (e) {
      console.warn('Sync service request error', e);
    }
    return newReq;
  };

  const updateServiceRequestStatus = async (id: string, status: ServiceRequest['status']) => {
    setServiceRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
    showToast(`Request status updated: ${status}`);
    try {
      await apiFetch(`/api/service-requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn('Sync status error', e);
    }
  };

  const registerBloodDonor = async (donorData: Omit<BloodDonor, 'id' | 'verified' | 'donationsCount'>) => {
    const newDonor: BloodDonor = {
      ...donorData,
      id: 'bd-' + Date.now(),
      verified: true,
      donationsCount: 0
    };
    setBloodDonors((prev) => [newDonor, ...prev.filter((b) => b.id !== newDonor.id)]);
    showToast('You are registered as a life-saving blood donor!', 'success');
    try {
      await apiFetch('/api/blood/donors', {
        method: 'POST',
        body: JSON.stringify(newDonor)
      });
    } catch (e) {
      console.warn('Sync donor error', e);
    }
  };

  const submitBloodRequest = async (reqData: Omit<BloodRequest, 'id' | 'status' | 'postedAt'>): Promise<BloodRequest> => {
    const newReq: BloodRequest = {
      ...reqData,
      id: 'br-' + Date.now(),
      status: 'Urgent',
      postedAt: 'Just now'
    };
    setBloodRequests((prev) => [newReq, ...prev.filter((b) => b.id !== newReq.id)]);
    showToast('Emergency blood request broadcasted to nearby donors!');
    try {
      await apiFetch('/api/blood/requests', {
        method: 'POST',
        body: JSON.stringify(newReq)
      });
    } catch (e) {
      console.warn('Sync blood request error', e);
    }
    return newReq;
  };

  const applyForJob = (jobId: string, applicantName: string) => {
    showToast(`Application submitted successfully to employer!`);
  };

  const postJob = async (jobData: Omit<Job, 'id' | 'postedTime'>) => {
    const newJob: Job = {
      ...jobData,
      id: 'j-' + Date.now(),
      postedTime: 'Just now'
    };
    setJobs((prev) => [newJob, ...prev.filter((j) => j.id !== newJob.id)]);
    showToast('Job listing posted to Jalpaiguri community!');
    try {
      await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify(newJob)
      });
    } catch (e) {
      console.warn('Sync job error', e);
    }
  };

  const reportLostFound = async (itemData: Omit<LostFoundItem, 'id' | 'status'>) => {
    const newItem: LostFoundItem = {
      ...itemData,
      id: 'lf-' + Date.now(),
      status: 'Open'
    };
    setLostFound((prev) => [newItem, ...prev.filter((l) => l.id !== newItem.id)]);
    showToast(`${itemData.type} item posted to community board!`);
    try {
      await apiFetch('/api/lostfound', {
        method: 'POST',
        body: JSON.stringify(newItem)
      });
    } catch (e) {
      console.warn('Sync lost found error', e);
    }
  };

  const sendChatMessage = async (recipientId: string, text: string, senderName: string = 'You') => {
    const newMsg: ChatMessage = {
      id: 'm-' + Date.now(),
      senderId: 'me',
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    setChatMessages((prev) => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), newMsg]
    }));
    try {
      await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ recipientId, text, senderName, isMe: true })
      });
    } catch (e) {
      console.warn('Sync chat error', e);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const approveWorkerVerification = async (id: string) => {
    setAdminVerificationQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'Approved' } : item))
    );
    showToast('Provider application approved and verified!');
    try {
      await apiFetch('/api/admin/verifications/approve', {
        method: 'POST',
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.warn('Sync approve error', e);
    }
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
        approveWorkerVerification,
        isRealtimeConnected,
        refreshData
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
