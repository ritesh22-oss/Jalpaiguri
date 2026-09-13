import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNav } from '../../context/NavigationContext';

export const AdminNotificationBell: React.FC = () => {
  const { navigate } = useNav();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasNewPulse, setHasNewPulse] = useState(false);

  useEffect(() => {
    if (!db) return;
    const notifRef = collection(db, 'adminNotifications');
    const unsubscribe = onSnapshot(notifRef, (snapshot) => {
      let count = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!data.read) count++;
      });
      if (count > unreadCount && unreadCount >= 0) {
        setHasNewPulse(true);
        setTimeout(() => setHasNewPulse(false), 3000);
      }
      setUnreadCount(count);
    }, (err) => {
      console.warn('Error listening to admin notifications count:', err);
    });

    return () => unsubscribe();
  }, [unreadCount]);

  return (
    <button
      onClick={() => navigate('admin-notifications')}
      className={`relative p-2 text-[#11241C] dark:text-[#F8FAFC] hover:bg-[#FAF8F5] dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors ${
        hasNewPulse ? 'animate-bounce' : ''
      }`}
      title="Admin Notifications"
      aria-label="Open admin notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#D9383A] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
