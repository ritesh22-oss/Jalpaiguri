import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useNav } from '../../context/NavigationContext';

interface NotificationBellProps {
  userId?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const { navigate } = useNav();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasNewPulse, setHasNewPulse] = useState(false);

  useEffect(() => {
    if (!userId || !db) return;
    const notifRef = collection(db, 'users', userId, 'notifications');
    const q = query(notifRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      console.warn('Error listening to notifications count:', err);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <button
      onClick={() => navigate('notifications')}
      className={`relative w-9 h-9 rounded-full bg-white dark:bg-[#0F172A] border border-[#E8E4DA] dark:border-white/10 text-[#11241C] dark:text-[#F8FAFC] flex items-center justify-center shadow-sm hover:bg-[#F3F0E6] dark:hover:bg-blue-950/60 dark:hover:border-blue-500/50 dark:hover:text-blue-400 active:scale-95 transition-all cursor-pointer ${
        hasNewPulse ? 'animate-bounce' : ''
      }`}
      title="Notifications"
      aria-label="Open notifications"
    >
      <Bell className="w-4 h-4 stroke-[2]" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#D9383A] text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-md animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};
