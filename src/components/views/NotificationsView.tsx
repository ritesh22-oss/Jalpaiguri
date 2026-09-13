import React, { useState, useEffect } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  markNotificationRead, 
  deleteUserNotification, 
  deleteAllUserNotifications 
} from '../../services/notificationService';
import { AppNotification } from '../../types';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const { goBack, navigate } = useNav();
  const { isBengali } = useLanguage();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const userId = user?.id || '';

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
    if (notif.actionType) {
      if (notif.actionType === 'home') {
        navigate('home');
      } else if (notif.actionData && typeof notif.actionData === 'object') {
        navigate(notif.actionType as any, notif.actionData);
      } else {
        navigate(notif.actionType as any);
      }
    }
  };

  const handleDelete = async (notificationId: string, notifType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userId) return;
    await deleteUserNotification(userId, notificationId, notifType);
  };

  const handleDeleteAll = async () => {
    if (!userId) return;
    await deleteAllUserNotifications(userId);
    setShowDeleteConfirm(false);
  };

  const getIconForType = (type: string, iconStr?: string) => {
    switch (type) {
      case 'WELCOME':
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'SHOP':
      case 'SHOP_VERIFICATION':
        return <ShoppingBag className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'BLOOD_REQUEST':
      case 'BLOOD_DONOR':
        return <Droplet className="w-5 h-5 text-rose-500" />;
      case 'ALERT':
      case 'CIVIC_REPORT':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'JOB':
      case 'WORKER':
        return <Briefcase className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-[#007AFF]" />;
    }
  };

  const formatDateGroup = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return isBengali ? 'আজ' : 'TODAY';
      }
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return isBengali ? 'গতকাল' : 'YESTERDAY';
      }
      return isBengali ? 'পূর্ববর্তী' : 'EARLIER';
    } catch (e) {
      return isBengali ? 'অন্যান্য' : 'EARLIER';
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const groupedNotifications: Record<string, AppNotification[]> = {
    [isBengali ? 'আজ' : 'TODAY']: [],
    [isBengali ? 'গতকাল' : 'YESTERDAY']: [],
    [isBengali ? 'পূর্ববর্তী' : 'EARLIER']: []
  };

  notifications.forEach((n) => {
    const group = formatDateGroup(n.createdAt);
    if (!groupedNotifications[group]) {
      groupedNotifications[group] = [];
    }
    groupedNotifications[group].push(n);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#020617] text-[#11241C] dark:text-[#F8FAFC] pb-24 transition-colors animate-in fade-in duration-300">
      {/* Clean Custom Header without Home, AI Assistant, or Bell icons */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-slate-800 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer shadow-xs"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2]" />
          </button>
          <div>
            <h1 className="text-base font-black text-[#11241C] dark:text-white tracking-tight">
              {isBengali ? 'বিজ্ঞপ্তি কেন্দ্র' : 'Notifications Center'}
            </h1>
            <p className="text-[11px] text-[#55685F] dark:text-[#94A3B8]">
              {isBengali ? 'আপনার সকল কার্যক্রমের আপডেট' : 'All your activity updates & alerts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isBengali ? 'সব মুছুন' : 'Clear All'}</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        {/* Unread banner / count */}
        {!isLoading && notifications.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-3 duration-400">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-[#007AFF] text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                {unreadCount}
              </div>
              <div>
                <h3 className="text-xs font-black text-[#11241C] dark:text-[#F8FAFC]">
                  {isBengali ? 'আপনার অপঠিত বিজ্ঞপ্তি' : 'Unread Notifications'}
                </h3>
                <p className="text-[11px] text-[#55685F] dark:text-[#94A3B8]">
                  {unreadCount === 0 
                    ? (isBengali ? 'সব বিজ্ঞপ্তি পঠিত হয়েছে' : 'All caught up!') 
                    : (isBengali ? `${unreadCount} টি নতুন বিজ্ঞপ্তি রয়েছে` : `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`)}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  if (!userId) return;
                  for (const n of notifications) {
                    if (!n.read) {
                      await markNotificationRead(userId, n.notificationId);
                    }
                  }
                }}
                className="text-xs font-extrabold text-[#007AFF] dark:text-[#38BDF8] hover:underline flex items-center gap-1.5 cursor-pointer bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">{isBengali ? 'সব পঠিত' : 'Mark all read'}</span>
              </button>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E8E4DA] dark:border-white/10 animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-8 border border-[#E8E4DA] dark:border-white/10 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#11241C] dark:text-white">
              {isBengali ? 'বিজ্ঞপ্তি লোড করা যায়নি' : 'Couldn\'t load notifications'}
            </h3>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-extrabold cursor-pointer"
            >
              {isBengali ? 'আবার চেষ্টা করুন' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && notifications.length === 0 && (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-12 border border-[#E8E4DA] dark:border-white/10 text-center space-y-4 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <Bell className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-[#11241C] dark:text-white">
                {isBengali ? 'কোনো নতুন বিজ্ঞপ্তি নেই' : 'You\'re all caught up'}
              </h3>
              <p className="text-xs text-[#55685F] dark:text-[#94A3B8] max-w-xs mx-auto">
                {isBengali 
                  ? 'এই মুহূর্তে আপনার কোনো নতুন বিজ্ঞপ্তি নেই।' 
                  : 'No new notifications right now. We\'ll notify you when something important arrives.'}
              </p>
            </div>
          </div>
        )}

        {/* Notification List Grouped by Date with Smooth Animations */}
        {!isLoading && !error && notifications.length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([groupName, groupItems]) => {
              if (groupItems.length === 0) return null;
              return (
                <div key={groupName} className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-400">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-[#55685F] dark:text-[#94A3B8] px-1 flex items-center gap-2">
                    <span>{groupName}</span>
                    <span className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                  </h4>

                  <div className="space-y-3">
                    {groupItems.map((notif, index) => (
                      <div
                        key={notif.notificationId}
                        onClick={() => handleNotificationClick(notif)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className={`group relative overflow-hidden bg-white dark:bg-[#0F172A] rounded-2xl p-4 border transition-all duration-300 cursor-pointer shadow-xs hover:shadow-lg hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 ${
                          !notif.read 
                            ? 'border-blue-400/80 dark:border-blue-600/60 bg-blue-50/25 dark:bg-blue-950/20 ring-1 ring-blue-300/30' 
                            : 'border-[#E8E4DA] dark:border-white/10 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Icon */}
                          <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform">
                            {getIconForType(notif.type, notif.icon)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h5 className="text-xs font-black text-[#11241C] dark:text-white truncate">
                                {notif.title}
                              </h5>
                              <span className="text-[10px] font-bold text-[#55685F] dark:text-[#94A3B8] shrink-0 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                {formatTime(notif.createdAt)}
                              </span>
                            </div>

                            <p className="text-xs text-[#55685F] dark:text-[#94A3B8] leading-relaxed mb-3">
                              {notif.message}
                            </p>

                            <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-white/10">
                              <div className="flex items-center gap-2">
                                {!notif.read && (
                                  <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-ping" />
                                )}
                                {notif.actionType && (
                                  <span className="text-[11px] font-black text-[#007AFF] dark:text-[#38BDF8] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    <span>{isBengali ? 'বিস্তারিত দেখুন' : 'View details'}</span>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={(e) => handleDelete(notif.notificationId, notif.type, e)}
                                className="text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete All Confirmation Modal */}
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
                {isBengali ? 'এটি আপনার সমস্ত বিজ্ঞপ্তি স্থায়ীভাবে মুছে ফেলবে।' : 'This will permanently remove all your notifications.'}
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
