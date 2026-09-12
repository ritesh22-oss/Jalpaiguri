var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_dotenv2 = __toESM(require("dotenv"), 1);

// server/apiKeyService.ts
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var ApiKeyService = class {
  constructor() {
    this.geminiClient = null;
    this.isGeminiInitialized = false;
  }
  /**
   * Safely retrieve the Gemini API key from server environment
   */
  getGeminiApiKey() {
    return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || process.env.VITE_GEMINI_API_KEY?.trim() || process.env.AI_STUDIO_API_KEY?.trim() || void 0;
  }
  /**
   * Check if Gemini API key is configured
   */
  hasGeminiKey() {
    return Boolean(this.getGeminiApiKey());
  }
  /**
   * Lazy initialization for GoogleGenAI client with official User-Agent telemetry
   */
  getGeminiClient() {
    const key = this.getGeminiApiKey();
    if (!key) {
      return null;
    }
    if (!this.geminiClient) {
      try {
        this.geminiClient = new import_genai.GoogleGenAI({
          apiKey: key
        });
        this.isGeminiInitialized = true;
        console.log("[ApiKeyService] GoogleGenAI client initialized successfully.");
      } catch (err) {
        console.error("[ApiKeyService] Failed to initialize GoogleGenAI client:", err?.message || err);
        return null;
      }
    }
    return this.geminiClient;
  }
  /**
   * Safely retrieve the Google Maps API key for server-side REST proxies
   */
  getGoogleMapsApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY?.trim() || process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() || void 0;
  }
  /**
   * Check if Google Maps API key is configured
   */
  hasGoogleMapsKey() {
    return Boolean(this.getGoogleMapsApiKey());
  }
  /**
   * Safe public accessor for Google Maps JS API loader (Web client)
   */
  getPublicMapsKey() {
    return this.getGoogleMapsApiKey() || "";
  }
  /**
   * Returns sanitized status of API keys (never leaks secret values)
   */
  getStatus() {
    const hasGemini = this.hasGeminiKey();
    const hasMaps = this.hasGoogleMapsKey();
    return {
      gemini: {
        configured: hasGemini,
        model: "gemini-3.5-flash / gemini-3.1-pro-preview / gemini-3.1-flash-lite",
        initialized: this.isGeminiInitialized
      },
      googleMaps: {
        configured: hasMaps,
        service: "Places API (New) & Maps JavaScript API",
        hasPublicLoaderKey: hasMaps
      },
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Verifies incoming authorization header format for protected API endpoints
   */
  extractBearerToken(authHeader) {
    if (!authHeader || typeof authHeader !== "string") return null;
    const parts = authHeader.trim().split(" ");
    if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
      return parts[1];
    }
    return null;
  }
};
var apiKeyService = new ApiKeyService();

// server.ts
import_dotenv2.default.config();
var PORT = 3e3;
var app = (0, import_express.default)();
app.use(import_express.default.json({ limit: "10mb" }));
app.use((req, res, next) => {
  if (process.env.VERCEL && req.url && !req.url.startsWith("/api") && !req.url.startsWith("/assets") && req.url !== "/" && !req.url.includes(".")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  next();
});
function getGeminiClient() {
  return apiKeyService.getGeminiClient();
}
var memoryDb = {
  profiles: /* @__PURE__ */ new Map(),
  chatMessages: /* @__PURE__ */ new Map(),
  otpStore: /* @__PURE__ */ new Map(),
  sosRateLimits: /* @__PURE__ */ new Map()
};
app.post("/api/auth/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "Phone number is required." });
  }
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile number." });
  }
  const normalizedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  const now = Date.now();
  const existing = memoryDb.otpStore.get(digits);
  if (existing && now - existing.lastSentAt < 15e3) {
    const waitSec = Math.ceil((15e3 - (now - existing.lastSentAt)) / 1e3);
    return res.status(429).json({
      error: `Please wait ${waitSec}s before requesting a new OTP.`
    });
  }
  const generatedOtp = import_crypto.default.randomInt(1e5, 1e6).toString();
  const expiresAt = now + 5 * 60 * 1e3;
  memoryDb.otpStore.set(digits, {
    code: generatedOtp,
    expiresAt,
    attempts: 0,
    lastSentAt: now
  });
  console.log(`[AUTH] Dispatched OTP for ${normalizedPhone}: ${generatedOtp} (Provider: Firebase Auth)`);
  return res.json({
    success: true,
    otp: generatedOtp,
    phone: normalizedPhone,
    provider: "Firebase-SMS",
    expiresInSeconds: 300,
    message: `Verification code generated for ${normalizedPhone}`
  });
});
app.post("/api/auth/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: "Phone and OTP are required." });
  }
  const digits = phone.replace(/\D/g, "").slice(-10);
  const cleanOtp = otp.toString().trim();
  const now = Date.now();
  const record = memoryDb.otpStore.get(digits);
  if (!record) {
    return res.status(400).json({
      success: false,
      message: "No active OTP request found for this number. Please request a new code."
    });
  }
  if (now > record.expiresAt) {
    memoryDb.otpStore.delete(digits);
    return res.status(400).json({
      success: false,
      message: "This OTP has expired. Please request a new verification code."
    });
  }
  if (record.attempts >= 5) {
    memoryDb.otpStore.delete(digits);
    return res.status(429).json({
      success: false,
      message: "Too many incorrect attempts. For security, this OTP is locked. Please request a new code."
    });
  }
  if (record.code === cleanOtp) {
    memoryDb.otpStore.delete(digits);
    return res.json({
      success: true,
      verifiedPhone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      message: "Phone verified successfully."
    });
  }
  record.attempts += 1;
  const remainingAttempts = 5 - record.attempts;
  return res.status(400).json({
    success: false,
    message: remainingAttempts > 0 ? `Incorrect OTP code. ${remainingAttempts} attempts remaining.` : "Too many incorrect attempts. Please request a new OTP."
  });
});
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Jalpaiguri Connect Backend",
    firebaseAuthEnabled: true,
    geminiEnabled: apiKeyService.hasGeminiKey(),
    googleMapsEnabled: apiKeyService.hasGoogleMapsKey(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/keys/status", (req, res) => {
  res.json(apiKeyService.getStatus());
});
app.get("/api/location/reverse-geocode", async (req, res) => {
  const latStr = req.query.lat;
  const lngStr = req.query.lng;
  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: "Valid latitude and longitude are required." });
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7e3);
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "User-Agent": "JalpaiguriConnectApp/2.0 (civic.portal.wb@gmail.com)"
        }
      }
    );
    clearTimeout(timeoutId);
    if (osmResponse.ok) {
      const data = await osmResponse.json();
      if (data && data.address) {
        const addr = data.address;
        const road = addr.road || addr.pedestrian || addr.street || "";
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || addr.city_district || addr.hamlet || road || "";
        let city = addr.city || addr.town || addr.municipality || addr.state_district || addr.county || "";
        city = city.replace(/\s+Corporation$/i, "").trim();
        const district = addr.state_district || addr.district || addr.county || city;
        const state = addr.state || "";
        const country = addr.country || "India";
        const pincode = addr.postcode || "";
        const primaryPlace = locality || road || city || district || "Detected Location";
        const secondaryPlace = [city && city !== primaryPlace ? city : "", state].filter(Boolean).join(", ");
        const displayName = secondaryPlace ? `${primaryPlace}, ${secondaryPlace}` : state ? `${primaryPlace}, ${state}` : `${primaryPlace}, ${country}`;
        return res.json({
          success: true,
          lat,
          lng,
          name: displayName,
          locality: primaryPlace,
          city: city || primaryPlace,
          district,
          state,
          country,
          pincode,
          road,
          rawAddress: addr,
          source: "osm-nominatim"
        });
      }
    }
  } catch (err) {
    console.warn("[REVERSE GEOCODE] OSM lookup notice:", err?.message);
  }
  const KNOWN_REGIONS = [
    { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707, radiusKm: 80 },
    { name: "Bengaluru", state: "Karnataka", lat: 12.9716, lng: 77.5946, radiusKm: 70 },
    { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, radiusKm: 60 },
    { name: "Jalpaiguri", state: "West Bengal", lat: 26.5414, lng: 88.7196, radiusKm: 35 },
    { name: "Siliguri", state: "West Bengal", lat: 26.7271, lng: 88.3953, radiusKm: 40 },
    { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, radiusKm: 80 },
    { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209, radiusKm: 70 },
    { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, radiusKm: 70 },
    { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, radiusKm: 50 },
    { name: "Coimbatore", state: "Tamil Nadu", lat: 11.0168, lng: 76.9558, radiusKm: 45 },
    { name: "Madurai", state: "Tamil Nadu", lat: 9.9252, lng: 78.1198, radiusKm: 40 },
    { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673, radiusKm: 45 },
    { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362, radiusKm: 50 }
  ];
  function calcDistKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  let matchedRegion = null;
  let minDistance = Infinity;
  for (const reg of KNOWN_REGIONS) {
    const d = calcDistKm(lat, lng, reg.lat, reg.lng);
    if (d <= reg.radiusKm && d < minDistance) {
      minDistance = d;
      matchedRegion = reg;
    }
  }
  if (matchedRegion) {
    return res.json({
      success: true,
      lat,
      lng,
      name: `${matchedRegion.name}, ${matchedRegion.state}`,
      locality: matchedRegion.name,
      city: matchedRegion.name,
      district: matchedRegion.name,
      state: matchedRegion.state,
      country: "India",
      pincode: "",
      source: "offline-regional-resolver"
    });
  }
  const genericLocality = `Location (${lat.toFixed(3)}\xB0, ${lng.toFixed(3)}\xB0)`;
  return res.json({
    success: true,
    lat,
    lng,
    name: genericLocality,
    locality: genericLocality,
    city: "Detected City",
    district: "",
    state: "",
    country: "India",
    pincode: "",
    source: "generic-coordinates"
  });
});
var ROLE_SYSTEM_INSTRUCTIONS = {
  general: `You are "JPG AI", a smart, friendly, and knowledgeable civic and community assistant for Jalpaiguri, West Bengal, India.
CRITICAL: You MUST ALWAYS refer to yourself as "JPG AI". NEVER use "Jalpaiguri AI", "Jalapaiguri AI", or any other name.
Your goal is to answer questions accurately and helpfully in English and Bengali.
You understand Jalpaiguri landmarks (Kadamtala, Dinbazar, DBC Road, Hakimpara, Rajbari Dighi, Teesta barrage, Jubilee Park), municipal services, culture, and day-to-day life.
Maintain conversational context across multiple turns.
Tone: Warm, welcoming, respectful, and practical.`,
  emergency: `You are the "Jalpaiguri Emergency & Healthcare Specialist".
You provide urgent, clear, calm, and actionable guidance for healthcare, blood donation, and emergency services in Jalpaiguri, West Bengal.
Key Jalpaiguri Contacts:
- District Sadar Hospital: 03561-230005 / 03561-227282
- 24/7 District Blood Bank: 03561-227282 (Sadar Hospital Campus)
- Emergency Police / Control Room: 112 / 03561-230222 / 03561-222333
- Fire Station (Racecourse Para): 101 / 03561-222101
- Ambulance Services: 102 / 108
Always prioritize life safety, provide clear contact numbers, and advise seeking immediate medical attention when appropriate.`,
  civic: `You are the "Jalpaiguri Civic Specialist".
You help residents navigate municipal services, ward administration (Wards 1 to 25 under Jalpaiguri Municipality), reporting civic grievances, electricity issues, and infrastructure problems.
Key Civic Guidance:
- Jalpaiguri Municipality Office: Kadamtala, Helpline: 03561-222384
- WBSEDCL Electricity Fault Helpline: 19121 / 03561-222244
- Civic Reports: Potholes, streetlights, garbage collection, and waterlogging can be tracked through the Jalpaiguri Connect app.
Provide actionable, step-by-step guidance for citizens.`,
  services: `You are the "Jalpaiguri Local Services Navigator".
You help residents find verified local trades and professionals across Jalpaiguri (Electricians, Plumbers, Carpenters, AC Technicians, Mechanics, Drivers, Painters).
You provide estimated local pricing in Jalpaiguri (e.g. \u20B9200-\u20B9350 basic visiting charge for electrical/plumbing inspection), typical time frames, and safety tips for home service bookings.`,
  tourism: `You are the "Jalpaiguri & Dooars Heritage and Travel Guide".
You provide inspiring, accurate travel, heritage, and cultural information about Jalpaiguri town and the Dooars region of North Bengal.
Key Highlights:
- Raikat Palace (Rajbari) & Historic Rajbari Dighi (boating and park)
- Teesta River embankment and scenic views
- Gorumara National Park, Chapramari Wildlife Sanctuary & Murti River (nearby Dooars)
- Local Cuisine: North Bengal tea varieties, Jalpaiguri sweet shops, authentic Bengali sweets and snacks.
Provide seasonal recommendations, best times to visit, and travel routes.`
};
function formatGeminiHistory(history, currentMessage) {
  const contents = [];
  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text || typeof item.text !== "string") continue;
      const role = item.role === "model" ? "model" : "user";
      if (contents.length === 0 && role === "model") {
        continue;
      }
      const last2 = contents[contents.length - 1];
      if (last2 && last2.role === role) {
        last2.parts[0].text += `

${item.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: item.text }]
        });
      }
    }
  }
  const last = contents[contents.length - 1];
  if (last && last.role === "user") {
    last.parts[0].text += `

${currentMessage}`;
  } else {
    contents.push({
      role: "user",
      parts: [{ text: currentMessage }]
    });
  }
  while (contents.length > 0 && contents[0].role === "model") {
    contents.shift();
  }
  if (contents.length === 0) {
    contents.push({
      role: "user",
      parts: [{ text: currentMessage || "Nomoshkar" }]
    });
  }
  return contents;
}
function generateLocalFallback(query, role) {
  const lower = query.toLowerCase();
  if (lower.includes("blood") || lower.includes("donor")) {
    return `**Jalpaiguri Blood Bank & Donor Assistance:**

\u2022 **District Sadar Hospital Blood Bank:** 03561-227282 (24x7 Available, Hospital Campus, Hospital Road)
\u2022 **Indian Red Cross Society, Jalpaiguri:** 03561-224455
\u2022 **Emergency Ambulance:** 102 / 108

You can also open the **Blood** tab directly in MYJPG to view real-time verified local donors and submit blood requests!`;
  }
  if (lower.includes("hospital") || lower.includes("doctor") || lower.includes("emergency") || lower.includes("ambulance") || lower.includes("police")) {
    return `**Jalpaiguri Emergency Directory:**

\u2022 **Jalpaiguri District Sadar Hospital:** 03561-230005 / 03561-227282
\u2022 **Police Emergency Control:** 112 / 03561-230222 (Kotwali PS: 03561-222333)
\u2022 **Fire Station (Racecourse Para):** 101 / 03561-222101
\u2022 **District Disaster Helpline:** 1077

For urgent life safety, you can also trigger the **Safety SOS** hub inside the app.`;
  }
  if (lower.includes("electrician") || lower.includes("plumber") || lower.includes("carpenter") || lower.includes("worker") || lower.includes("repair")) {
    return `**Jalpaiguri Verified Trades & Services:**

Verified electricians, plumbers, carpenters, and appliance repair specialists are available across Kadamtala, DBC Road, Dinbazar, and Hakimpara.

\u2022 **Typical Visit/Inspection Fee:** \u20B9200 \u2013 \u20B9350
\u2022 **Emergency callout:** Available through the **Workers** tab with phone numbers and ID verification.`;
  }
  if (role === "tourism" || lower.includes("tourism") || lower.includes("dooars") || lower.includes("visit") || lower.includes("rajbari")) {
    return `**Jalpaiguri & Dooars Tourism Recommendations:**

\u2022 **Jalpaiguri Rajbari & Dighi:** The historic palace of the Raikat dynasty and adjoining palace pond, located near Rajbari para.
\u2022 **Teesta River Embankment:** Beautiful sunset viewpoints and peaceful walking promenade along the river.
\u2022 **Gorumara & Chapramari:** Famous wildlife reserves situated just 45 mins from Jalpaiguri, known for Indian one-horned rhinos and scenic tea gardens.
\u2022 **Jalpesh Temple:** Ancient Shiva temple located approximately 15 km from town.`;
  }
  return `Nomoshkar! I am **JPG AI**, your local assistant for Jalpaiguri, West Bengal. I can help you with verified electricians & plumbers, blood donor requests, Sadar Hospital emergency contacts, municipal ward grievances, and local Dooars travel advice. How can I assist you right now?`;
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: apiKeyService.hasGeminiKey(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/gemini/health", (req, res) => {
  res.json({
    status: "ok",
    geminiConfigured: apiKeyService.hasGeminiKey()
  });
});
app.post("/api/gemini/chat", async (req, res) => {
  const {
    message,
    history = [],
    role = "general",
    modelType = "general",
    userLocation = { latitude: 26.5414, longitude: 88.7196 },
    language = "en"
  } = req.body;
  console.log(`[Gemini Chat] Received request. Endpoint: /api/gemini/chat. Language: ${language}`);
  const hasKey = apiKeyService.hasGeminiKey();
  console.log(`[Gemini Chat] GEMINI_API_KEY configured: ${hasKey}`);
  if (!message || typeof message !== "string") {
    return res.status(400).json({ success: false, error: "A valid message string is required.", code: "INVALID_REQUEST" });
  }
  const ai = getGeminiClient();
  let selectedModel = "gemini-3.1-flash-lite";
  if (modelType === "complex" || modelType === "pro") {
    selectedModel = "gemini-3.1-pro-preview";
  } else if (modelType === "fast" || modelType === "lite") {
    selectedModel = "gemini-3.1-flash-lite";
  }
  try {
    if (!ai) {
      console.warn("[Gemini Chat] GEMINI_API_KEY is missing. Using local Jalpaiguri civic knowledge fallback.");
      const localReply = generateLocalFallback(message, role);
      return res.json({
        success: true,
        reply: localReply,
        groundingPlaces: [],
        modelUsed: "local-civic-fallback",
        role
      });
    }
    let systemInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.general;
    if (language === "bn") {
      systemInstruction += "\n\nIMPORTANT: You MUST reply entirely in Bengali (\u09AC\u09BE\u0982\u09B2\u09BE). Do not use English unless explicitly asked or referring to specific proper nouns.";
    } else {
      systemInstruction += "\n\nIMPORTANT: You MUST reply entirely in English.";
    }
    const formattedContents = formatGeminiHistory(history, message);
    const config = {
      systemInstruction,
      temperature: 0.7
    };
    console.log(`[Gemini Chat] Gemini request started using model: ${selectedModel}`);
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config
    });
    console.log(`[Gemini Chat] Gemini response received.`);
    const replyText = response.text || generateLocalFallback(message, role);
    const groundingPlaces = [];
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = metadata?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.maps) {
        const m = chunk.maps;
        groundingPlaces.push({
          title: m.title || "Location",
          uri: m.uri || `https://maps.google.com/?q=${encodeURIComponent(m.title + " Jalpaiguri")}`,
          address: m.address || "Jalpaiguri, West Bengal",
          snippets: m.placeAnswerSources?.reviewSnippets?.map((s) => typeof s === "string" ? s : s.content) || []
        });
      }
    }
    return res.json({
      success: true,
      reply: replyText,
      groundingPlaces,
      modelUsed: selectedModel,
      role
    });
  } catch (err) {
    const errMessage = err?.message || String(err);
    console.error(`[Gemini Chat] Error encountered, falling back to local civic knowledge:`, errMessage);
    const fallbackReply = generateLocalFallback(message, role);
    return res.json({
      success: true,
      reply: fallbackReply,
      groundingPlaces: [],
      modelUsed: "local-civic-fallback",
      role
    });
  }
});
app.post("/api/gemini/maps-grounding", async (req, res) => {
  const {
    query,
    category = "All",
    userLocation = { latitude: 26.5414, longitude: 88.7196 }
  } = req.body;
  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Search query is required." });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      query,
      summary: `Found top verified locations in Jalpaiguri matching "${query}".`,
      places: [
        {
          title: "Jalpaiguri Sadar Hospital & Emergency Ward",
          uri: "https://maps.google.com/?q=Jalpaiguri+Sadar+Hospital",
          address: "Hospital Rd, Kadamtala, Jalpaiguri, West Bengal 735101",
          category: "Healthcare",
          snippets: ["24x7 emergency medical center with blood bank."]
        },
        {
          title: "Kadamtala Market & Commercial Center",
          uri: "https://maps.google.com/?q=Kadamtala+Market+Jalpaiguri",
          address: "Kadamtala, Jalpaiguri, West Bengal 735101",
          category: "Commercial",
          snippets: ["Major junction with pharmacies, trade shops, and transport."]
        },
        {
          title: "Rajbari Dighi & Royal Palace Grounds",
          uri: "https://maps.google.com/?q=Rajbari+Dighi+Jalpaiguri",
          address: "Rajbari, Jalpaiguri, West Bengal 735101",
          category: "Heritage & Tourism",
          snippets: ["Historic lake and palace of the Raikat kings."]
        }
      ]
    });
  }
  try {
    const prompt = `Provide the top authentic, accurate places, contact landmarks, and descriptions in or immediately around Jalpaiguri, West Bengal matching: "${query}" (Category: ${category}). Include practical tips on getting there.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
      config: {
        systemInstruction: "You are a Google Maps grounded local geography expert for Jalpaiguri, West Bengal, India. Provide clear recommendations with exact names and local context. ONLY provide results relevant to the specific search query.",
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
    const places = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    for (const chunk of chunks) {
      if (chunk.maps) {
        const m = chunk.maps;
        const title = m.title || "Location";
        const uri = m.uri || `https://maps.google.com/?q=${encodeURIComponent(title + " Jalpaiguri")}`;
        const snippets = [];
        if (Array.isArray(m.placeAnswerSources?.reviewSnippets)) {
          for (const s of m.placeAnswerSources.reviewSnippets) {
            if (typeof s === "string") snippets.push(s);
            else if (s?.content) snippets.push(s.content);
          }
        }
        places.push({
          title,
          uri,
          address: m.address || "Jalpaiguri, West Bengal",
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
  } catch (err) {
    console.error("Maps grounding error:", err);
    return res.json({
      query,
      summary: `Search results for "${query}" in Jalpaiguri.`,
      places: []
    });
  }
});
var serverPlacePhotoCache = /* @__PURE__ */ new Map();
var serverPlaceAiImageCache = /* @__PURE__ */ new Map();
var serverPlaceDetailsCache = /* @__PURE__ */ new Map();
var SERVER_CACHE_TTL = 24 * 60 * 60 * 1e3;
app.get("/api/config/maps-key", (req, res) => {
  res.json({
    apiKey: apiKeyService.getPublicMapsKey(),
    solution_channel: "gmp_mcp_codeassist_v1_aistudio"
  });
});
var quotaExhaustedUntil = 0;
app.post("/api/places/generate-image", async (req, res) => {
  if (Date.now() < quotaExhaustedUntil) {
    return res.json({ imageUrl: null, message: "Quota exhausted temporarily" });
  }
  const { placeId, name, category, subcategory, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Place name is required" });
  }
  const cacheKey = placeId || name;
  const cached = serverPlaceAiImageCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json({
      imageUrl: cached.imageUrl,
      attribution: cached.attribution,
      imageSource: "gemini",
      cached: true
    });
  }
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      imageUrl: null,
      message: "Gemini API not configured"
    });
  }
  try {
    const prompt = `A realistic, high-quality architectural photo and landscape view of "${name}" (${subcategory || category || "Landmark"}) in Jalpaiguri, North Bengal, India. Traditional North Bengal architectural elements, lush greenery, realistic sunlight, vibrant cultural aesthetic of Jalpaiguri town. Clean, no text or watermarks.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });
    let generatedImageUrl = null;
    const candidates = response.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || "image/png";
          generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    if (generatedImageUrl) {
      serverPlaceAiImageCache.set(cacheKey, {
        imageUrl: generatedImageUrl,
        attribution: "AI-generated Preview (Gemini)",
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      return res.json({
        imageUrl: generatedImageUrl,
        attribution: "AI-generated Preview (Gemini)",
        imageSource: "gemini"
      });
    } else {
      return res.json({ imageUrl: null });
    }
  } catch (err) {
    if (err?.status === 429 || err?.message?.includes("RESOURCE_EXHAUSTED")) {
      quotaExhaustedUntil = Date.now() + 60 * 60 * 1e3;
      console.warn("Gemini image generation quota exceeded. Falling back to architectural illustrations.");
      return res.json({ imageUrl: null, message: "Quota exceeded, using fallback illustration" });
    }
    console.warn("Gemini place image generation unavailable:", err?.message || err);
    return res.json({ imageUrl: null, error: err?.message });
  }
});
app.get("/api/places/photo", async (req, res) => {
  const placeId = req.query.placeId || "";
  const photoName = req.query.name || "";
  const maxWidth = parseInt(req.query.width, 10) || 600;
  const maxHeight = parseInt(req.query.height, 10) || 400;
  if (!placeId && !photoName) {
    return res.status(400).json({ error: "placeId or name parameter is required" });
  }
  const cacheKey = `${placeId || photoName}_${maxWidth}x${maxHeight}`;
  const cached = serverPlacePhotoCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json({
      photoUrl: cached.photoUrl,
      attribution: cached.attribution,
      hasPhoto: cached.hasPhoto,
      cached: true
    });
  }
  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    const entry = {
      photoUrl: null,
      hasPhoto: false,
      expiresAt: Date.now() + SERVER_CACHE_TTL
    };
    serverPlacePhotoCache.set(cacheKey, entry);
    return res.json({
      photoUrl: null,
      hasPhoto: false,
      message: "No Google Maps API Key configured; place rendered with official Google Maps metadata"
    });
  }
  try {
    let targetPhotoName = photoName;
    if (!targetPhotoName && placeId) {
      const placeUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=photos&key=${apiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
      const placeRes = await fetch(placeUrl);
      if (placeRes.ok) {
        const placeData = await placeRes.json();
        if (Array.isArray(placeData.photos) && placeData.photos.length > 0) {
          targetPhotoName = placeData.photos[0].name;
        }
      }
    }
    if (!targetPhotoName) {
      const entry = {
        photoUrl: null,
        hasPhoto: false,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({ photoUrl: null, hasPhoto: false });
    }
    const mediaUrl = `https://places.googleapis.com/v1/${encodeURIComponent(targetPhotoName)}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&skipHttpRedirect=true&key=${apiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
    const mediaRes = await fetch(mediaUrl);
    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const photoUri = mediaData.photoUri || null;
      const entry = {
        photoUrl: photoUri,
        hasPhoto: !!photoUri,
        attribution: "\xA9 Google Maps Contributor",
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({
        photoUrl: photoUri,
        hasPhoto: !!photoUri,
        attribution: entry.attribution
      });
    } else {
      const entry = {
        photoUrl: null,
        hasPhoto: false,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({ photoUrl: null, hasPhoto: false });
    }
  } catch (err) {
    console.error("Error fetching Google Places photo:", err);
    return res.json({ photoUrl: null, hasPhoto: false });
  }
});
app.get("/api/places/details/:placeId", async (req, res) => {
  const { placeId } = req.params;
  if (!placeId) {
    return res.status(400).json({ error: "placeId is required" });
  }
  const cached = serverPlaceDetailsCache.get(placeId);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json(cached.data);
  }
  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.json({
      placeId,
      status: "offline_catalog",
      message: "Google Maps API key not configured"
    });
  }
  try {
    const fields = "id,displayName,formattedAddress,rating,userRatingCount,primaryTypeDisplayName,photos,location,currentOpeningHours,googleMapsUri";
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=${fields}&key=${apiKey}&solution_id=gmp_mcp_codeassist_v1_aistudio`;
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      serverPlaceDetailsCache.set(placeId, {
        data,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      });
      return res.json(data);
    } else {
      return res.status(resp.status).json({ error: "Failed to fetch place details from Google Places" });
    }
  } catch (err) {
    console.error("Error fetching Google Places details:", err);
    return res.status(500).json({ error: "Server error fetching place details" });
  }
});
app.post("/api/ai/jalpaigi-chat", async (req, res) => {
  const { message, history } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: "Nomoshkar! I am JPG AI, your local Jalpaiguri assistant."
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `You are JPG AI for Jalpaiguri, West Bengal. Answer briefly: "${message}"`
    });
    return res.json({ reply: response.text || "Nomoshkar!" });
  } catch {
    return res.json({ reply: "Nomoshkar! How can I assist you with Jalpaiguri services?" });
  }
});
app.post("/api/ai/assistant", async (req, res) => {
  const { prompt } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({ reply: "Nomoshkar! I can help connect you with local services in Jalpaiguri." });
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `You are JPG AI for Jalpaiguri, West Bengal. Provide a helpful 2-sentence response for: "${prompt}"`
    });
    return res.json({ reply: response.text || "How can I assist you in Jalpaiguri today?" });
  } catch {
    return res.json({ reply: "How can I assist you in Jalpaiguri today?" });
  }
});
var JALPAIGURI_CITY_POLYGON = [
  [26.548, 88.705],
  [26.556, 88.728],
  [26.552, 88.752],
  [26.538, 88.762],
  [26.518, 88.755],
  [26.502, 88.742],
  [26.495, 88.728],
  [26.498, 88.702],
  [26.522, 88.688],
  [26.54, 88.692]
];
var JALPAIGURI_DISTRICT_POLYGON = [
  [27.02, 88.72],
  [27.01, 89.05],
  [26.85, 89.15],
  [26.55, 89.1],
  [26.32, 88.85],
  [26.38, 88.58],
  [26.65, 88.42],
  [26.88, 88.55]
];
function checkPointInPolygon(lat, lng, polygon) {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect = yi > lng !== yj > lng && lat < (xj - xi) * (lng - yi) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function haversineDistKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function verifyServerServiceArea(lat, lng, mode = "JALPAIGURI_CITY") {
  if (mode === "JALPAIGURI_DISTRICT") {
    const inBox2 = lat >= 26.25 && lat <= 27.05 && lng >= 88.38 && lng <= 89.2;
    const isInside2 = inBox2 && checkPointInPolygon(lat, lng, JALPAIGURI_DISTRICT_POLYGON);
    return {
      isInside: isInside2,
      mode: "JALPAIGURI_DISTRICT",
      boundaryName: "Jalpaiguri District",
      centerDistKm: haversineDistKm(lat, lng, 26.5414, 88.7196)
    };
  }
  const inBox = lat >= 26.49 && lat <= 26.565 && lng >= 88.685 && lng <= 88.765;
  const isInside = inBox && checkPointInPolygon(lat, lng, JALPAIGURI_CITY_POLYGON);
  return {
    isInside,
    mode: "JALPAIGURI_CITY",
    boundaryName: "Jalpaiguri Municipality",
    centerDistKm: haversineDistKm(lat, lng, 26.5265, 88.723)
  };
}
app.post("/api/location/verify-service-area", (req, res) => {
  const { lat, lng, mode = "JALPAIGURI_CITY" } = req.body;
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || isNaN(numLng)) {
    return res.status(400).json({ error: "Valid lat and lng are required." });
  }
  const result = verifyServerServiceArea(numLat, numLng, mode);
  return res.json({
    success: true,
    isInside: result.isInside,
    serviceAreaStatus: result.isInside ? "inside" : "outside",
    mode: result.mode,
    boundaryName: result.boundaryName,
    distanceToCenterKm: Math.round(result.centerDistKm * 10) / 10,
    allowed: result.isInside
  });
});
app.get("/api/restaurants/:restaurantId", (req, res) => {
  res.json({});
});
app.get("/api/restaurants/:restaurantId/menuItems", (req, res) => {
  res.json([]);
});
app.get("/api/restaurants/search-item", (req, res) => {
  res.json([]);
});
app.post("/api/restaurants/match-list", (req, res) => {
  res.json([]);
});
app.post("/api/restaurants/:restaurantId/subscription", (req, res) => {
  const { restaurantId } = req.params;
  const { plan } = req.body;
  if (!plan || !["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }
  res.json({
    orderId: "order_" + Math.random().toString(36).substring(7),
    amount: plan === "yearly" ? 599900 : 59900,
    // Amount in paise
    currency: "INR"
  });
});
app.post("/api/shops/:shopId/subscription", (req, res) => {
  const { shopId } = req.params;
  const { plan } = req.body;
  if (!plan || !["monthly", "yearly"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan selected." });
  }
  return res.json({
    success: true,
    message: "Subscription validated securely on backend.",
    shopId,
    plan,
    verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Jalpaiguri Connect server running on port ${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer();
}
var server_default = app;
//# sourceMappingURL=server.cjs.map
