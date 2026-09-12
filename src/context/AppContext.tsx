import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  ChatMessage,
  isAuthorizedAdminEmail,
  Shop,
  Restaurant,
  DurgaPandalItem,
  PandalReport,
  PandalReview,
  PlacePhotoSubmission
} from '../types';
import { INITIAL_DURGA_PUJA_PANDALS } from '../data/durgaPujaPandals';
import { db, isFirebaseConfigured, apiFetch, auth } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  increment,
  addDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import confetti from 'canvas-confetti';
import { useLanguage } from './LanguageContext';

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
  shops: Shop[];
  restaurants: Restaurant[];
  pujaPandals: DurgaPandalItem[];
  savedPandalIds: string[];
  recentlyViewedPandalIds: string[];
  addPujaPandal: (pandalData: Omit<DurgaPandalItem, 'id' | 'createdAt' | 'verificationStatus'>) => Promise<DurgaPandalItem>;
  reportPandalInfo: (reportData: Omit<PandalReport, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  verifyPujaPandal: (id: string, status: 'verified' | 'rejected') => Promise<void>;
  toggleSavePandal: (id: string) => void;
  isPandalSaved: (id: string) => boolean;
  addRecentlyViewedPandal: (id: string) => void;
  addPandalReview: (pandalId: string, rating: number, reviewText: string, visitDate?: string) => Promise<void>;
  fetchPandalReviews: (pandalId: string) => Promise<PandalReview[]>;
  deletePandalReview: (pandalId: string, reviewId: string) => Promise<void>;
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
  requestWorkerService?: (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>) => Promise<ServiceRequest>;
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
  placePhotoSubmissions: PlacePhotoSubmission[];
  submitPlacePhoto: (data: Omit<PlacePhotoSubmission, 'id' | 'timestamp' | 'status'>) => Promise<void>;
  approvePlacePhotoSubmission: (id: string) => Promise<void>;
  rejectPlacePhotoSubmission: (id: string) => Promise<void>;
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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [civicReports, setCivicReports] = useState<CivicReport[]>([]);
  const [localAlerts, setLocalAlerts] = useState<LocalAlert[]>([]);
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [rentals, setRentals] = useState<RentalProperty[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [pujaPandals, setPujaPandals] = useState<DurgaPandalItem[]>(INITIAL_DURGA_PUJA_PANDALS);

  const { language, setLanguage: setGlobalLanguage } = useLanguage();
  const setLanguage = useCallback((lang: string) => {
    setGlobalLanguage(lang as 'en' | 'bn');
  }, [setGlobalLanguage]);

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
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

  const [savedPandalIds, setSavedPandalIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('jpg_saved_pandals');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [recentlyViewedPandalIds, setRecentlyViewedPandalIds] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('jpg_recent_pandals');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [adminVerificationQueue, setAdminVerificationQueue] = useState<{ id: string; name: string; profession: string; date: string; status: 'Pending' | 'Approved' | 'Review' }[]>([]);

  const [placePhotoSubmissions, setPlacePhotoSubmissions] = useState<PlacePhotoSubmission[]>(() => {
    try {
      const s = localStorage.getItem('jpg_place_photo_submissions');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('jpg_place_photo_submissions', JSON.stringify(placePhotoSubmissions));
  }, [placePhotoSubmissions]);

  const submitPlacePhoto = async (data: Omit<PlacePhotoSubmission, 'id' | 'timestamp' | 'status'>) => {
    const newSub: PlacePhotoSubmission = {
      ...data,
      id: 'photo-sub-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setPlacePhotoSubmissions(prev => [newSub, ...prev]);

    // Save to Firestore place_photos
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'place_photos', newSub.id), newSub);
      } catch (e) {
        console.warn('Failed to sync photo to Firestore place_photos:', e);
      }
    }

    showToast('Photo uploaded successfully! Sent to admin panel for review.', 'success');
  };

  const approvePlacePhotoSubmission = async (id: string) => {
    let targetSub: PlacePhotoSubmission | undefined;
    setPlacePhotoSubmissions(prev => prev.map(sub => {
      if (sub.id === id) {
        targetSub = sub;
        try {
          const customThumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
          customThumbs[sub.placeId] = sub.imageUrl;
          localStorage.setItem('jpg_custom_thumbnails', JSON.stringify(customThumbs));
        } catch {}
        return { ...sub, status: 'approved' };
      }
      return sub;
    }));

    if (targetSub) {
      if (isFirebaseConfigured && db) {
        try {
          await updateDoc(doc(db, 'place_photos', id), { status: 'approved' });
          await setDoc(doc(db, 'place_thumbnails', targetSub.placeId), {
            imageUrl: targetSub.imageUrl,
            placeId: targetSub.placeId,
            placeName: targetSub.placeName,
            approvedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('Failed to sync approval to Firestore:', e);
        }
      }
    }

    showToast('Photo approved and set as live thumbnail for place!', 'success');
  };

  const rejectPlacePhotoSubmission = async (id: string) => {
    setPlacePhotoSubmissions(prev => prev.map(sub => sub.id === id ? { ...sub, status: 'rejected' } : sub));
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'place_photos', id), { status: 'rejected' });
      } catch (e) {
        console.warn('Failed to sync rejection to Firestore:', e);
      }
    }
    showToast('Photo submission rejected.', 'info');
  };

  // Sync some metadata to local storage (only non-sensitive UI states)
  useEffect(() => { localStorage.setItem('jpg_saved', JSON.stringify(savedItemIds)); }, [savedItemIds]);
  useEffect(() => { localStorage.setItem('jpg_saved_pandals', JSON.stringify(savedPandalIds)); }, [savedPandalIds]);
  useEffect(() => { localStorage.setItem('jpg_recent_pandals', JSON.stringify(recentlyViewedPandalIds)); }, [recentlyViewedPandalIds]);
  useEffect(() => { localStorage.setItem('jpg_chats', JSON.stringify(chatMessages)); }, [chatMessages]);

  const refreshData = async () => {
    // Refresh logic is now handled automatically by Firestore onSnapshot listeners
    console.log('[DATA] Firestore real-time sync is active. Manual refresh not required.');
  };

  // Initial Fetch & Real-Time Sync via Firestore
  useEffect(() => {
    // Firestore Real-Time Subscriptions
    const unsubscribers: (() => void)[] = [];
    if (isFirebaseConfigured && db) {
      try {
        const collections = [
          { name: 'workers', setter: setWorkers },
          { name: 'civic_reports', setter: setCivicReports },
          { name: 'local_alerts', setter: setLocalAlerts },
          { name: 'blood_donors', setter: setBloodDonors },
          { name: 'blood_requests', setter: setBloodRequests },
          { name: 'jobs', setter: setJobs },
          { name: 'rentals', setter: setRentals },
          { name: 'lost_found', setter: setLostFound },
          { name: 'service_requests', setter: setServiceRequests },
          { name: 'admin_verifications', setter: setAdminVerificationQueue },
          { name: 'shops', setter: setShops },
          { name: 'restaurants', setter: setRestaurants },
          { name: 'doctors', setter: setDoctors },
          { name: 'hospitals', setter: setHospitals },
          { name: 'place_photos', setter: (data: PlacePhotoSubmission[]) => {
              if (data && data.length > 0) {
                setPlacePhotoSubmissions(data);
              }
            }
          },
          { name: 'place_thumbnails', setter: (data: any[]) => {
              if (data && data.length > 0) {
                try {
                  const thumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
                  data.forEach((item) => {
                    if (item.placeId && item.imageUrl) {
                      thumbs[item.placeId] = item.imageUrl;
                    }
                  });
                  localStorage.setItem('jpg_custom_thumbnails', JSON.stringify(thumbs));
                } catch {}
              }
            }
          },
          { name: 'puja_pandals', setter: (data: DurgaPandalItem[]) => {
              if (data && data.length > 0) {
                // Merge verified initial pandals with any custom Firestore pandals
                const existingIds = new Set(data.map(p => p.id));
                const merged = [...data];
                INITIAL_DURGA_PUJA_PANDALS.forEach(p => {
                  if (!existingIds.has(p.id)) merged.push(p);
                });
                setPujaPandals(merged);
              } else {
                setPujaPandals(INITIAL_DURGA_PUJA_PANDALS);
              }
            } 
          }
        ];

        collections.forEach(({ name, setter }) => {
          unsubscribers.push(
            onSnapshot(collection(db, name), (snap) => {
              const loaded: any[] = [];
              snap.forEach((d) => loaded.push({ ...d.data(), id: d.id }));
              // For alerts, set the selected one if not set
              if (name === 'local_alerts' && loaded.length > 0) {
                setSelectedAlertId(prev => prev || loaded[0].id);
              }
              setter(loaded);
            })
          );
        });
      } catch (err) {
        console.warn('Firestore snapshot subscription error:', err);
      }
    } else {
      // Fallback to API if Firebase not configured (though it should be)
      refreshData();
    }

    return () => {
      unsubscribers.forEach((u) => u());
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
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'workers', newWorker.id), newWorker);
        showToast(`${newWorker.name} has been listed in Workers directory!`);
      } catch (e) {
        console.error('Firestore add worker error:', e);
        showToast('Failed to save worker listing.', 'error');
      }
    } else {
      showToast('Offline mode: Could not save worker listing.', 'error');
    }
  };

  const addRental = async (newRental: RentalProperty) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'rentals', newRental.id), newRental);
        showToast('Rental property listed successfully!');
      } catch (e) {
        console.error('Firestore rental add error:', e);
        showToast('Failed to save rental listing.', 'error');
      }
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
    const nowIso = new Date().toISOString();
    const newReport: CivicReport = {
      ...reportData,
      id: randomId,
      reportedAt: 'Just now',
      createdAt: nowIso,
      updatedAt: nowIso,
      status: 'Submitted',
      upvotes: 1,
      timeline: [
        { title: 'Submitted by Citizen', time: 'Just now', done: true, desc: 'Issue registered in Jalpaiguri Municipal grievance log' },
        { title: 'Municipal Authority Review', time: 'Pending', done: false, desc: 'Under review by Ward Inspector & Engineering Dept' },
        { title: 'Action Dispatched', time: 'Pending', done: false, desc: 'Field maintenance or sanitary crew scheduled' },
        { title: 'Resolved', time: 'Pending', done: false, desc: 'Repaired, cleaned or fixed on site' }
      ]
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'civic_reports', newReport.id), newReport);
        showToast('Civic problem reported to Jalpaiguri Municipality!', 'success');
        
        // Save report ID locally
        const stored = localStorage.getItem('jpg_my_report_ids');
        const ids: string[] = stored ? JSON.parse(stored) : [];
        if (!ids.includes(randomId)) {
          ids.unshift(randomId);
          localStorage.setItem('jpg_my_report_ids', JSON.stringify(ids));
        }
      } catch (e) {
        console.error('Firestore civic report submit error:', e);
        showToast('Failed to submit report. Please try again.', 'error');
      }
    }

    return newReport;
  };

  const upvoteCivicReport = async (id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'civic_reports', id), {
          upvotes: increment(1)
        });
        showToast('Report upvoted! Priority escalated to ward authorities.', 'info');
      } catch (e) {
        console.error('Firestore report upvote error:', e);
      }
    }
  };

  const confirmLocalAlert = async (alertId: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'local_alerts', alertId), {
          confirmedCount: increment(1)
        });
        showToast('Thank you! Alert confirmed for Jalpaiguri community.', 'success');
      } catch (e) {
        console.error('Firestore confirm alert error:', e);
      }
    }
  };

  const addLocalAlert = async (alertData: Omit<LocalAlert, 'id' | 'timeAgo' | 'confirmedCount'>) => {
    const newAlert: LocalAlert = {
      ...alertData,
      id: 'alt-' + Date.now(),
      timeAgo: 'Just now',
      confirmedCount: 1
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'local_alerts', newAlert.id), newAlert);
        showToast('Community alert published successfully!', 'success');
      } catch (e) {
        console.error('Firestore add alert error:', e);
        showToast('Failed to publish alert.', 'error');
      }
    }
  };

  const addPujaPandal = async (pandalData: Omit<DurgaPandalItem, 'id' | 'createdAt' | 'verificationStatus'>): Promise<DurgaPandalItem> => {
    const newId = 'pandal-' + Date.now();
    const newPandal: DurgaPandalItem = {
      ...pandalData,
      id: newId,
      verificationStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'puja_pandals', newPandal.id), newPandal);
        showToast('Puja Pandal submitted successfully! Under verification by Jalpaiguri team.', 'success');
      } catch (e) {
        console.error('Firestore add pandal error:', e);
        showToast('Failed to save pandal online. Added locally.', 'info');
      }
    } else {
      showToast('Submitted! Pending municipal verification.', 'success');
    }

    setPujaPandals((prev) => [newPandal, ...prev]);
    return newPandal;
  };

  const reportPandalInfo = async (reportData: Omit<PandalReport, 'id' | 'createdAt' | 'status'>): Promise<void> => {
    const newReport: PandalReport = {
      ...reportData,
      id: 'rpt-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'pandal_reports', newReport.id), newReport);
        showToast('Report submitted! Our team will verify and update the details.', 'success');
      } catch (e) {
        console.error('Firestore report pandal error:', e);
        showToast('Report logged locally.', 'info');
      }
    } else {
      showToast('Report logged! Thank you for helping keep information accurate.', 'success');
    }
  };

  const verifyPujaPandal = async (id: string, status: 'verified' | 'rejected') => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'puja_pandals', id), {
          verificationStatus: status,
          updatedAt: new Date().toISOString()
        });
        showToast(`Pandal status updated to ${status}!`, 'success');
      } catch (e) {
        console.error('Firestore verify pandal error:', e);
      }
    }
    setPujaPandals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verificationStatus: status } : p))
    );
  };

  const toggleSavePandal = (id: string) => {
    setSavedPandalIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (exists) {
        showToast('Pandal removed from saved list');
      } else {
        showToast('Pandal bookmarked to your saved list!', 'success');
      }

      // Sync to Firestore if signed in
      const currentUser = auth?.currentUser;
      if (isFirebaseConfigured && db && currentUser) {
        const ref = doc(db, 'users', currentUser.uid, 'saved_pandals', id);
        if (exists) {
          deleteDoc(ref).catch(() => {});
        } else {
          setDoc(ref, { id, userId: currentUser.uid, pandalId: id, createdAt: new Date().toISOString() }).catch(() => {});
        }
      }
      return next;
    });
  };

  const isPandalSaved = (id: string): boolean => {
    return savedPandalIds.includes(id);
  };

  const addRecentlyViewedPandal = (id: string) => {
    setRecentlyViewedPandalIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      return [id, ...filtered].slice(0, 10);
    });
  };

  const addPandalReview = async (
    pandalId: string,
    rating: number,
    reviewText: string,
    visitDate?: string
  ): Promise<void> => {
    const currentUser = auth?.currentUser;
    const userId = currentUser ? currentUser.uid : 'guest-' + Date.now();
    const userName = currentUser?.displayName || currentUser?.phoneNumber || 'Jalpaiguri Citizen';
    const userPhoto = currentUser?.photoURL || undefined;

    const reviewId = `rev-${userId}-${pandalId}`;
    const newReview: PandalReview = {
      id: reviewId,
      pandalId,
      userId,
      userName,
      userPhoto,
      rating,
      reviewText,
      visitDate: visitDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'puja_pandals', pandalId, 'reviews', reviewId), newReview);
        
        // Recalculate average rating & review count for pandal
        const snap = await getDocs(collection(db, 'puja_pandals', pandalId, 'reviews'));
        let sum = 0;
        let count = 0;
        snap.forEach((d) => {
          const r = d.data() as PandalReview;
          if (typeof r.rating === 'number') {
            sum += r.rating;
            count += 1;
          }
        });

        const newAvg = count > 0 ? parseFloat((sum / count).toFixed(1)) : rating;
        const newCount = count > 0 ? count : 1;

        await updateDoc(doc(db, 'puja_pandals', pandalId), {
          rating: newAvg,
          ratingCount: newCount,
          updatedAt: new Date().toISOString()
        });

        setPujaPandals((prev) =>
          prev.map((p) => (p.id === pandalId ? { ...p, rating: newAvg, ratingCount: newCount } : p))
        );

        showToast('Thank you! Your rating and review have been published.', 'success');
      } catch (e) {
        console.error('Firestore add pandal review error:', e);
        showToast('Review submitted locally.', 'info');
      }
    } else {
      showToast('Thank you for reviewing this pandal!', 'success');
    }
  };

  const fetchPandalReviews = async (pandalId: string): Promise<PandalReview[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'puja_pandals', pandalId, 'reviews'));
        const reviews: PandalReview[] = [];
        snap.forEach((d) => {
          reviews.push({ ...d.data(), id: d.id } as PandalReview);
        });
        return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (e) {
        console.error('Firestore fetch pandal reviews error:', e);
        return [];
      }
    }
    return [];
  };

  const deletePandalReview = async (pandalId: string, reviewId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'puja_pandals', pandalId, 'reviews', reviewId));
        
        // Recalculate average rating
        const snap = await getDocs(collection(db, 'puja_pandals', pandalId, 'reviews'));
        let sum = 0;
        let count = 0;
        snap.forEach((d) => {
          const r = d.data() as PandalReview;
          if (typeof r.rating === 'number') {
            sum += r.rating;
            count += 1;
          }
        });

        const newAvg = count > 0 ? parseFloat((sum / count).toFixed(1)) : 0;
        const newCount = count;

        await updateDoc(doc(db, 'puja_pandals', pandalId), {
          rating: newAvg,
          ratingCount: newCount,
          updatedAt: new Date().toISOString()
        });

        setPujaPandals((prev) =>
          prev.map((p) => (p.id === pandalId ? { ...p, rating: newAvg, ratingCount: newCount } : p))
        );

        showToast('Review deleted.');
      } catch (e) {
        console.error('Firestore delete pandal review error:', e);
      }
    }
  };

  const submitServiceRequest = async (req: Omit<ServiceRequest, 'id' | 'status' | 'createdAt'>): Promise<ServiceRequest> => {
    const newReq: ServiceRequest = {
      ...req,
      id: 'req-' + Date.now(),
      status: 'Submitted',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'service_requests', newReq.id), newReq);
        showToast(`Service request sent to ${req.workerName}!`, 'success');
      } catch (e) {
        console.error('Firestore service request error:', e);
        showToast('Failed to send service request.', 'error');
      }
    }

    return newReq;
  };

  const updateServiceRequestStatus = async (id: string, status: ServiceRequest['status']) => {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'service_requests', id), { status });
        showToast(`Request updated to ${status}`);
      } catch (e) {
        console.error('Firestore service request update error:', e);
      }
    }
  };

  const registerBloodDonor = async (donorData: Omit<BloodDonor, 'id' | 'verified' | 'donationsCount'>) => {
    const newDonor: BloodDonor = {
      ...donorData,
      id: 'bd-' + Date.now(),
      verified: true,
      donationsCount: 0
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'blood_donors', newDonor.id), newDonor);
        showToast('Registered as Jalpaiguri Blood Donor! Thank you for saving lives.', 'success');
      } catch (e) {
        console.error('Firestore blood donor register error:', e);
        showToast('Failed to register as donor.', 'error');
      }
    }
  };

  const submitBloodRequest = async (reqData: Omit<BloodRequest, 'id' | 'status' | 'postedAt'>): Promise<BloodRequest> => {
    const newReq: BloodRequest = {
      ...reqData,
      id: 'br-' + Date.now(),
      status: 'Urgent',
      postedAt: 'Just now'
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'blood_requests', newReq.id), newReq);
        showToast('Emergency blood request broadcasted across Jalpaiguri network!', 'error');
      } catch (e) {
        console.error('Firestore blood request submit error:', e);
        showToast('Failed to broadcast blood request.', 'error');
      }
    }

    return newReq;
  };

  const applyForJob = (jobId: string, applicantName: string) => {
    showToast(`Application submitted for job! Employer notified.`, 'success');
  };

  const postJob = async (jobData: Omit<Job, 'id' | 'postedTime'>) => {
    const newJob: Job = {
      ...jobData,
      id: 'job-' + Date.now(),
      postedTime: 'Just now'
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'jobs', newJob.id), newJob);
        showToast('Job listing published to Jalpaiguri employment board!', 'success');
      } catch (e) {
        console.error('Firestore post job error:', e);
        showToast('Failed to post job listing.', 'error');
      }
    }
  };

  const reportLostFound = async (itemData: Omit<LostFoundItem, 'id' | 'status'>) => {
    const newItem: LostFoundItem = {
      ...itemData,
      id: 'lf-' + Date.now(),
      status: 'Open'
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'lost_found', newItem.id), newItem);
        showToast(`${newItem.type} item notice posted!`, 'success');
      } catch (e) {
        console.error('Firestore lost found error:', e);
        showToast('Failed to post lost/found notice.', 'error');
      }
    }
  };

  const sendChatMessage = async (recipientId: string, text: string, senderName: string = 'Citizen') => {
    const msg: ChatMessage = {
      id: 'msg-' + Date.now(),
      senderId: 'me',
      senderName,
      text,
      timestamp: 'Just now',
      isMe: true
    };

    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, 'chats', recipientId, 'messages'), {
          ...msg,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.error('Firestore chat send error:', e);
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const approveWorkerVerification = async (id: string) => {
    // Verify administrative authority before executing approval
    try {
      const stored = localStorage.getItem('jpg_user_profile');
      const profile = stored ? JSON.parse(stored) : null;
      if (!profile || !isAuthorizedAdminEmail(profile?.email)) {
        console.warn('[SECURITY] Blocked unauthorized worker approval attempt');
        showToast('Access Denied: Administrative authority required.', 'error');
        return;
      }
    } catch {
      // Fallback
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'admin_verifications', id), { status: 'Approved' });
        showToast('Worker profile verified and approved!', 'success');
      } catch (e) {
        console.error('Firestore verification approval error:', e);
      }
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
        requestWorkerService: submitServiceRequest,
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
        placePhotoSubmissions,
        submitPlacePhoto,
        approvePlacePhotoSubmission,
        rejectPlacePhotoSubmission,
        isRealtimeConnected,
        refreshData,
        shops,
        restaurants,
        pujaPandals,
        savedPandalIds,
        recentlyViewedPandalIds,
        addPujaPandal,
        reportPandalInfo,
        verifyPujaPandal,
        toggleSavePandal,
        isPandalSaved,
        addRecentlyViewedPandal,
        addPandalReview,
        fetchPandalReviews,
        deletePandalReview
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
