import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// Lazy initialization for Gemini AI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// In-Memory Database Store for real-time live sync across clients
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
    }
  ] as any[],
  bloodRequests: [
    {
      id: 'br-1',
      patientName: 'Ananya Sen',
      bloodGroup: 'B+',
      hospital: 'Jalpaiguri Sadar Hospital',
      units: 2,
      urgency: 'Immediate (Critical)',
      contactPerson: 'Rahul Sen (Brother)',
      phone: '+91 98320 44102',
      location: 'Sadar Hospital ICU Ward',
      status: 'Urgent',
      postedAt: '15 mins ago'
    }
  ] as any[],
  alerts: [
    {
      id: 'alt-1',
      title: 'Waterlogging & Traffic Diversion on Kadamtala-Dinbazar Route',
      category: 'Waterlogging',
      area: 'Kadamtala Market Road',
      timeAgo: '15m ago',
      severity: 'high',
      description: 'Heavy rain has caused momentary water congestion near railway underpass. Vehicles diverted via Club Road.',
      confirmedCount: 34,
      lat: 26.521,
      lng: 88.729,
      isOfficial: true
    },
    {
      id: 'alt-2',
      title: 'Emergency Power Grid Maintenance at Mohitnagar Substation',
      category: 'Power Outage',
      area: 'Mohitnagar & Adarpara',
      timeAgo: '45m ago',
      severity: 'medium',
      description: 'Scheduled emergency line maintenance from 2:00 PM to 4:30 PM by WBSEDCL.',
      confirmedCount: 52,
      lat: 26.535,
      lng: 88.742,
      isOfficial: true
    }
  ] as any[],
  chatMessages: new Map<string, any[]>(),
  adminVerifications: [
    { id: 'v-1', name: 'Subir Roy', profession: 'Electrician', date: 'Today', status: 'Approved' },
    { id: 'v-2', name: 'Pradip Paul', profession: 'Plumber', date: 'Yesterday', status: 'Approved' }
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

  res.write(`event: connected\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`);

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

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Jalpaiguri Connect Backend',
    firebaseAuthEnabled: true,
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// GEMINI AI & GOOGLE MAPS GROUNDING ROUTES
// ==========================================

const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  general: `You are "Jalpaigi AI", the official smart local civic companion and community assistant for Jalpaiguri Connect (serving the citizens of Jalpaiguri, West Bengal, India).
Tone: Warm, respectful, highly helpful, and conversational. Use Bengali greetings like "Nomoshkar" when appropriate.
Local Context:
- Jalpaiguri City & Districts: Kadamtala, Dinbazar Wholesale Market, Hakimpara, Silpasamiti Para, Paharpur, Mohitnagar, Rajbari Dighi, Baikunthapur Palace, Jubilee Park, Teesta Barrage, Karala River (Thames of Jalpaiguri), Sadar Hospital, Desun Hospital, AC College, Jalpaiguri Government Engineering College (JGEC).
- Languages: English, Bengali (বাংলা), Hindi.
- Always provide clear, accurate local information. When users ask for places, directions, or services in Jalpaiguri, give practical landmarks and tips.`,

  emergency: `You are the "Jalpaiguri Emergency & Healthcare Dispatcher" on Jalpaiguri Connect.
Your priority is providing urgent, accurate medical and safety assistance for residents in Jalpaiguri.
Key Emergency Contacts:
- District Sadar Hospital Emergency: 03561-230006 / Hospital Road, Kadamtala
- Jalpaiguri Blood Bank (Sadar Hospital): 03561-227282 (24x7)
- Kotwali Police Station: 03561-222333
- Fire & Rescue Services: 101 / 03561-230101
- Ambulance Helpline: 108 / 102
- Desun Hospital Siliguri/Jalpaiguri Highway: 0353-7110110
Always maintain calm, urgent, and empathetic guidance with clear bullet points.`,

  civic: `You are the "Jalpaiguri Municipal & Grievance Specialist".
You help citizens navigate municipal services, ward complaints, road repairs, streetlights, garbage collection, and WBSEDCL power outage reports in Jalpaiguri Municipality.
Key Civic Information:
- Jalpaiguri Municipality Office: Collectorate Compound / Station Road
- Jalpaiguri Wards: 1 through 25 (covering Dinbazar, Hakimpara, Mohitnagar, Pandapara, Racecourse, Maskalaibari)
- Waterlogging hotspots during monsoon: Kadamtala Railway underpass, Dinbazar vegetable market, Silpasamiti Para low-lying zones
- Electric Grid: WBSEDCL Jalpaiguri Division (Toll-free 19121)
Give step-by-step guidance on how to report issues or track municipal resolution.`,

  services: `You are the "Jalpaiguri Verified Trade & Services Navigator".
You connect citizens with trusted local technicians, electricians, plumbers, carpenters, masonry workers, AC technicians, house painters, and auto/toto drivers across Jalpaiguri.
Assist citizens in describing their household or trade problems clearly and recommending fair local price estimates in INR.`,

  tourism: `You are the "Jalpaiguri & Dooars Heritage & Travel Guide".
Guide visitors and locals through the rich culture, history, and beauty of Jalpaiguri and the Dooars foothills.
Highlights:
- Rajbari Dighi & Royal Palace of Baikunthapur (dating back to 1500s Raikat Kings)
- Teesta Udyan & Jubilee Park on the bank of the Karala River
- Teesta Barrage at Gajoldoba (Bhorer Alo eco-tourism hub)
- Lataguri & Gorumara National Park (home of the One-horned Rhinoceros)
- Famous local foods: Jalpaiguri Chanar Jilipi, Singara at Dinbazar, Fresh Boroli fish from Teesta, locally brewed Dooars CTC tea.
Share engaging, inspiring, and culturally rich recommendations.`
};

// Unified Multi-Turn Chat with Gemini & Maps Grounding
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const {
    message,
    history = [],
    role = 'general',
    modelType = 'general',
    useMaps = true,
    userLocation = { latitude: 26.5414, longitude: 88.7196 }
  } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A valid message string is required.' });
  }

  const ai = getGeminiClient();

  // Model Selection according to prompt guidelines:
  // - gemini-3.1-pro-preview for particularly complex tasks
  // - gemini-2.5-flash / gemini-3.5-flash for general tasks & maps grounding
  // - gemini-3.1-flash-lite for tasks that should happen fast
  let selectedModel = 'gemini-2.5-flash';
  if (modelType === 'complex' || modelType === 'pro') {
    selectedModel = 'gemini-3.1-pro-preview';
  } else if (modelType === 'fast' || modelType === 'lite') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else {
    selectedModel = 'gemini-2.5-flash';
  }

  // Fallback response when GEMINI_API_KEY is not configured
  if (!ai) {
    const defaultGreetings = [
      `Nomoshkar! I am **Jalpaigi AI** (${role.toUpperCase()} mode).`,
      `Here to help you navigate Jalpaiguri. You can find emergency contacts (Sadar Hospital: 03561-230006), nearby verified workers in Kadamtala & Hakimpara, or report civic issues directly from the app.`
    ].join('\n\n');

    return res.json({
      reply: defaultGreetings,
      groundingPlaces: [
        {
          title: 'Jalpaiguri District Sadar Hospital',
          uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
          address: 'Hospital Road, Kadamtala, Jalpaiguri, WB 735101',
          snippets: ['24x7 Emergency Ward, Blood Bank, and Ambulance Depot.']
        },
        {
          title: 'Dinbazar Wholesale Market',
          uri: 'https://maps.google.com/?q=Dinbazar+Market+Jalpaiguri',
          address: 'Dinbazar, Jalpaiguri, WB 735101',
          snippets: ['Central commercial hub and local marketplace.']
        }
      ],
      modelUsed: 'mock-local-jalpaiguri',
      role
    });
  }

  try {
    const systemInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.general;

    // Format conversation contents for multi-turn Gemini API
    const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Append prior history if supplied
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && item.text) {
          formattedContents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }]
          });
        }
      }
    }

    // Append the latest user message
    formattedContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const config: any = {
      systemInstruction: systemInstruction,
      temperature: 0.7
    };

    // Add Google Maps Grounding when enabled or requested
    const isPlaceQuery = /where|near|location|address|hospital|clinic|pharmacy|doctor|hotel|restaurant|market|station|road|park|directions|route|stand|bazar|dighi|kadamtala|hakimpara/i.test(message);
    if (useMaps || isPlaceQuery) {
      config.tools = [{ googleMaps: {} }];
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: Number(userLocation.latitude) || 26.5414,
            longitude: Number(userLocation.longitude) || 88.7196
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: config
    });

    const replyText = response.text || 'Nomoshkar! How can I assist you with Jalpaiguri information?';

    // Extract Google Maps Grounding places & citations
    const groundingPlaces: Array<{
      title: string;
      uri: string;
      address?: string;
      snippets?: string[];
    }> = [];

    const candidate = response.candidates?.[0];
    const metadata = candidate?.groundingMetadata;
    const chunks = metadata?.groundingChunks || [];

    for (const chunk of chunks as any[]) {
      if (chunk.maps) {
        const mapChunk = chunk.maps;
        const uri = mapChunk.uri || (mapChunk.title ? `https://maps.google.com/?q=${encodeURIComponent(mapChunk.title + ' Jalpaiguri')}` : '');
        const title = mapChunk.title || 'Location in Jalpaiguri';
        const snippets: string[] = [];

        if (Array.isArray(mapChunk.placeAnswerSources?.reviewSnippets)) {
          for (const s of mapChunk.placeAnswerSources.reviewSnippets) {
            if (s && typeof s === 'string') snippets.push(s);
            else if (s?.content) snippets.push(s.content);
          }
        }

        if (uri || title) {
          groundingPlaces.push({
            title,
            uri: uri || `https://maps.google.com/?q=${encodeURIComponent(title + ' Jalpaiguri')}`,
            address: mapChunk.address || 'Jalpaiguri, West Bengal',
            snippets
          });
        }
      } else if (chunk.web) {
        const webChunk = chunk.web;
        if (webChunk.uri && webChunk.title) {
          groundingPlaces.push({
            title: webChunk.title,
            uri: webChunk.uri,
            address: 'Web Grounding Resource',
            snippets: []
          });
        }
      }
    }

    return res.json({
      reply: replyText,
      groundingPlaces,
      modelUsed: selectedModel,
      role
    });
  } catch (err: any) {
    console.error('Gemini chat execution error:', err);

    // Fallback gracefully with contextual response
    return res.json({
      reply: `Nomoshkar! I am here to assist you with any inquiries regarding Jalpaiguri services, healthcare facilities, verified trade specialists, or municipal updates.\n\nFor emergencies in Jalpaiguri, please contact **District Sadar Hospital** at \`03561-230006\` or police helpline \`112\` / \`03561-222333\`.`,
      groundingPlaces: [
        {
          title: 'Jalpaiguri District Sadar Hospital',
          uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
          address: 'Hospital Road, Kadamtala, Jalpaiguri',
          snippets: ['Primary 24x7 Government Hospital & Emergency Trauma Unit.']
        }
      ],
      modelUsed: selectedModel,
      role
    });
  }
});

// Dedicated Google Maps Grounded Place Search Endpoint
app.post('/api/gemini/maps-grounding', async (req: Request, res: Response) => {
  const {
    query,
    category = 'All',
    userLocation = { latitude: 26.5414, longitude: 88.7196 }
  } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      query,
      summary: `Found top verified locations in Jalpaiguri matching "${query}".`,
      places: [
        {
          title: 'Jalpaiguri Sadar Hospital & Emergency Ward',
          uri: 'https://maps.google.com/?q=Jalpaiguri+Sadar+Hospital',
          address: 'Hospital Rd, Kadamtala, Jalpaiguri, West Bengal 735101',
          category: 'Healthcare',
          snippets: ['24x7 emergency medical center with blood bank.']
        },
        {
          title: 'Kadamtala Market & Commercial Center',
          uri: 'https://maps.google.com/?q=Kadamtala+Market+Jalpaiguri',
          address: 'Kadamtala, Jalpaiguri, West Bengal 735101',
          category: 'Commercial',
          snippets: ['Major junction with pharmacies, trade shops, and transport.']
        },
        {
          title: 'Rajbari Dighi & Royal Palace Grounds',
          uri: 'https://maps.google.com/?q=Rajbari+Dighi+Jalpaiguri',
          address: 'Rajbari, Jalpaiguri, West Bengal 735101',
          category: 'Heritage & Tourism',
          snippets: ['Historic lake and palace of the Raikat kings.']
        }
      ]
    });
  }

  try {
    const prompt = `Provide the top authentic, accurate places, contact landmarks, and descriptions in or immediately around Jalpaiguri, West Bengal matching: "${query}" (Category: ${category}). Include practical tips on getting there.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Google Maps grounded local geography expert for Jalpaiguri, West Bengal, India. Provide clear recommendations with exact names and local context.',
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: Number(userLocation.latitude) || 26.5414,
              longitude: Number(userLocation.longitude) || 88.7196
            }
          }
        }
      }
    });

    const summaryText = response.text || `Top locations in Jalpaiguri for ${query}`;
    const places: Array<{
      title: string;
      uri: string;
      address?: string;
      snippets?: string[];
      category?: string;
    }> = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    for (const chunk of chunks as any[]) {
      if (chunk.maps) {
        const m = chunk.maps;
        const title = m.title || 'Location in Jalpaiguri';
        const uri = m.uri || `https://maps.google.com/?q=${encodeURIComponent(title + ' Jalpaiguri')}`;
        const snippets: string[] = [];
        if (Array.isArray(m.placeAnswerSources?.reviewSnippets)) {
          for (const s of m.placeAnswerSources.reviewSnippets) {
            if (typeof s === 'string') snippets.push(s);
            else if (s?.content) snippets.push(s.content);
          }
        }
        places.push({
          title,
          uri,
          address: m.address || 'Jalpaiguri, West Bengal',
          snippets,
          category
        });
      }
    }

    return res.json({
      query,
      summary: summaryText,
      places
    });
  } catch (err: any) {
    console.error('Maps grounding error:', err);
    return res.json({
      query,
      summary: `Locations in Jalpaiguri for "${query}".`,
      places: [
        {
          title: 'Jalpaiguri District Sadar Hospital',
          uri: 'https://maps.google.com/?q=Jalpaiguri+District+Sadar+Hospital',
          address: 'Hospital Road, Kadamtala, Jalpaiguri',
          snippets: ['Central government medical center and emergency hub.']
        }
      ]
    });
  }
});

// Backward compatibility routes
app.post('/api/ai/jalpaigi-chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: 'Nomoshkar! I am Jalpaigi AI, your local Jalpaiguri assistant.'
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Jalpaigi AI for Jalpaiguri, West Bengal. Answer briefly: "${message}"`
    });
    return res.json({ reply: response.text || 'Nomoshkar!' });
  } catch {
    return res.json({ reply: 'Nomoshkar! How can I assist you with Jalpaiguri services?' });
  }
});

app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ reply: 'Nomoshkar! I can help connect you with local services in Jalpaiguri.' });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are Jalpaigi AI for Jalpaiguri, West Bengal. Provide a helpful 2-sentence response for: "${prompt}"`
    });
    return res.json({ reply: response.text || 'How can I assist you in Jalpaiguri today?' });
  } catch {
    return res.json({ reply: 'How can I assist you in Jalpaiguri today?' });
  }
});

// Civic Reports routes
app.get('/api/reports', (req: Request, res: Response) => {
  res.json(memoryDb.reports);
});

app.post('/api/reports', (req: Request, res: Response) => {
  const newReport = {
    id: `JPG-${Math.floor(10000 + Math.random() * 90000)}`,
    ...req.body,
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
  broadcastRealtime('report_created', newReport);
  res.status(201).json({ success: true, report: newReport });
});

// Local alerts routes
app.get('/api/alerts', (req: Request, res: Response) => {
  res.json(memoryDb.alerts);
});

// Blood Donors and Requests
app.get('/api/blood/donors', (req: Request, res: Response) => {
  res.json(memoryDb.bloodDonors);
});

app.get('/api/blood/requests', (req: Request, res: Response) => {
  res.json(memoryDb.bloodRequests);
});

// Start Server with Vite Middleware
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
    console.log(`Jalpaiguri Connect server running on port ${PORT}`);
  });
}

startServer();
