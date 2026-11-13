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
  data: Partial<AppNotification> & {
    title: string;
    message: string;
    type?: string;
  }
) {
  if (!userId || !db) return;
  try {
    const notifRef = collection(db, 'users', userId, 'notifications');
    const newDoc = doc(notifRef);
    const notificationId = data.notificationId || newDoc.id;
    const now = new Date().toISOString();

    const notifPayload: AppNotification = {
      notificationId,
      id: notificationId,
      userId,
      type: data.type || (data.category ? String(data.category).toUpperCase() : 'SYSTEM'),
      title: data.title,
      message: data.message,
      previewMessage: data.previewMessage || (data.message.length > 110 ? data.message.slice(0, 107) + '...' : data.message),
      detailedMessage: data.detailedMessage || data.message,
      category: data.category || 'system',
      subcategory: data.subcategory || '',
      priority: data.priority || 'normal',
      senderName: data.senderName || 'MYJPG Administration',
      department: data.department || '',
      issuingAuthority: data.issuingAuthority || 'Jalpaiguri District Administration',
      createdAt: data.createdAt || now,
      timestamp: data.timestamp || now,
      expiresAt: data.expiresAt || '',
      read: false,
      deliveryStatus: 'delivered',
      language: data.language || 'en',
      icon: data.icon || 'bell',
      imageUrl: data.imageUrl || '',
      attachmentUrl: data.attachmentUrl || '',
      referenceId: data.referenceId || '',
      currentStatus: data.currentStatus || 'Delivered',
      previousStatus: data.previousStatus || '',
      actionRequired: data.actionRequired ?? false,
      primaryAction: data.primaryAction || (data.actionType ? {
        label: 'View Details',
        actionType: data.actionType,
        actionData: data.actionData
      } : undefined),
      secondaryAction: data.secondaryAction,
      deepLink: data.deepLink || '',
      timeline: data.timeline || [
        {
          title: 'Event Triggered',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: data.currentStatus || 'Completed',
          note: 'Recorded by MYJPG Central Notification Gateway.'
        }
      ],
      contactInfo: data.contactInfo,
      actionType: data.actionType || data.primaryAction?.actionType || null as any,
      actionData: data.actionData || data.primaryAction?.actionData || null
    };

    await setDoc(newDoc, notifPayload);
    return notifPayload;
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

    // Automatically seed detailed category notifications so user has immediate rich experience
    await seedDetailedSampleNotifications(user.id, isBengali);

    return true; // Newly created welcome notification
  } catch (e) {
    console.error('Error checking/creating welcome notification:', e);
  }
  return false;
}

export async function seedDetailedSampleNotifications(userId: string, isBengali = false) {
  if (!userId || !db) return;
  try {
    const seedFlag = `myjpg_seeded_v2_${userId}`;
    if (localStorage.getItem(seedFlag) === 'true') return;
    localStorage.setItem(seedFlag, 'true');

    const sampleNotifications: Array<Parameters<typeof createUserNotification>[1]> = [
      {
        notificationId: `gov-${Date.now()}-1`,
        title: isBengali ? 'গুরুত্বপূর্ণ পৌর বিজ্ঞপ্তি – জল সরবরাহ বিঘ্নিত' : 'Important Municipal Announcement – Water Supply Notice',
        message: isBengali 
          ? 'জলপাইগুড়ি পৌরসভা জানিয়েছে যে জরুরি পাইপলাইন মেরামতির জন্য আগামীকাল সকাল ১০:০০ থেকে দুপুর ২:০০ পর্যন্ত জল সরবরাহ বন্ধ থাকবে।'
          : 'Jalpaiguri Municipality has announced a scheduled water supply interruption in your selected area tomorrow from 10:00 AM to 2:00 PM due to urgent main pipeline maintenance.',
        category: 'government',
        subcategory: 'Public Utilities',
        priority: 'high',
        issuingAuthority: isBengali ? 'জলপাইগুড়ি পৌরসভা' : 'Jalpaiguri Municipality (PHE Dept)',
        department: 'Water Works & Sanitation',
        referenceId: 'MUNI-WAT-2026-08',
        currentStatus: isBengali ? 'নির্ধারিত' : 'Scheduled',
        actionRequired: isBengali ? 'আগাম জল সংরক্ষণ করুন' : 'Store adequate water in advance',
        primaryAction: {
          label: isBengali ? 'সম্পূর্ণ বিজ্ঞপ্তি দেখুন' : 'View Full Notice',
          actionType: 'home'
        },
        secondaryAction: {
          label: isBengali ? 'প্রভাবিত এলাকা' : 'Affected Wards',
          actionType: 'home'
        },
        timeline: [
          { title: 'Notice Published', time: '09:00 AM', status: 'Published', note: 'Public gazette issued by Municipal Executive Officer' },
          { title: 'Ward Broadcast', time: '09:30 AM', status: 'Completed', note: 'Ward 1 to 12 counseling broadcasted' },
          { title: 'Work Scheduled', time: '10:00 AM Tomorrow', status: 'Pending', note: 'Maintenance crew on site' }
        ],
        contactInfo: {
          phone: '03561-222384',
          address: 'Jalpaiguri Municipality, Kadamtala'
        }
      },
      {
        notificationId: `emg-${Date.now()}-2`,
        title: isBengali ? 'উচ্চ সতর্কতা – তিস্তা নদী বন্যা সতর্কতা' : 'HIGH PRIORITY – Flood & Waterlogging Warning',
        message: isBengali
          ? 'তিস্তা নদীর তীরবর্তী নিম্নাঞ্চলে বন্যা সতর্কতা জারি করা হয়েছে। ঝুঁকিপূর্ণ এলাকার বাসিন্দাদের সরকারি নিরাপত্তা নির্দেশিকা মানতে অনুরোধ করা হচ্ছে।'
          : 'A high priority flood warning has been issued for the low-lying areas near the Teesta river embankment. Residents in vulnerable locations should follow official safety instructions.',
        category: 'emergency',
        subcategory: 'Weather & Natural Disaster',
        priority: 'critical',
        issuingAuthority: isBengali ? 'জেলা দুর্যোগ ব্যবস্থাপনা দপ্তর' : 'District Disaster Management Authority (DDMA)',
        department: 'Irrigation & Waterways Department',
        referenceId: 'ALERT-FL-2026-03',
        currentStatus: isBengali ? 'সক্রিয় সতর্কতা' : 'Active Alert',
        primaryAction: {
          label: isBengali ? 'নিরাপত্তা নির্দেশিকা' : 'Safety Instructions',
          actionType: 'safety-sos'
        },
        secondaryAction: {
          label: isBengali ? 'জরুরি হেল্পলাইন' : 'Emergency Contacts',
          actionType: 'safety-sos'
        },
        timeline: [
          { title: 'River Gauge Alert', time: '06:00 AM', status: 'Warning Level Crossed', note: 'Teesta barrage discharge at 4500 cumec' },
          { title: 'DDMA Red Alert Issued', time: '07:15 AM', status: 'Active', note: 'SDRF teams stationed at Domohani and Rajbari embankment' }
        ],
        contactInfo: {
          phone: '1077 (Toll Free) / 03561-230222',
          address: 'Disaster Control Room, Collectorate Building, Jalpaiguri'
        }
      },
      {
        notificationId: `civ-${Date.now()}-3`,
        title: isBengali ? 'আপনার নাগরিক অভিযোগ দায়িত্বপ্রাপ্ত হয়েছে' : 'Your Civic Complaint Has Been Assigned',
        message: isBengali
          ? 'রাস্তা সংস্কার সম্পর্কিত আপনার অভিযোগ (রেফারেন্স: JPG-CIV-2041) পৌর পূর্ত দপ্তরের উপর ন্যস্ত হয়েছে। দপ্তর বিষয়টি পর্যালোচনা করছে।'
          : 'Your complaint regarding road surface repairs, reference JPG-CIV-2041, has been assigned to the Municipal Works Department. The department has acknowledged the report and scheduled inspection.',
        category: 'complaints',
        subcategory: 'Roads & Infrastructure',
        priority: 'normal',
        issuingAuthority: 'Jalpaiguri Municipality',
        department: 'Civil Infrastructure & Public Works',
        referenceId: 'JPG-CIV-2041',
        currentStatus: isBengali ? 'দায়িত্বপ্রাপ্ত' : 'Assigned',
        previousStatus: isBengali ? 'জমা দেওয়া হয়েছে' : 'Submitted',
        primaryAction: {
          label: isBengali ? 'অভিযোগ ট্র্যাক করুন' : 'Track Complaint',
          actionType: 'civic-report'
        },
        timeline: [
          { title: 'Complaint Submitted', time: '10:30 AM', status: 'Submitted', note: 'Recorded via MYJPG Citizen App' },
          { title: 'Reference Generated', time: '10:30 AM', status: 'Verified', note: 'Unique ID JPG-CIV-2041 allocated' },
          { title: 'Assigned to Department', time: '12:15 PM', status: 'Assigned', note: 'Transferred to Executive Engineer (Civil)' },
          { title: 'Department Acknowledged', time: '02:00 PM', status: 'Acknowledged', note: 'Inspection team rostered for tomorrow' }
        ]
      },
      {
        notificationId: `mkt-${Date.now()}-4`,
        title: isBengali ? 'আপনার অর্ডার সফলভাবে নিশ্চিত হয়েছে!' : 'Your Order Is Confirmed! (JPG-ORD-1024)',
        message: isBengali
          ? 'আপনার অর্ডার JPG-ORD-1024 মার্চেন্ট দ্বারা গৃহীত হয়েছে। প্যাকেজিং চলছে। ডেলিভারির সময় আপনাকে পুনরায় জানানো হবে।'
          : 'Your order JPG-ORD-1024 (3 items, ₹450) has been accepted by the merchant. Your items are currently being prepared and packed for dispatch.',
        category: 'marketplace',
        subcategory: 'Order Lifecycle',
        priority: 'normal',
        issuingAuthority: 'MYJPG Marketplace Platform',
        department: 'Order Fulfillment & Logistics',
        referenceId: 'JPG-ORD-1024',
        currentStatus: isBengali ? 'প্রস্তুত হচ্ছে' : 'Preparing',
        previousStatus: isBengali ? 'পেন্ডিং' : 'Awaiting Confirmation',
        primaryAction: {
          label: isBengali ? 'অর্ডার ট্র্যাক করুন' : 'Track Order',
          actionType: 'shops'
        },
        timeline: [
          { title: 'Order Placed', time: '01:15 PM', status: 'Paid', note: 'Order total ₹450 received' },
          { title: 'Merchant Accepted', time: '01:22 PM', status: 'Confirmed', note: 'Dinbazar Local Store approved order' },
          { title: 'Packing Items', time: '01:45 PM', status: 'In Progress', note: '3 grocery items packed in eco-bag' }
        ]
      },
      {
        notificationId: `med-${Date.now()}-5`,
        title: isBengali ? 'জরুরি রক্তদানের অনুরোধের আপডেট' : 'Blood Donation Request Update – Donor Matched',
        message: isBengali
          ? 'জলপাইগুড়ি সদর হাসপাতালের জন্য আপনার B+ রক্তদানের অনুরোধে একজন নিবন্ধিত দাতা সাড়া দিয়েছেন।'
          : 'A registered local donor has responded to your emergency blood donation request for B+ blood at District Sadar Hospital. Open the request to coordinate directly.',
        category: 'medical',
        subcategory: 'Blood Bank & Emergency',
        priority: 'high',
        issuingAuthority: 'Jalpaiguri Blood Bank Network',
        department: 'District Sadar Hospital Blood Bank',
        referenceId: 'BLD-REQ-4019',
        currentStatus: isBengali ? 'দাতা পাওয়া গেছে' : 'Donor Matched',
        primaryAction: {
          label: isBengali ? 'অনুরোধ দেখুন' : 'View Blood Request',
          actionType: 'blood'
        },
        timeline: [
          { title: 'Request Broadcasted', time: '11:00 AM', status: 'Active', note: 'Sent to 42 verified B+ donors in 5km radius' },
          { title: 'Donor Response Received', time: '11:34 AM', status: 'Matched', note: 'Donor verified by MYJPG health desk' }
        ],
        contactInfo: {
          phone: '03561-227282',
          address: 'District Sadar Hospital Campus, Hospital Road, Jalpaiguri'
        }
      },
      {
        notificationId: `wrk-${Date.now()}-6`,
        title: isBengali ? 'কর্মী ভেরিফিকেশন অনুমোদিত হয়েছে 🎉' : 'Worker Verification Approved! 🎉',
        message: isBengali
          ? 'অভিনন্দন! আপনার কর্মী প্রোফাইল MYJPG প্রশাসন দল কর্তৃক সফলভাবে যাচাই করা হয়েছে। আপনার প্রোফাইল এখন ডিরেক্টরিতে দৃশ্যমান।'
          : 'Congratulations! Your worker registration has been successfully verified by the MYJPG administrative team. Your professional profile is now listed in the Jalpaiguri Verified Workers Directory.',
        category: 'services',
        subcategory: 'Professional Credentialing',
        priority: 'normal',
        issuingAuthority: 'MYJPG Verification Board',
        department: 'Trade & Tradesperson Verification Unit',
        referenceId: 'WRK-VER-8821',
        currentStatus: isBengali ? 'অনুমোদিত' : 'Verified & Active',
        primaryAction: {
          label: isBengali ? 'আমার প্রোফাইল দেখুন' : 'View My Profile',
          actionType: 'workers'
        },
        timeline: [
          { title: 'KYC Documents Uploaded', time: 'Yesterday', status: 'Completed', note: 'Government ID & Trade credentials uploaded' },
          { title: 'Physical Verification', time: '10:00 AM', status: 'Approved', note: 'Reviewed by District Labor Inspector' },
          { title: 'Profile Published', time: '02:00 PM', status: 'Live', note: 'Available to all Jalpaiguri citizens' }
        ]
      },
      {
        notificationId: `sup-${Date.now()}-7`,
        title: isBengali ? 'MYJPG সাপোর্ট টিম উত্তর দিয়েছে' : 'MYJPG Support Replied (Ticket JPG-SUP-1024)',
        message: isBengali
          ? 'আপনার মার্কেটপ্লেস শপ রেজিস্ট্রেশন সম্পর্কিত টিকিট JPG-SUP-1024 এর সমাধান করা হয়েছে।'
          : 'Our support team has responded to your ticket JPG-SUP-1024 regarding your marketplace registration. Open the support centre to review the complete resolution.',
        category: 'support',
        subcategory: 'Helpdesk & Ticket',
        priority: 'normal',
        issuingAuthority: 'MYJPG Citizen Care Team',
        department: 'Support & Operations Desk',
        referenceId: 'JPG-SUP-1024',
        currentStatus: isBengali ? 'সমাধানকৃত' : 'Resolved',
        primaryAction: {
          label: isBengali ? 'উত্তর পড়ুন' : 'Read Response',
          actionType: 'home'
        },
        timeline: [
          { title: 'Ticket Created', time: '09:10 AM', status: 'Open', note: 'Inquiry regarding GST document verification' },
          { title: 'Agent Assigned', time: '09:25 AM', status: 'Under Review', note: 'Assigned to Senior Verification Specialist' },
          { title: 'Solution Dispatched', time: '11:05 AM', status: 'Resolved', note: 'Detailed guidance provided with direct upload link' }
        ]
      },
      {
        notificationId: `sec-${Date.now()}-8`,
        title: isBengali ? 'নতুন ডিভাইসে লগইন সনাক্ত হয়েছে' : 'Security Alert: New Device Sign-In',
        message: isBengali
          ? 'আপনার MYJPG অ্যাকাউন্টে জলপাইগুড়িতে একটি নতুন অ্যান্ড্রয়েড ডিভাইস থেকে লগইন করা হয়েছে। এটি আপনি না হলে তৎক্ষণাৎ অ্যাকাউন্ট সুরক্ষিত করুন।'
          : 'Your MYJPG account was accessed from a new Android device session in Jalpaiguri. If this was not you, please review your account security immediately.',
        category: 'security',
        subcategory: 'Account Authentication',
        priority: 'high',
        issuingAuthority: 'MYJPG Security Operations',
        department: 'Identity & Access Management',
        referenceId: 'SEC-LOG-9032',
        currentStatus: isBengali ? 'সতর্কতা' : 'Flagged Session',
        actionRequired: isBengali ? 'সেশন পর্যালোচনা করুন' : 'Verify active sessions',
        primaryAction: {
          label: isBengali ? 'অ্যাকাউন্ট চেক করুন' : 'Review Account',
          actionType: 'profile'
        },
        timeline: [
          { title: 'Session Initiated', time: '03:12 PM', status: 'Logged In', note: 'IP: 103.21.124.x (Jalpaiguri, WB)' },
          { title: 'Security Check Passed', time: '03:12 PM', status: 'Active', note: 'Authenticated via Google OAuth 2.0' }
        ]
      }
    ];

    for (const notif of sampleNotifications) {
      await createUserNotification(userId, notif);
    }
  } catch (err) {
    console.error('Error seeding detailed sample notifications:', err);
  }
}
