import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Trash2, 
  CheckCheck, 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  Droplet, 
  AlertTriangle, 
  Briefcase, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNav } from '../../context/NavigationContext';
import { useLanguage } from '../../context/LanguageContext';
import { Header } from '../common/Header';
import { 
  markAdminNotificationRead, 
  deleteAdminNotification, 
  deleteAllAdminNotifications 
} from '../../services/notificationService';
import { AppNotification } from '../../types';

export const AdminNotificationsView: React.FC = () => {
  const { goBack, navigate } = useNav();
  const { isBengali } = useLanguage();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    try {
      const notifRef = collection(db, 'adminNotifications');
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
        console.error('Error fetching admin notifications:', err);
        setError('Couldn\'t load admin notifications');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setError('Couldn\'t load admin notifications');
      setIsLoading(false);
    }
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    await markAdminNotificationRead(notificationId);
  };

  const handleDelete = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteAdminNotification(notificationId);
  };

  const handleDeleteAll = async () => {
    await deleteAllAdminNotifications();
    setShowDeleteConfirm(false);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Users' && (n.type === 'NEW_USER' || n.entityType === 'user')) return true;
    if (activeTab === 'Shops' && (n.type.includes('SHOP') || n.entityType === 'shop')) return true;
    if (activeTab === 'Blood' && n.type.includes('BLOOD')) return true;
    if (activeTab === 'Reports' && (n.type.includes('REPORT') || n.type.includes('CIVIC'))) return true;
    if (activeTab === 'Services' && n.type.includes('WORKER')) return true;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const categories = ['All', 'Users', 'Shops', 'Blood', 'Services', 'Reports'];

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#020617] text-[#11241C] dark:text-[#F8FAFC] pb-24 transition-colors">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-[#E8E4DA] dark:border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('admin-dashboard')}
            className="w-10 h-10 rounded-full bg-[#FAF8F5] dark:bg-slate-800 border border-[#E8E4DA] dark:border-white/10 flex items-center justify-center text-[#11241C] dark:text-white hover:bg-gray-100 cursor-pointer transition-all"
            aria-label="Back to Admin Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-[#11241C] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#007AFF]" />
              <span>Admin Notifications</span>
            </h1>
            <p className="text-[11px] text-[#55685F] dark:text-[#94A3B8]">
              {unreadCount} unread activity updates
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete all</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold whitespace-nowrap cursor-pointer transition-all ${
                activeTab === cat
                  ? 'bg-[#11241C] text-white dark:bg-[#38BDF8] dark:text-[#0F172A] shadow-md'
                  : 'bg-white dark:bg-[#0F172A] text-[#55685F] dark:text-[#94A3B8] border border-[#E8E4DA] dark:border-white/10 hover:border-gray-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E8E4DA] dark:border-white/10 animate-pulse flex gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-slate-800 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filteredNotifications.length === 0 && (
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-12 border border-[#E8E4DA] dark:border-white/10 text-center space-y-3">
            <Bell className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-sm font-black text-[#11241C] dark:text-white">No admin activity notifications</h3>
            <p className="text-xs text-[#55685F] dark:text-[#94A3B8]">When users perform actions in MYJPG, they will appear here in real-time.</p>
          </div>
        )}

        {/* List */}
        {!isLoading && filteredNotifications.length > 0 && (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.notificationId}
                onClick={() => handleMarkRead(notif.notificationId)}
                className={`bg-white dark:bg-[#0F172A] rounded-2xl p-4 border transition-all cursor-pointer shadow-xs hover:shadow-md ${
                  !notif.read ? 'border-blue-300 dark:border-blue-700 bg-blue-50/10' : 'border-[#E8E4DA] dark:border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-400 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-[#11241C] dark:text-white">{notif.title}</h4>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#007AFF] dark:text-blue-300">
                          {notif.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#55685F] dark:text-[#94A3B8] leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.actorName && (
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-semibold text-[#55685F] dark:text-slate-400">
                          <span>Actor: <strong className="text-[#11241C] dark:text-white">{notif.actorName}</strong></span>
                          <span>•</span>
                          <span>{new Date(notif.createdAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse" />
                    )}
                    <button
                      onClick={(e) => handleDelete(notif.notificationId, e)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete All Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#E8E4DA] dark:border-white/10 space-y-4">
            <h3 className="text-sm font-black text-[#11241C] dark:text-white">Delete all admin notifications?</h3>
            <p className="text-xs text-[#55685F] dark:text-[#94A3B8]">This will permanently remove all activity records.</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
