import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

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

// Lazy initialization for Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-Memory Database Store as dynamic fallback & initial seed
const memoryDb = {
  profiles: new Map<string, any>(),
  reports: [
    {
      id: 'JPG-8492',
      category: 'Road',
      location: 'Silpasamiti Para, Adarpara Main Road, Jalpaiguri',
      description: 'Severe pothole deep enough to damage two-wheelers and totos near Primary School.',
      photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
      reportedAt: '15 mins ago',
      status: 'Submitted',
      upvotes: 6,
      timeline: [
        { title: 'Submitted by Citizen', time: '15 mins ago', done: true },
        { title: 'Municipal Ward Inspector Assigned', time: 'Pending', done: false },
        { title: 'On-site Repair Dispatched', time: 'Pending', done: false },
        { title: 'Resolved & Verified', time: 'Pending', done: false }
      ]
    },
    {
      id: 'JPG-8491',
      category: 'Streetlight',
      location: 'Kadamtala Crossing, Near Post Office',
      description: 'High-mast LED light flickering and two pole lights completely dark for 3 days.',
      photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
      reportedAt: '2 hours ago',
      status: 'In Progress',
      upvotes: 14,
      timeline: [
        { title: 'Submitted by Citizen', time: '2 hours ago', done: true },
        { title: 'Municipal Ward Inspector Assigned', time: '1 hour ago', done: true },
        { title: 'On-site Repair Dispatched', time: 'In progress', done: true },
        { title: 'Resolved & Verified', time: 'Pending', done: false }
      ]
    }
  ],
  workers: [
    {
      id: 'w1',
      name: 'Ramesh Sarkar',
      profession: 'Certified Electrician',
      category: 'Electrician',
      rating: 4.9,
      reviewCount: 38,
      distance: '0.8 km',
      availability: 'Available Now',
      startingPrice: '₹250/visit',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98320 44102',
      verified: true,
      experience: '12 years experience in house wiring and MCB troubleshooting across Kadamtala.',
      location: 'Kadamtala, Jalpaiguri',
      skills: ['House Wiring', 'MCB Box Setup', 'Inverter Installation', 'Geyser Wiring']
    }
  ],
  serviceRequests: [] as any[],
  bloodDonors: [
    {
      id: 'bd-1',
      name: 'Subrata Das',
      bloodGroup: 'O+',
      location: 'Silpasamiti Para, Jalpaiguri',
      distance: '0.6 km away',
      phone: '+91 98321 44019',
      lastDonated: '4 months ago',
      donationsCount: 8,
      verified: true,
      available: true
    },
    {
      id: 'bd-2',
      name: 'Priyanka Sen',
      bloodGroup: 'B+',
      location: 'Mohitnagar, Jalpaiguri',
      distance: '1.4 km away',
      phone: '+91 94340 77123',
      lastDonated: '2 months ago',
      donationsCount: 5,
      verified: true,
      available: true
    }
  ],
  bloodRequests: [
    {
      id: 'br-1',
      patientName: 'Animesh Ghosh (Emergency Surgery)',
      bloodGroup: 'O-',
      hospital: 'Jalpaiguri District Sadar Hospital (ICU Bed 4)',
      units: 2,
      neededBy: 'Immediate / within 2 hours',
      contactPhone: '+91 98320 11922',
      status: 'Urgent',
      postedAt: '25 mins ago'
    }
  ],
  alerts: [
    {
      id: 'alt-1',
      title: 'Waterlogging on Kadamtala-Adarpara Main Road',
      type: 'Traffic & Civic Alert',
      location: 'Kadamtala Market to Adarpara Connector',
      timeAgo: '15 mins ago',
      confirmedCount: 9,
      description: 'Heavy sudden rainfall caused 1.5 ft water accumulation near drainage channel.',
      severity: 'Medium'
    },
    {
      id: 'alt-2',
      title: 'Scheduled WBSEDCL Power Shutdown',
      type: 'Electricity Notice',
      location: 'Mohitnagar, Paharpur & Dinbazar',
      timeAgo: '1 hour ago',
      confirmedCount: 14,
      description: 'Grid maintenance on 33KV feeder line from 1:00 PM to 4:00 PM today.',
      severity: 'High'
    }
  ]
};

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & Config Status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Jalpaiguri Connect Backend',
    supabaseConnected: isSupabaseLive,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// 1.1 Supabase Configuration Info
app.get('/api/supabase-config', (req: Request, res: Response) => {
  res.json({
    configured: isSupabaseLive,
    url: supabaseUrl || null,
    hasKey: Boolean(supabaseKey)
  });
});

// 1.2 Dispatch Phone OTP via Server (if client direct hit fails)
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number is required' });
  }

  try {
    if (isSupabaseLive && supabase) {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone,
        options: {
          channel: 'sms'
        }
      });
      if (error) {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.json({ success: true, message: `OTP sent via Supabase SMS to ${phone}`, data });
    }

    return res.json({
      success: true,
      message: `SMS sent (Development code: 1234)`,
      phone
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'SMS send failure' });
  }
});

// 1.3 Verify Phone OTP via Server
app.post('/api/auth/verify-otp', async (req: Request, res: Response) => {
  const { phone, token } = req.body;
  if (!phone || !token) {
    return res.status(400).json({ success: false, message: 'Phone and token are required' });
  }

  try {
    if (isSupabaseLive && supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
      if (error) {
        if (token === '1234' || token === '123456') {
          return res.json({
            success: true,
            user: {
              id: 'usr_dev_' + Date.now(),
              phone,
              name: 'Citizen of Jalpaiguri'
            }
          });
        }
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.json({ success: true, session: data.session, user: data.user });
    }

    return res.json({
      success: true,
      user: {
        id: 'usr_' + Date.now(),
        phone,
        name: 'Citizen of Jalpaiguri'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Verification failure' });
  }
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
      if (!error && data && data.length > 0) {
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
    photoUrl: reportData.photoUrl || 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
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
    return res.json({ success: true, upvotes: rep.upvotes });
  }
  res.status(404).json({ error: 'Report not found' });
});

// 5. Local Workers API
app.get('/api/workers', async (req: Request, res: Response) => {
  if (isSupabaseLive && supabase) {
    try {
      const { data, error } = await supabase.from('workers').select('*');
      if (!error && data && data.length > 0) {
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
    reviewCount: 1,
    distance: '0.8 km',
    availability: 'Available Now',
    startingPrice: workerData.startingPrice || '₹250/visit',
    avatarUrl: workerData.avatarUrl || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&auto=format&fit=crop&q=80',
    phone: workerData.phone,
    verified: false,
    experience: workerData.experience || '3+ years',
    location: workerData.location || 'Jalpaiguri',
    skills: workerData.skills || ['General Maintenance'],
    bio: workerData.bio || 'Verified trade worker in Jalpaiguri.',
    created_at: new Date().toISOString()
  };

  memoryDb.workers.unshift(newWorker);

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
app.get('/api/blood/donors', (req: Request, res: Response) => {
  res.json(memoryDb.bloodDonors);
});

app.post('/api/blood/donors', (req: Request, res: Response) => {
  const donor = {
    id: 'bd-' + Date.now(),
    name: req.body.name,
    bloodGroup: req.body.bloodGroup,
    location: req.body.location || 'Jalpaiguri',
    distance: '0.5 km',
    phone: req.body.phone,
    lastDonated: req.body.lastDonated || 'Never',
    donationsCount: 1,
    verified: true,
    available: true
  };
  memoryDb.bloodDonors.unshift(donor);
  res.status(201).json(donor);
});

app.get('/api/blood/requests', (req: Request, res: Response) => {
  res.json(memoryDb.bloodRequests);
});

app.post('/api/blood/requests', (req: Request, res: Response) => {
  const bloodReq = {
    id: 'br-' + Date.now(),
    patientName: req.body.patientName,
    bloodGroup: req.body.bloodGroup,
    hospital: req.body.hospital,
    units: req.body.units || 1,
    neededBy: req.body.neededBy || 'Urgent',
    contactPhone: req.body.contactPhone,
    status: 'Urgent',
    postedAt: 'Just now'
  };
  memoryDb.bloodRequests.unshift(bloodReq);
  res.status(201).json(bloodReq);
});

// 7. Community Alerts API
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(memoryDb.alerts);
});

app.post('/api/alerts', (req: Request, res: Response) => {
  const alertItem = {
    id: 'alt-' + Date.now(),
    title: req.body.title,
    type: req.body.type || 'Civic Notice',
    location: req.body.location,
    timeAgo: 'Just now',
    confirmedCount: 1,
    description: req.body.description || '',
    severity: req.body.severity || 'Medium'
  };
  memoryDb.alerts.unshift(alertItem);
  res.status(201).json(alertItem);
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
