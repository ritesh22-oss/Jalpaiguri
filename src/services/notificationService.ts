import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppNotification } from '../types';

export async function createUserNotification(
  userId: string, 
  data: {
    type: string;
    title: string;
    message: string;
    actionType?: string;
    actionData?: Record<string, any>;
    icon?: string;
  }
) {
  if (!userId || !db) return;
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const newDoc = doc(notifRef);
    await setDoc(newDoc, {
      notificationId: newDoc.id,
      userId,
      type: data.type || 'SYSTEM',
      title: data.title,
      message: data.message,
      createdAt: new Date().toISOString(),
      read: false,
      icon: data.icon || 'bell',
      actionType: data.actionType || null,
      actionData: data.actionData || null
    });
  } catch (e) {
    console.error('Error creating user notification:', e);
  }
}

export async function createAdminNotification(
  data: {
    type: string;
    title: string;
    message: string;
    actorUid?: string;
    actorName?: string;
    entityId?: string;
    entityType?: string;
    actionType?: string;
    actionData?: Record<string, any>;
  }
) {
  if (!db) return;
  try {
    const adminNotifRef = collection(db, 'adminNotifications');
    const newDoc = doc(adminNotifRef);
    await setDoc(newDoc, {
      notificationId: newDoc.id,
      type: data.type || 'ADMIN_ALERT',
      title: data.title,
      message: data.message,
      createdAt: new Date().toISOString(),
      read: false,
      actorUid: data.actorUid || '',
      actorName: data.actorName || 'User',
      entityId: data.entityId || '',
      entityType: data.entityType || '',
      actionType: data.actionType || null,
      actionData: data.actionData || null
    });
  } catch (e) {
    console.error('Error creating admin notification:', e);
  }
}

export async function markNotificationRead(userId: string, notificationId: string) {
  if (!userId || !notificationId || !db) return;
  try {
    const ref = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(ref, { read: true });
  } catch (e) {
    console.error('Error marking user notification read:', e);
  }
}

export async function markAdminNotificationRead(notificationId: string) {
  if (!notificationId || !db) return;
  try {
    const ref = doc(db, 'adminNotifications', notificationId);
    await updateDoc(ref, { read: true });
  } catch (e) {
    console.error('Error marking admin notification read:', e);
  }
}

export async function deleteUserNotification(userId: string, notificationId: string, notifType?: string) {
  if (!userId || !notificationId || !db) return;
  try {
    if (notifType === 'WELCOME') {
      localStorage.setItem(`myjpg_welcomed_${userId}`, 'true');
    }
    const ref = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(ref);
  } catch (e) {
    console.error('Error deleting user notification:', e);
  }
}

export async function deleteAdminNotification(notificationId: string) {
  if (!notificationId || !db) return;
  try {
    const ref = doc(db, 'adminNotifications', notificationId);
    await deleteDoc(ref);
  } catch (e) {
    console.error('Error deleting admin notification:', e);
  }
}

export async function deleteAllUserNotifications(userId: string) {
  if (!userId || !db) return;
  try {
    localStorage.setItem(`myjpg_welcomed_${userId}`, 'true');
    const notifRef = collection(db, 'users', userId, 'notifications');
    const snap = await getDocs(notifRef);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (e) {
    console.error('Error deleting all user notifications:', e);
  }
}

export async function deleteAllAdminNotifications() {
  if (!db) return;
  try {
    const ref = collection(db, 'adminNotifications');
    const snap = await getDocs(ref);
    const promises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  } catch (e) {
    console.error('Error deleting all admin notifications:', e);
  }
}

export async function checkAndCreateWelcomeNotification(user: { id: string; name: string; language?: string }) {
  if (!user || !user.id || !db) return false;
  try {
    const welcomedKey = `myjpg_welcomed_${user.id}`;
    if (localStorage.getItem(welcomedKey) === 'true') {
      return false; // Already created, deleted or dismissed before
    }
    const notifRef = collection(db, 'users', user.id, 'notifications');
    const snap = await getDocs(notifRef);
    const hasWelcome = snap.docs.some(d => d.data().type === 'WELCOME');
    if (hasWelcome) {
      return false;
    }

    const isBengali = user.language === 'বাংলা';
    const userName = user.name || 'Citizen';
    
    const title = isBengali 
      ? `MYJPG-তে স্বাগতম, ${userName}! 👋`
      : `Welcome to MYJPG, ${userName}! 👋`;
      
    const message = isBengali
      ? `MYJPG-তে আপনাকে স্বাগতম! জলপাইগুড়ির স্থানীয় পরিষেবা, কাছাকাছি সাহায্য এবং গুরুত্বপূর্ণ তথ্য সহজেই খুঁজে নিন।`
      : `Welcome to MYJPG! We're happy to have you here. Explore local services, discover places, find help nearby, and stay connected with Jalpaiguri.`;

    await createUserNotification(user.id, {
      type: 'WELCOME',
      title,
      message,
      icon: 'sparkles',
      actionType: 'home'
    });

    await createAdminNotification({
      type: 'NEW_USER',
      title: 'New user registered',
      message: `${userName} created a MYJPG account.`,
      actorUid: user.id,
      actorName: userName,
      entityId: user.id,
      entityType: 'user'
    });

    return true; // Newly created welcome notification
  } catch (e) {
    console.error('Error checking/creating welcome notification:', e);
  }
  return false;
}
