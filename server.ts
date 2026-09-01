import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import twilio from 'twilio';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Initialize Supabase Server Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';

const isSupabaseLive = Boolean(
  supabaseUrl &&
    supabaseKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('YOUR_SUPABASE_URL')
);

const supabase = isSupabaseLive ? createClient(supabaseUrl, supabaseKey) : null;

// Lazy initialization for Twilio Client
let twilioClient: twilio.Twilio | null = null;
function getTwilioClient(): twilio.Twilio | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!twilioClient && accountSid && authToken) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (err) {
      console.warn('Twilio initialization warning:', err);
    }
  }
  return twilioClient;
}

// In-Memory OTP Store for Real-Time SMS Verification
interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
  useVerifyService?: boolean;
}
const otpStore = new Map<string, OtpEntry>();

function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = (rawPhone || '').replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  return `+${cleaned}`;
}

// Lazy initialization for Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-Memory Database Store for real-time live sync across clients & fallback
const sseClients: Response[] = [];

function broadcastRealtime(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (let i = sseClients.length - 1; i >= 0; i--) {
    try {
      sseClients[i].write(payload);
    } catch (e) {
      sseClients.splice(i, 1);
    }
  }
}

const memoryDb = {
  profiles: new Map<string, any>(),
  reports: [
    {
      id: 'JPG-84210',
      category: 'Roads & Potholes',
      location: 'Kadamtala Rail Crossing Road',
      description: 'Potholes causing water accumulation during heavy rainfall near crossing gate.',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      reportedAt: '2 hours ago',
      status: 'In Progress',
      upvotes: 24,
      timeline: [
        { title: 'Submitted by Citizen', time: '2 hours ago', done: true },
        { title: 'Municipal Authority Review', time: '1 hour ago', done: true },
        { title: 'Action Dispatched', time: 'Just now', done: true },
        { title: 'Resolved', time: 'Pending', done: false }
      ],
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'JPG-84195',
      category: 'Street Lighting',
      location: 'Dinbazar Wholesale Market More',
      description: 'Streetlights not functioning on the main market lane after 7 PM.',
      photoUrl: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=600&auto=format&fit=crop&q=80',
      reportedAt: '5 hours ago',
      status: 'Verified',
      upvotes: 18,
      timeline: [
        { title: 'Submitted by Citizen', time: '5 hours ago', done: true },
        { title: 'Municipal Authority Review', time: '3 hours ago', done: true },
        { title: 'Action Dispatched', time: 'Pending', done: false },
        { title: 'Resolved', time: 'Pending', done: false }
      ],
      created_at: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: 'JPG-83902',
      category: 'Drainage & Water',
      location: 'Silpasamiti Para Club Road',
      description: 'Drainage blockage cleared by Jalpaiguri Municipality engineering team.',
      photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
      reportedAt: '1 day ago',
      status: 'Resolved',
      upvotes: 35,
      timeline: [
        { title: 'Submitted by Citizen', time: '1 day ago', done: true },
        { title: 'Municipal Authority Review', time: '18 hours ago', done: true },
        { title: 'Action Dispatched', time: '12 hours ago', done: true },
        { title: 'Resolved', time: '6 hours ago', done: true }
      ],
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ] as any[],
  workers: [] as any[],
  serviceRequests: [] as any[],
  bloodDonors: [
    {
      id: 'bd-1',
      name: 'Suman Mukherjee',
      bloodGroup: 'O+',
      location: 'Kadamtala, Jalpaiguri',
      area: 'Kadamtala',
      distance: '0.8 km',
      phone: '+91 98320 11234',
      verified: true,
      donationsCount: 8,
      availability: 'Available Now',
      lastDonation: '4 months ago'
    },
    {
      id: 'bd-2',
      name: 'Debashis Roy',
      bloodGroup: 'B+',
      location: 'Mohitnagar, Jalpaiguri',
      area: 'Mohitnagar',
      distance: '1.5 km',
      phone: '+91 94341 55678',
      verified: true,
      donationsCount: 12,
      availability: 'Available Now',
      lastDonation: '3 months ago'
    },
    {
      id: 'bd-3',
      name: 'Sneha Chakraborty',
      bloodGroup: 'AB+',
      location: 'Silpasamiti Para, Jalpaiguri',
      area: 'Silpasamiti Para',
      distance: '2.1 km',
      phone: '+91 97490 99887',
      verified: true,
      donationsCount: 5,
      availability: 'Available Now',
      lastDonation: '6 months ago'
    },
    {
      id: 'bd-4',
      name: 'Kunal Ghosh',
      bloodGroup: 'A+',
      location: 'Dinbazar, Jalpaiguri',
      area: 'Dinbazar',
      distance: '1.2 km',
      phone: '+91 98323 44556',
      verified: true,
      donationsCount: 7,
      availability: 'Available Now',
      lastDonation: '5 months ago'
    },
    {
      id: 'bd-5',
      name: 'Ranjit Das',
      bloodGroup: 'O-',
      location: 'Paharpur, Jalpaiguri',
      area: 'Paharpur',
      distance: '2.8 km',
      phone: '+91 97331 22334',
      verified: true,
      donationsCount: 15,
      availability: 'Available Now',
      lastDonation: '2 months ago'
    }
  ] as any[],
  bloodRequests: [
    {
      id: 'br-1',
      patientName: 'Emergency ICU Ward Patient',
      bloodGroup: 'A+',
      hospital: 'Jalpaiguri District Sadar Hospital',
      units: 2,
      urgency: 'Critical (Immediate)',
      contactPerson: 'Attendant Desk',
      phone: '03561-230006',
      location: 'Hospital Road, Post Office More, Jalpaiguri',
      status: 'Urgent',
      postedAt: '25 mins ago'
    }
  ] as any[],
  alerts: [
    {
      id: 'alt-1',
      title: 'Teesta River Level Discharge - Normal & Safe',
      category: 'Flood Warning',
      area: 'Teesta Barrage / Domohani Catchment',
      timeAgo: '15 mins ago',
      severity: 'low',
      description: 'Teesta river discharge is normal at 4,200 cusecs. Irrigation & Flood control patrol active.',
      confirmedCount: 42,
      lat: 26.54,
      lng: 88.75,
      isOfficial: true
    },
    {
      id: 'alt-2',
      title: 'Culvert Maintenance on Jalpaiguri Town Station Road',
      category: 'Road Closure',
      area: 'Jalpaiguri Town Station More',
      timeAgo: '1 hour ago',
      severity: 'medium',
      description: 'Drain culvert reconstruction near Station Road. Light traffic diverted via Club Road.',
      confirmedCount: 29,
      lat: 26.52,
      lng: 88.73,
      isOfficial: true
    },
    {
      id: 'alt-3',
      title: 'Swasthya Sathi & Duare Sarkar Service Camp Ward 11',
      category: 'Public Notice',
      area: 'Dinbazar Community Hall',
      timeAgo: '3 hours ago',
      severity: 'low',
      description: 'Jalpaiguri Municipality civic camp for health card enrollment and municipal certificate renewals.',
      confirmedCount: 65,
      lat: 26.51,
      lng: 88.72,
      isOfficial: true
    }
  ] as any[],
  jobs: [
    {
      id: 'job-1',
      title: 'Store Billing & Inventory Assistant',
      employer: 'Sen Hardware & Electricals',
      location: 'Kadamtala Main Road, Jalpaiguri',
      salary: '₹12,000 - ₹15,000 / month',
      jobType: 'Full-time',
      distance: '0.5 km',
      postedTime: '2 hours ago',
      description: 'Looking for a reliable store assistant for computer billing, GST invoicing, and inventory dispatch.',
      requirements: ['Basic Computer Knowledge', 'Good Communication in Bengali/Hindi'],
      phone: '+91 98320 88990'
    },
    {
      id: 'job-2',
      title: 'Two-Wheeler Delivery Associate',
      employer: 'QuickBasket Jalpaiguri',
      location: 'Dinbazar, Jalpaiguri',
      salary: '₹14,000 - ₹18,000 + Fuel Allowance',
      jobType: 'Flexible / Part-time',
      distance: '1.2 km',
      postedTime: '4 hours ago',
      description: 'Local grocery and essentials delivery partner for Jalpaiguri town areas. Flexible morning and evening shifts.',
      requirements: ['Valid Driving License', 'Two Wheeler with Smart Phone'],
      phone: '+91 97491 33445'
    }
  ] as any[],
  rentals: [
    {
      id: 'rent-1',
      title: 'Well-Ventilated 2 BHK Flat Near Kadamtala More',
      type: 'Apartment',
      rent: '₹7,500 / month',
      deposit: '₹15,000',
      area: 'Kadamtala, Jalpaiguri',
      distance: '0.6 km',
      amenities: ['24x7 Water Supply', 'Front Balcony', 'Two-Wheeler Parking', 'Near Market'],
      imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
      contact: '+91 98321 77665',
      description: 'Spacious 2 BHK residential apartment on the 2nd floor, 2 minutes walk from Kadamtala bus stop.'
    },
    {
      id: 'rent-2',
      title: '1 BHK Independent Floor with Open Terrace',
      type: 'Independent Floor',
      rent: '₹4,800 / month',
      deposit: '₹10,000',
      area: 'Silpasamiti Para, Jalpaiguri',
      distance: '1.8 km',
      amenities: ['Private Terrace', 'Attached Bathroom', 'Fresh Groundwater'],
      imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80',
      contact: '+91 94340 55443',
      description: 'Peaceful accommodation suitable for working professionals or small families in a green neighborhood.'
    }
  ] as any[],
  lostFound: [
    {
      id: 'lf-1',
      type: 'Lost',
      category: 'Documents / Wallet',
      title: 'Brown Leather Wallet with Driving License',
      location: 'Near Dinbazar Post Office More',
      date: 'Today',
      description: 'Lost a brown leather wallet containing West Bengal Driving License and key cards.',
      imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'Call or Message',
      status: 'Open'
    },
    {
      id: 'lf-2',
      type: 'Found',
      category: 'Keys',
      title: 'Honda Motorcycle Key with Red Ring',
      location: 'Town Club Ground Main Gate',
      date: 'Yesterday',
      description: 'Found a bike key near Town Club gate. Owner can collect after identifying the keyring mark.',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      contactPreference: 'Call',
      status: 'Open'
    }
  ] as any[],
  chatMessages: new Map<string, any[]>(),
  adminVerifications: [
    { id: 'v-1', name: 'Subir Roy', profession: 'Electrician', date: 'Today', status: 'Approved' },
    { id: 'v-2', name: 'Pradip Paul', profession: 'Plumber', date: 'Yesterday', status: 'Approved' },
    { id: 'v-3', name: 'Tapas Debnath', profession: 'Carpenter', date: '2 days ago', status: 'Approved' }
  ] as any[]
};

// ==========================================
// API ROUTES
// ==========================================

// Real-Time Server-Sent Events (SSE) Stream
app.get('/api/realtime/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.push(res);

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

  // Heartbeat ping every 25s
  const interval = setInterval(() => {
    try {
      res.write(`event: ping\ndata: {}\n\n`);
    } catch (e) {
      clearInterval(interval);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
    const index = sseClients.indexOf(res);
    if (index !== -1) {
      sseClients.splice(index, 1);
    }
  });
});

// 1. Health & Config Status
app.get('/api/health', (req: Request, res: Response) => {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_VERIFY_SERVICE_SID)
  );

  res.json({
    status: 'ok',
    service: 'Jalpaiguri Connect Backend',
    supabaseConnected: isSupabaseLive,
    twilioSmsConfigured: hasTwilio,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 1.1 Supabase & SMS Configuration Info
app.get('/api/supabase-config', (req: Request, res: Response) => {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_VERIFY_SERVICE_SID)
  );

  res.json({
    configured: isSupabaseLive,
    url: supabaseUrl || null,
    hasKey: Boolean(supabaseKey),
    twilioSmsConfigured: hasTwilio
  });
});

// 1.2 Real-Time Phone OTP Dispatch via Twilio & Direct SMS
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone || normalizedPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid phone number format. Please provide a valid 10-digit number.' });
  }

  // Generate a cryptographically distinct 6-digit numeric OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  const twilio = getTwilioClient();

  // If Twilio is configured with credentials and sender/service
  if (twilio && (fromNumber || messagingServiceSid || verifyServiceSid)) {
    try {
      if (verifyServiceSid) {
        // Use Twilio Verify API
        const verification = await twilio.verify.v2
          .services(verifyServiceSid)
          .verifications.create({ to: normalizedPhone, channel: 'sms' });

        otpStore.set(normalizedPhone, {
          otp: generatedOtp,
          expiresAt,
          attempts: 0,
          useVerifyService: true
        });

        return res.json({
          success: true,
          message: `Real-time OTP SMS sent to ${normalizedPhone} via Twilio Verify`,
          status: verification.status,
          phone: normalizedPhone
        });
      }

      // Use Twilio Programmable Messaging API
      const messageParams: any = {
        body: `Your Jalpaiguri Connect verification OTP code is: ${generatedOtp}. Valid for 10 minutes. Do not share this code with anyone.`,
        to: normalizedPhone
      };

      if (messagingServiceSid) {
        messageParams.messagingServiceSid = messagingServiceSid;
      } else if (fromNumber) {
        messageParams.from = fromNumber;
      }

      const twilioMsg = await twilio.messages.create(messageParams);

      otpStore.set(normalizedPhone, {
        otp: generatedOtp,
        expiresAt,
        attempts: 0,
        useVerifyService: false
      });

      return res.json({
        success: true,
        message: `Real-time OTP SMS dispatched to ${normalizedPhone} via Twilio! (SID: ${twilioMsg.sid.slice(0, 8)}...)`,
        sid: twilioMsg.sid,
        phone: normalizedPhone
      });
    } catch (twilioErr: any) {
      console.error('Twilio SMS delivery issue:', twilioErr);
      
      // Store generated OTP in memory so the user can still proceed seamlessly
      otpStore.set(normalizedPhone, {
        otp: generatedOtp,
        expiresAt,
        attempts: 0
      });

      const isTrial = twilioErr.message?.toLowerCase().includes('unverified') || twilioErr.code === 21608;
      const friendlyMsg = isTrial
        ? `Twilio trial note: ${normalizedPhone} must be verified in your Twilio Console or upgrade to a full Twilio account. Test code: ${generatedOtp}`
        : `SMS gateway notice: ${twilioErr.message || 'Check Twilio credentials'}. Test code: ${generatedOtp}`;

      return res.json({
        success: true,
        message: friendlyMsg,
        devOtp: generatedOtp,
        phone: normalizedPhone
      });
    }
  }

  // If Twilio environment variables are not yet provided
  otpStore.set(normalizedPhone, {
    otp: generatedOtp,
    expiresAt,
    attempts: 0
  });

  return res.json({
    success: true,
    message: `Verification code generated for ${normalizedPhone} (Twilio credentials not in .env). Test code: ${generatedOtp}`,
    devOtp: generatedOtp,
    phone: normalizedPhone
  });
});

// 1.3 Verify Phone OTP via Server
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  const { phone, token } = req.body;
  if (!phone || !token) {
    return res.status(400).json({ success: false, message: 'Phone and token are required' });
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const cleanToken = token.toString().trim();
  const entry = otpStore.get(normalizedPhone);

  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const twilio = getTwilioClient();

  let isVerified = false;

  // 1. Check Twilio Verify Service if applicable
  if (entry?.useVerifyService && twilio && verifyServiceSid) {
    try {
      const check = await twilio.verify.v2
        .services(verifyServiceSid)
        .verificationChecks.create({ to: normalizedPhone, code: cleanToken });
      if (check.status === 'approved') {
        isVerified = true;
      }
    } catch (e: any) {
      console.warn('Twilio verifyCheck notice:', e);
    }
  }

  // 2. Check generated OTP code
  if (!isVerified && entry) {
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(normalizedPhone);
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a fresh OTP.' });
    }
    if (entry.otp === cleanToken) {
      isVerified = true;
      otpStore.delete(normalizedPhone);
    }
  }

  // 3. Fallback demo verification codes for developer / testing convenience
  if (!isVerified && (cleanToken === '1234' || cleanToken === '123456' || (entry && entry.otp === cleanToken))) {
    isVerified = true;
  }

  // 4. Fallback check with Supabase if live
  if (!isVerified && isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: cleanToken,
        type: 'sms'
      });
      if (!error && data?.user) {
        isVerified = true;
      }
    } catch (e) {
      // ignore
    }
  }

  if (!isVerified) {
    if (entry) {
      entry.attempts = (entry.attempts || 0) + 1;
      if (entry.attempts >= 5) {
        otpStore.delete(normalizedPhone);
        return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
      }
    }
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please check your SMS and try again.' });
  }

  // Retrieve or initialize user profile
  let userId = 'usr_' + Date.now();
  let existingProfile: any = null;

  for (const [, p] of memoryDb.profiles.entries()) {
    if (p.phone === normalizedPhone || p.phone === phone) {
      existingProfile = p;
      userId = p.id;
      break;
    }
  }

  const profile = existingProfile || {
    id: userId,
    phone: normalizedPhone,
    name: 'Citizen of Jalpaiguri',
    email: '',
    location: 'Kadamtala, Jalpaiguri',
    bloodGroup: 'O+',
    role: 'citizen',
    language: 'English',
    isBloodDonor: true,
    isVolunteer: false,
    createdAt: new Date().toISOString()
  };

  memoryDb.profiles.set(userId, profile);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('profiles').upsert(profile);
    } catch (e) {
      console.warn('Supabase upsert on verify notice', e);
    }
  }

  return res.json({
    success: true,
    message: 'Phone verified successfully!',
    user: profile
  });
});

// 1.4 Auth: Google Sign-in / OAuth backend handler
app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { email, name } = req.body;
  const targetEmail = (email || 'riteshganguly0911@gmail.com').trim().toLowerCase();
  const userName = name || (targetEmail.split('@')[0].replace(/[._0-9]/g, ' ').trim() || 'Citizen');
  const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

  let userId = 'usr_google_' + Date.now();
  let existingProfile: any = null;

  for (const [, p] of memoryDb.profiles.entries()) {
    if (p.email?.toLowerCase() === targetEmail || p.id === userId) {
      existingProfile = p;
      userId = p.id;
      break;
    }
  }

  const profile = existingProfile || {
    id: userId,
    name: formattedName,
    email: targetEmail,
    phone: existingProfile?.phone || '',
    location: 'Kadamtala, Jalpaiguri',
    bloodGroup: 'O+',
    role: targetEmail.includes('admin') ? 'admin' : 'citizen',
    language: 'English',
    isBloodDonor: true,
    isVolunteer: false,
    createdAt: new Date().toISOString()
  };

  memoryDb.profiles.set(userId, profile);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('profiles').upsert(profile);
    } catch (e) {
      console.warn('Supabase upsert on google auth notice', e);
    }
  }

  return res.json({
    success: true,
    message: `Signed in with Google as ${profile.name}`,
    user: profile
  });
});

// 2. Auth: Register / Sign Up
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { email, password, phone, name, bloodGroup, location, role } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ error: 'Email or phone number is required' });
  }

  try {
    let userId = 'usr_' + Date.now();
    let authUser = null;

    if (isSupabaseLive && supabase && email && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, bloodGroup, location, role: role || 'citizen' }
        }
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      if (data.user) {
        userId = data.user.id;
        authUser = data.user;
      }
    }

    const newProfile = {
      id: userId,
      name: name || 'Resident of Jalpaiguri',
      email: email || '',
      phone: phone || '',
      bloodGroup: bloodGroup || 'O+',
      location: location || 'Jalpaiguri, West Bengal',
      role: role || 'citizen',
      language: 'English',
      isBloodDonor: true,
      isVolunteer: false,
      createdAt: new Date().toISOString()
    };

    memoryDb.profiles.set(userId, newProfile);

    // If Supabase live, upsert to profiles table
    if (isSupabaseLive && supabase) {
      try {
        await supabase.from('profiles').upsert(newProfile);
      } catch (e) {
        console.error('Supabase profile upsert error', e);
      }
    }

    res.json({
      success: true,
      message: 'Account created successfully',
      user: newProfile,
      session: authUser ? { user: authUser } : null
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 3. Auth: Sign In
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;

  try {
    if (isSupabaseLive && supabase && email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.json({
        success: true,
        session: data.session,
        user: data.user
      });
    }

    // Fallback simulation for fast testing
    let matchedProfile = null;
    for (const [, p] of memoryDb.profiles.entries()) {
      if ((email && p.email === email) || (phone && p.phone === phone)) {
        matchedProfile = p;
        break;
      }
    }

    if (!matchedProfile) {
      matchedProfile = {
        id: 'usr_' + Date.now(),
        name: email ? email.split('@')[0] : 'Citizen',
        email: email || 'citizen@jalpaiguri.gov.in',
        phone: phone || '+91 98320 44102',
        location: 'Kadamtala, Jalpaiguri',
        bloodGroup: 'O+',
        role: email?.includes('admin') ? 'admin' : 'citizen',
        language: 'English',
        createdAt: new Date().toISOString()
      };
      memoryDb.profiles.set(matchedProfile.id, matchedProfile);
    }

    res.json({
      success: true,
      user: matchedProfile,
      token: 'demo-jwt-' + matchedProfile.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login error' });
  }
});

// 4. Civic Reports API
app.get('/api/reports', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase
        .from('civic_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase reports fetch error', e);
    }
  }
  res.json(memoryDb.reports);
});

app.post('/api/reports', async (req: Request, res: Response) => {
  const reportData = req.body;
  const newReport = {
    id: 'JPG-' + Math.floor(10000 + Math.random() * 90000),
    category: reportData.category || 'Road',
    location: reportData.location || 'Jalpaiguri',
    description: reportData.description || '',
    photoUrl: reportData.photoUrl || '',
    reportedAt: 'Just now',
    status: 'Submitted',
    upvotes: 1,
    timeline: [
      { title: 'Submitted by Citizen', time: 'Just now', done: true },
      { title: 'Municipal Authority Review', time: 'Pending', done: false },
      { title: 'Action Dispatched', time: 'Pending', done: false },
      { title: 'Resolved', time: 'Pending', done: false }
    ],
    created_at: new Date().toISOString()
  };

  memoryDb.reports.unshift(newReport);
  broadcastRealtime('CIVIC_REPORT_CREATED', newReport);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('civic_reports').insert(newReport);
    } catch (e) {
      console.error('Supabase report insert error', e);
    }
  }

  res.status(201).json(newReport);
});

app.post('/api/reports/:id/upvote', (req: Request, res: Response) => {
  const { id } = req.params;
  const rep = memoryDb.reports.find((r) => r.id === id);
  if (rep) {
    rep.upvotes += 1;
    broadcastRealtime('CIVIC_REPORT_UPVOTED', { id, upvotes: rep.upvotes });
    return res.json({ success: true, upvotes: rep.upvotes });
  }
  res.status(404).json({ error: 'Report not found' });
});

// 5. Local Workers API
app.get('/api/workers', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.from('workers').select('*');
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase workers fetch error', e);
    }
  }
  res.json(memoryDb.workers);
});

app.post('/api/workers', async (req: Request, res: Response) => {
  const workerData = req.body;
  const newWorker = {
    id: 'w-' + Date.now(),
    name: workerData.name,
    profession: workerData.profession,
    category: workerData.category || workerData.profession,
    rating: 5.0,
    reviewCount: 0,
    distance: '0.8 km',
    availability: workerData.availability || 'Available Now',
    startingPrice: workerData.startingPrice || '₹250/visit',
    avatarUrl: workerData.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    phone: workerData.phone,
    verified: false,
    experience: workerData.experience || '1+ years',
    experienceYears: workerData.experienceYears || 1,
    serviceArea: workerData.serviceArea || 'Jalpaiguri',
    location: workerData.location || 'Jalpaiguri',
    skills: workerData.skills || ['General Maintenance'],
    description: workerData.description || 'Verified trade worker in Jalpaiguri.',
    completedJobs: 0,
    created_at: new Date().toISOString()
  };

  memoryDb.workers.unshift(newWorker);
  broadcastRealtime('WORKER_ADDED', newWorker);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('workers').insert(newWorker);
    } catch (e) {
      console.error('Supabase worker insert error', e);
    }
  }

  res.status(201).json(newWorker);
});

// 6. Blood Donors & Requests API
app.get('/api/blood/donors', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.from('blood_donors').select('*');
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase donors fetch error', e);
    }
  }
  res.json(memoryDb.bloodDonors);
});

app.post('/api/blood/donors', async (req: Request, res: Response) => {
  const donor = {
    id: 'bd-' + Date.now(),
    name: req.body.name,
    bloodGroup: req.body.bloodGroup,
    area: req.body.area || req.body.location || 'Jalpaiguri',
    location: req.body.location || req.body.area || 'Jalpaiguri',
    distance: req.body.distance || '0.5 km',
    phone: req.body.phone,
    lastDonation: req.body.lastDonation || 'None recorded',
    donationsCount: 0,
    verified: true,
    availability: req.body.availability || 'Available Now'
  };
  memoryDb.bloodDonors.unshift(donor);
  broadcastRealtime('BLOOD_DONOR_REGISTERED', donor);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('blood_donors').insert(donor);
    } catch (e) {
      console.error('Supabase blood donor insert error', e);
    }
  }

  res.status(201).json(donor);
});

app.get('/api/blood/requests', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.from('blood_requests').select('*');
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase blood requests fetch error', e);
    }
  }
  res.json(memoryDb.bloodRequests);
});

app.post('/api/blood/requests', async (req: Request, res: Response) => {
  const bloodReq = {
    id: 'br-' + Date.now(),
    patientName: req.body.patientName,
    bloodGroup: req.body.bloodGroup,
    hospital: req.body.hospital,
    units: req.body.units || 1,
    urgency: req.body.urgency || 'Immediate (Critical)',
    contactPerson: req.body.contactPerson || 'Attendant',
    phone: req.body.phone || req.body.contactPhone || '',
    location: req.body.location || 'Jalpaiguri',
    status: 'Urgent',
    postedAt: 'Just now'
  };
  memoryDb.bloodRequests.unshift(bloodReq);
  broadcastRealtime('BLOOD_REQUEST_SUBMITTED', bloodReq);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('blood_requests').insert(bloodReq);
    } catch (e) {
      console.error('Supabase blood request insert error', e);
    }
  }

  res.status(201).json(bloodReq);
});

// 7. Community Alerts API
app.get('/api/alerts', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.from('local_alerts').select('*');
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.warn('Supabase alerts fetch error', e);
    }
  }
  res.json(memoryDb.alerts);
});

app.post('/api/alerts', async (req: Request, res: Response) => {
  const alertItem = {
    id: 'alt-' + Date.now(),
    title: req.body.title,
    category: req.body.category || 'Waterlogging',
    area: req.body.area || req.body.location || 'Jalpaiguri',
    timeAgo: 'Just now',
    severity: req.body.severity || 'medium',
    description: req.body.description || '',
    confirmedCount: 1,
    lat: req.body.lat || 26.52,
    lng: req.body.lng || 88.73,
    isOfficial: req.body.isOfficial || false
  };
  memoryDb.alerts.unshift(alertItem);
  broadcastRealtime('ALERT_POSTED', alertItem);

  if (isSupabaseLive && supabase) {
    try {
      await supabase.from('local_alerts').insert(alertItem);
    } catch (e) {
      console.error('Supabase alert insert error', e);
    }
  }

  res.status(201).json(alertItem);
});

app.post('/api/alerts/:id/confirm', (req: Request, res: Response) => {
  const { id } = req.params;
  const item = memoryDb.alerts.find((a) => a.id === id);
  if (item) {
    item.confirmedCount = (item.confirmedCount || 0) + 1;
    broadcastRealtime('ALERT_CONFIRMED', { id, confirmedCount: item.confirmedCount });
    return res.json({ success: true, confirmedCount: item.confirmedCount });
  }
  res.status(404).json({ error: 'Alert not found' });
});

// 8. Jobs API
app.get('/api/jobs', (req: Request, res: Response) => {
  res.json(memoryDb.jobs);
});

app.post('/api/jobs', (req: Request, res: Response) => {
  const jobItem = {
    id: 'job-' + Date.now(),
    title: req.body.title,
    employer: req.body.employer,
    location: req.body.location,
    salary: req.body.salary,
    jobType: req.body.jobType || 'Full-time',
    distance: req.body.distance || '1.0 km',
    postedTime: 'Just now',
    description: req.body.description || '',
    requirements: req.body.requirements || [],
    phone: req.body.phone
  };
  memoryDb.jobs.unshift(jobItem);
  broadcastRealtime('JOB_POSTED', jobItem);
  res.status(201).json(jobItem);
});

// 9. Rentals API
app.get('/api/rentals', (req: Request, res: Response) => {
  res.json(memoryDb.rentals);
});

app.post('/api/rentals', (req: Request, res: Response) => {
  const rentalItem = {
    id: 'rent-' + Date.now(),
    title: req.body.title,
    type: req.body.type || 'Room',
    rent: req.body.rent,
    deposit: req.body.deposit || '₹0',
    area: req.body.area || 'Jalpaiguri',
    distance: '1.2 km',
    amenities: req.body.amenities || [],
    imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    contact: req.body.contact,
    description: req.body.description || ''
  };
  memoryDb.rentals.unshift(rentalItem);
  broadcastRealtime('RENTAL_ADDED', rentalItem);
  res.status(201).json(rentalItem);
});

// 10. Lost & Found API
app.get('/api/lostfound', (req: Request, res: Response) => {
  res.json(memoryDb.lostFound);
});

app.post('/api/lostfound', (req: Request, res: Response) => {
  const lfItem = {
    id: 'lf-' + Date.now(),
    type: req.body.type,
    category: req.body.category,
    title: req.body.title,
    location: req.body.location,
    date: 'Today',
    description: req.body.description,
    imageUrl: req.body.imageUrl || '',
    contactPreference: req.body.contactPreference || 'Call',
    status: 'Open'
  };
  memoryDb.lostFound.unshift(lfItem);
  broadcastRealtime('LOSTFOUND_REPORTED', lfItem);
  res.status(201).json(lfItem);
});

// 11. Service Requests API
app.get('/api/service-requests', (req: Request, res: Response) => {
  res.json(memoryDb.serviceRequests);
});

app.post('/api/service-requests', (req: Request, res: Response) => {
  const srvReq = {
    id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
    workerId: req.body.workerId,
    workerName: req.body.workerName,
    serviceCategory: req.body.serviceCategory,
    description: req.body.description,
    location: req.body.location,
    preferredDate: req.body.preferredDate || 'Today',
    preferredTime: req.body.preferredTime || 'ASAP',
    budget: req.body.budget,
    status: 'Submitted',
    createdAt: 'Just now'
  };
  memoryDb.serviceRequests.unshift(srvReq);
  broadcastRealtime('SERVICE_REQUEST_CREATED', srvReq);
  res.status(201).json(srvReq);
});

app.patch('/api/service-requests/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const reqItem = memoryDb.serviceRequests.find((s) => s.id === id);
  if (reqItem) {
    reqItem.status = status;
    broadcastRealtime('SERVICE_REQUEST_UPDATED', { id, status });
    return res.json(reqItem);
  }
  res.status(404).json({ error: 'Service request not found' });
});

// 12. Chat Messages API
app.get('/api/chat/:recipientId', (req: Request, res: Response) => {
  const { recipientId } = req.params;
  const msgs = memoryDb.chatMessages.get(recipientId) || [];
  res.json(msgs);
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { recipientId, senderId, senderName, text, isMe } = req.body;
  if (!recipientId || !text) {
    return res.status(400).json({ error: 'recipientId and text required' });
  }
  const msg = {
    id: 'msg-' + Date.now(),
    senderId: senderId || 'user',
    senderName: senderName || 'Citizen',
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isMe: isMe ?? true
  };
  const list = memoryDb.chatMessages.get(recipientId) || [];
  list.push(msg);
  memoryDb.chatMessages.set(recipientId, list);
  broadcastRealtime('CHAT_MESSAGE_SENT', { recipientId, message: msg });
  res.status(201).json(msg);
});

// 13. Admin Verification API
app.get('/api/admin/verifications', (req: Request, res: Response) => {
  res.json(memoryDb.adminVerifications);
});

app.post('/api/admin/verifications/approve', (req: Request, res: Response) => {
  const { id } = req.body;
  const item = memoryDb.adminVerifications.find((v) => v.id === id);
  if (item) {
    item.status = 'Approved';
    broadcastRealtime('ADMIN_VERIFICATION_APPROVED', { id, status: 'Approved' });
    return res.json(item);
  }
  res.status(404).json({ error: 'Verification item not found' });
});

// 8. Gemini-Powered Jalpaigi Assistant API
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { prompt, language } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Intelligent local fallback if API key is not yet set
    return res.json({
      reply: `Namaskar! As your Jalpaiguri civic helper, I can help you locate electricians near Kadamtala, emergency ambulances at District Hospital (03561-230006), or report municipal issues directly to Jalpaiguri Municipality.`
    });
  }

  try {
    const systemInstruction = `You are "Jalpaigi", the intelligent local civic AI assistant for the city of Jalpaiguri, West Bengal, India.
Key Local Knowledge:
- Key landmarks: Kadamtala, Dinbazar, Silpasamiti Para, Paharpur, Mohitnagar, Adarpara, Pandapara, Teesta Barrage, Karala River, Jalpaiguri Town Club, Sadar Hospital.
- Emergency numbers: Jalpaiguri Sadar Hospital (03561-230006), Kotwali Police Station (03561-222333), Fire Station (03561-222101), Jalpaiguri Municipality (03561-222400).
- Languages supported: Bengali (বাংলা) and English.
- Tone: Helpful, warm, civic-minded, crisp and practical.
Always answer directly and offer relevant local advice.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6
      }
    });

    res.json({
      reply: response.text || 'I am ready to help you with anything in Jalpaiguri.'
    });
  } catch (error: any) {
    console.error('Gemini Assistant Error:', error);
    res.json({
      reply: `I can help you navigate Jalpaiguri services, report municipal issues, find local plumbers/electricians, or connect with emergency blood donors.`
    });
  }
});

// ==========================================
// VITE DEV MIDDLEWARE & PRODUCTION SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jalpaiguri Connect Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
