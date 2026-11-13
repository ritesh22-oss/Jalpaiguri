import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  CheckCheck, 
  Sparkles, 
  ShoppingBag, 
  Droplet, 
  AlertTriangle, 
  Briefcase, 
  ChevronRight,
  AlertCircle,
  Search,
  Filter,
  Shield,
  Landmark,
  FileText,
  MessageSquare,
  X,
  Clock,
  MapPin,
  Phone,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  markNotificationRead, 
  deleteUserNotification, 
  deleteAllUserNotifications,
  seedDetailedSampleNotifications 
} from '../../services/notificationService';
import { AppNotification, NotificationCategory } from '../../types';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const { goBack, navigate } = useNav();
  const { isBengali } = useLanguage();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const userId = user?.id || '';

  // Firestore Real-Time Stream
  useEffect(() => {
    if (!userId || !db) {
      setIsLoading(false);
      return;
    }

    try {
      const notifRef = collection(db, 'users', userId, 'notifications');
      const q = query(notifRef, orderBy('createdAt', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: AppNotification[] = [];
        snapshot.docs.forEach((docSnap) => {
          list.push(docSnap.data() as AppNotification);
        });
        setNotifications(list);
        setIsLoading(false);
        setError(null);
      }, (err) => {
        console.error('Error fetching notifications:', err);
        setError('Couldn\'t load notifications');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setError('Couldn\'t load notifications');
      setIsLoading(false);
    }
  }, [userId]);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read && userId) {
      await markNotificationRead(userId, notif.notificationId);
    }
    setSelectedNotification(notif);
  };

  const executeAction = (actionType?: string, actionData?: any) => {
    if (!actionType) return;
    if (actionType === 'home') {
      navigate('home');
    } else if (actionData && typeof actionData === 'object') {
      navigate(actionType as any, actionData);
    } else {
      navigate(actionType as any);
    }
    setSelectedNotification(null);
  };

  const handleDelete = async (notificationId: string, notifType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    await deleteUserNotification(userId, notificationId, notifType);
    if (selectedNotification?.notificationId === notificationId) {
      setSelectedNotification(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!userId) return;
    await deleteAllUserNotifications(userId);
    setShowDeleteConfirm(false);
    setSelectedNotification(null);
  };

  const handleSeedSamples = async () => {
    if (!userId) return;
    setIsSeeding(true);
    await seedDetailedSampleNotifications(userId, isBengali);
    setIsSeeding(false);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // Helper mapping for icons and color accents
  const getCategoryDetails = (cat?: string, type?: string) => {
    const key = (cat || type || '').toLowerCase();
    if (key.includes('emerg') || key.includes('flood') || key.includes('alert')) {
      return {
        label: isBengali ? 'জরুরি নিরাপত্তা' : 'Emergency',
        icon: <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
        cardBorder: 'border-l-4 border-l-rose-500'
      };
    }
    if (key.includes('gov') || key.includes('muni')) {
      return {
        label: isBengali ? 'পৌর ও প্রশাসনিক' : 'Government',
        icon: <Landmark className="w-4 h-4 text-blue-700 dark:text-blue-400" />,
        badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50',
        cardBorder: 'border-l-4 border-l-[#0756D9]'
      };
    }
    if (key.includes('market') || key.includes('shop') || key.includes('order')) {
      return {
        label: isBengali ? 'দোকান ও অর্ডার' : 'Marketplace',
        icon: <ShoppingBag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
        cardBorder: 'border-l-4 border-l-emerald-500'
      };
    }
    if (key.includes('serv') || key.includes('work')) {
      return {
        label: isBengali ? 'কর্মী ও সেবা' : 'Services',
        icon: <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50',
        cardBorder: 'border-l-4 border-l-indigo-500'
      };
    }
    if (key.includes('comp') || key.includes('civic')) {
      return {
        label: isBengali ? 'নাগরিক অভিযোগ' : 'Complaints',
        icon: <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
        cardBorder: 'border-l-4 border-l-amber-500'
      };
    }
    if (key.includes('med') || key.includes('blood') || key.includes('doctor')) {
      return {
        label: isBengali ? 'চিকিৎসা ও রক্ত' : 'Medical',
        icon: <Droplet className="w-4 h-4 text-red-600 dark:text-red-400" />,
        badgeBg: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50',
        cardBorder: 'border-l-4 border-l-red-500'
      };
    }
    if (key.includes('supp') || key.includes('ticket') || key.includes('ai')) {
      return {
        label: isBengali ? 'সহায়তা' : 'Support',
        icon: <MessageSquare className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
        badgeBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50',
        cardBorder: 'border-l-4 border-l-sky-500'
      };
    }
    if (key.includes('sec') || key.includes('auth')) {
      return {
        label: isBengali ? 'নিরাপত্তা' : 'Security',
        icon: <Shield className="w-4 h-4 text-slate-700 dark:text-slate-300" />,
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
        cardBorder: 'border-l-4 border-l-slate-600'
      };
    }
    return {
      label: isBengali ? 'সিস্টেম' : 'MYJPG Alert',
      icon: <Bell className="w-4 h-4 text-[#0756D9]" />,
      badgeBg: 'bg-blue-50 dark:bg-blue-950/40 text-[#0756D9] border-blue-200',
      cardBorder: 'border-l-4 border-l-[#0756D9]'
    };
  };

  const getPriorityBadge = (p?: string) => {
    switch (p) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 border border-red-200 dark:border-red-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            HIGH
          </span>
        );
      default:
        return null;
    }
  };

  // Filtered Notifications based on selected tab and search query
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Category Filter
      if (selectedCategory === 'unread') {
        if (notif.read) return false;
      } else if (selectedCategory !== 'all') {
        const catKey = (notif.category || notif.type || '').toLowerCase();
        if (!catKey.includes(selectedCategory.toLowerCase())) return false;
      }

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = notif.title?.toLowerCase().includes(q);
        const matchesMsg = notif.message?.toLowerCase().includes(q);
        const matchesRef = notif.referenceId?.toLowerCase().includes(q);
        const matchesDept = notif.department?.toLowerCase().includes(q) || notif.issuingAuthority?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesMsg && !matchesRef && !matchesDept) return false;
      }

      return true;
    });
  }, [notifications, selectedCategory, searchQuery]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const categoriesTabs = [
    { id: 'all', label: isBengali ? 'সকল' : 'All', count: notifications.length },
    { id: 'unread', label: isBengali ? 'অপঠিত' : 'Unread', count: unreadCount },
    { id: 'government', label: isBengali ? 'পৌরসভা' : 'Government' },
    { id: 'emergency', label: isBengali ? 'জরুরি' : 'Emergency' },
    { id: 'marketplace', label: isBengali ? 'মার্কেট' : 'Marketplace' },
    { id: 'services', label: isBengali ? 'সার্ভিস' : 'Services' },
    { id: 'complaints', label: isBengali ? 'অভিযোগ' : 'Complaints' },
    { id: 'medical', label: isBengali ? 'মেডিকেল' : 'Medical' },
    { id: 'support', label: isBengali ? 'সাপোর্ট' : 'Support' },
    { id: 'security', label: isBengali ? 'নিরাপত্তা' : 'Security' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#020617] text-[#11241C] dark:text-[#F8FAFC] pb-28 transition-colors">
      
      {/* Premium Sticky Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-slate-800 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#11241C] dark:text-white tracking-tight flex items-center gap-2">
              <span>{isBengali ? 'বিজ্ঞপ্তি কেন্দ্র' : 'Notification Centre'}</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0756D9] text-white">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#55685F] dark:text-[#94A3B8]">
              {isBengali ? 'জলপাইগুড়ি রিয়েল-টাইম নাগরিক ও পরিষেবা আপডেট' : 'Real-time civic alerts, orders & services'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title={isBengali ? 'সব মুছুন' : 'Clear All'}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">{isBengali ? 'সব মুছুন' : 'Clear All'}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBengali ? 'বিজ্ঞপ্তি, রেফারেন্স বা বিভাগ দিয়ে খুঁজুন (উদাঃ JPG-CIV)...' : 'Search notifications, reference ID (e.g. JPG-ORD)...'}
            className="w-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#11241C] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0756D9]/40 shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Scrollable Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categoriesTabs.map((tab) => {
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  isSelected
                    ? 'bg-[#0756D9] text-white shadow-[#0756D9]/25 shadow-md'
                    : 'bg-white dark:bg-[#0F172A] text-gray-600 dark:text-gray-300 border border-[#E8E4DA] dark:border-white/10 hover:bg-gray-50'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unread Bar & Mark All as Read */}
        {!isLoading && unreadCount > 0 && (
          <div className="flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl px-4 py-2.5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0756D9] dark:text-blue-300">
              <span className="w-2 h-2 rounded-full bg-[#0756D9] animate-ping" />
              <span>
                {isBengali ? `${unreadCount} টি অপঠিত বিজ্ঞপ্তি` : `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`}
              </span>
            </div>
            <button
              onClick={async () => {
                if (!userId) return;
                for (const n of notifications) {
                  if (!n.read) await markNotificationRead(userId, n.notificationId);
                }
              }}
              className="text-xs font-extrabold text-[#0756D9] dark:text-blue-300 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{isBengali ? 'সব পঠিত চিহ্নিত করুন' : 'Mark all as read'}</span>
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E8E4DA] dark:border-white/10 animate-pulse space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State with Seeding Option */}
        {!isLoading && !error && filteredNotifications.length === 0 && (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-8 border border-[#E8E4DA] dark:border-white/10 text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0756D9] dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
              <Bell className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#11241C] dark:text-white">
                {searchQuery ? (isBengali ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching notifications') : (isBengali ? 'বিজ্ঞপ্তি তালিকা ফাঁকা' : 'No notifications in this filter')}
              </h3>
              <p className="text-xs text-[#55685F] dark:text-[#94A3B8] max-w-sm mx-auto">
                {searchQuery
                  ? (isBengali ? 'অন্য কোনো কীওয়ার্ড দিয়ে অনুসন্ধান করুন।' : 'Try searching with a different keyword or reference number.')
                  : (isBengali ? 'আপনি অফিসিয়াল পৌরসভা বিজ্ঞপ্তি ও জরুরি আপডেট লোড করতে পারেন।' : 'Explore official announcements, flood warnings, civic complaints, and order updates.')}
              </p>
            </div>

            {!searchQuery && (
              <button
                onClick={handleSeedSamples}
                disabled={isSeeding}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#0756D9] hover:bg-[#0647b5] text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isBengali ? 'অফিসিয়াল বিজ্ঞপ্তি ও আপডেট লোড করুন' : 'Load Official Notices & Alerts'}</span>
              </button>
            )}
          </div>
        )}

        {/* Notifications Stream */}
        {!isLoading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const catDetails = getCategoryDetails(notif.category, notif.type);
              return (
                <div
                  key={notif.notificationId}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative overflow-hidden bg-white dark:bg-[#0F172A] rounded-2xl p-4 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${catDetails.cardBorder} ${
                    !notif.read
                      ? 'border-blue-400/70 dark:border-blue-600/50 bg-blue-50/20 dark:bg-blue-950/20'
                      : 'border-[#E8E4DA] dark:border-white/10'
                  }`}
                >
                  {/* Top Bar: Category Pill, Priority Badge, Reference ID, Time */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${catDetails.badgeBg}`}>
                        {catDetails.icon}
                        <span>{catDetails.label}</span>
                      </span>

                      {getPriorityBadge(notif.priority)}

                      {notif.referenceId && (
                        <span 
                          onClick={(e) => handleCopy(notif.referenceId!, e)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition-colors"
                          title="Click to copy reference"
                        >
                          <span>{notif.referenceId}</span>
                          {copiedRef === notif.referenceId ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-gray-400" />}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold text-[#55685F] dark:text-[#94A3B8]">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-[#0756D9]" />
                      )}
                    </div>
                  </div>

                  {/* Title & Department */}
                  <div className="mb-1.5">
                    <h4 className="text-sm font-black text-[#11241C] dark:text-white leading-snug">
                      {notif.title}
                    </h4>
                    {(notif.issuingAuthority || notif.department) && (
                      <p className="text-[11px] font-semibold text-[#0756D9] dark:text-blue-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{notif.issuingAuthority || notif.department}</span>
                      </p>
                    )}
                  </div>

                  {/* Message Preview */}
                  <p className="text-xs text-[#55685F] dark:text-[#94A3B8] leading-relaxed mb-3 line-clamp-2">
                    {notif.previewMessage || notif.message}
                  </p>

                  {/* Status / Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      {notif.currentStatus && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-blue-50 dark:bg-blue-900/30 text-[#0756D9] dark:text-blue-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0756D9]" />
                          {notif.currentStatus}
                        </span>
                      )}
                      {notif.actionRequired && (
                        <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Action Required</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-[#0756D9] dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>{isBengali ? 'বিস্তারিত ও টাইমলাইন' : 'Details & Timeline'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>

                      <button
                        onClick={(e) => handleDelete(notif.notificationId, notif.type, e)}
                        className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* DEDICATED NOTIFICATION DETAIL MODAL */}
      {selectedNotification && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedNotification(null)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8E4DA] dark:border-white/10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E8E4DA] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getCategoryDetails(selectedNotification.category, selectedNotification.type).badgeBg}`}>
                  {getCategoryDetails(selectedNotification.category, selectedNotification.type).icon}
                  <span>{getCategoryDetails(selectedNotification.category, selectedNotification.type).label}</span>
                </span>
                {getPriorityBadge(selectedNotification.priority)}
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              
              {/* Title & Department */}
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#11241C] dark:text-white leading-snug">
                  {selectedNotification.title}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-[#55685F] dark:text-[#94A3B8]">
                  {selectedNotification.issuingAuthority && (
                    <span className="flex items-center gap-1 font-semibold text-[#0756D9] dark:text-blue-400">
                      <Building2 className="w-3.5 h-3.5" />
                      {selectedNotification.issuingAuthority}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedNotification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status & Reference Banner */}
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-2xl border border-gray-200 dark:border-white/10 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-[10px] uppercase font-bold text-gray-500">
                    {isBengali ? 'রেফারেন্স আইডি' : 'Reference ID'}
                  </div>
                  <div className="text-xs font-mono font-black text-[#11241C] dark:text-white flex items-center gap-1.5">
                    <span>{selectedNotification.referenceId || selectedNotification.notificationId.slice(0, 14)}</span>
                    <button
                      onClick={(e) => handleCopy(selectedNotification.referenceId || selectedNotification.notificationId, e)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {selectedNotification.currentStatus && (
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-gray-500">
                      {isBengali ? 'বর্তমান অবস্থা' : 'Current Status'}
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#0756D9]/10 text-[#0756D9] dark:text-blue-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0756D9]" />
                      {selectedNotification.currentStatus}
                    </div>
                  </div>
                )}
              </div>

              {/* Full Detailed Message */}
              <div className="space-y-1">
                <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-500">
                  {isBengali ? 'বার্তা বিবরণ' : 'Detailed Announcement'}
                </h5>
                <p className="text-xs sm:text-sm text-[#11241C] dark:text-gray-200 leading-relaxed p-4 bg-blue-50/30 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                  {selectedNotification.detailedMessage || selectedNotification.message}
                </p>
              </div>

              {/* Action Required Alert Box */}
              {selectedNotification.actionRequired && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-black text-amber-800 dark:text-amber-300">
                      {isBengali ? 'জরুরি পদক্ষেপ প্রয়োজন' : 'Action Required for Citizen'}
                    </h6>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                      {typeof selectedNotification.actionRequired === 'string'
                        ? selectedNotification.actionRequired
                        : (isBengali ? 'অনুগ্রহ করে নিচের সংশ্লিষ্ট অ্যাকশন বাটনে ক্লিক করে কাজ সম্পন্ন করুন।' : 'Please review and proceed with the action buttons below.')}
                    </p>
                  </div>
                </div>
              )}

              {/* Chronological Progress Timeline */}
              {selectedNotification.timeline && selectedNotification.timeline.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0756D9]" />
                    <span>{isBengali ? 'ইভেন্ট টাইমলাইন' : 'Event Lifecycle Timeline'}</span>
                  </h5>
                  <div className="relative pl-5 border-l-2 border-[#0756D9]/30 dark:border-blue-500/30 space-y-3.5 ml-2">
                    {selectedNotification.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <span className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-[#0756D9] ring-4 ring-blue-100 dark:ring-blue-950" />
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#11241C] dark:text-white">{step.title}</span>
                          <span className="text-[10px] text-gray-500">{step.time}</span>
                        </div>
                        <div className="text-[11px] text-[#0756D9] dark:text-blue-400 font-semibold">{step.status}</div>
                        {step.note && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{step.note}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Official Contact Info */}
              {selectedNotification.contactInfo && (
                <div className="p-3.5 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-200 dark:border-white/10 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                    {isBengali ? 'অফিসিয়াল যোগাযোগ' : 'Authorized Contact Information'}
                  </div>
                  {selectedNotification.contactInfo.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <Phone className="w-3.5 h-3.5 text-[#0756D9]" />
                      <a href={`tel:${selectedNotification.contactInfo.phone}`} className="font-bold text-[#0756D9] hover:underline">
                        {selectedNotification.contactInfo.phone}
                      </a>
                    </div>
                  )}
                  {selectedNotification.contactInfo.address && (
                    <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                      <span>{selectedNotification.contactInfo.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[#0F172A] border-t border-[#E8E4DA] dark:border-white/10 flex items-center justify-end gap-2.5">
              {selectedNotification.secondaryAction && (
                <button
                  onClick={() => executeAction(selectedNotification.secondaryAction?.actionType, selectedNotification.secondaryAction?.actionData)}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {selectedNotification.secondaryAction.label}
                </button>
              )}

              {selectedNotification.primaryAction ? (
                <button
                  onClick={() => executeAction(selectedNotification.primaryAction?.actionType, selectedNotification.primaryAction?.actionData)}
                  className="px-5 py-2.5 bg-[#0756D9] hover:bg-[#0647b5] text-white text-xs font-extrabold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <span>{selectedNotification.primaryAction.label}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-5 py-2.5 bg-[#0756D9] text-white text-xs font-extrabold rounded-xl cursor-pointer"
                >
                  {isBengali ? 'ঠিক আছে' : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DA] dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6 animate-bounce" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-[#11241C] dark:text-white">
                {isBengali ? 'সব বিজ্ঞপ্তি মুছে ফেলবেন?' : 'Clear all notifications?'}
              </h3>
              <p className="text-xs text-[#55685F] dark:text-[#94A3B8]">
                {isBengali ? 'এটি আপনার সমস্ত বিজ্ঞপ্তি স্থায়ীভাবে মুছে ফেলবে।' : 'This will permanently remove all notifications from your notification stream.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-extrabold hover:bg-gray-200 cursor-pointer transition-colors"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteAll}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md cursor-pointer transition-colors"
              >
                {isBengali ? 'সব মুছুন' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
