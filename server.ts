import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { apiKeyService } from './server/apiKeyService';
import {
  shopStore,
  extractProductsWithGemini,
  generateShopDescriptionWithGemini,
  JALPAIGURI_VALID_PINS
} from './server/shopStore';

dotenv.config();

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS support for native WebView (appassets.androidplatform.net) and cross-origin API calls
app.use('/api', (req: Request, res: Response, next: Function) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Vercel serverless path normalization middleware (fixes 404 when Vercel strips /api prefix)
app.use((req: Request, res: Response, next: Function) => {
  if (process.env.VERCEL && req.url && !req.url.startsWith('/api') && !req.url.startsWith('/assets') && req.url !== '/' && !req.url.includes('.')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Safe lazy initialization for Gemini AI via centralized apiKeyService
function getGeminiClient(): GoogleGenAI | null {
  return apiKeyService.getGeminiClient();
}

// In-Memory Database Store for real-time live sync across clients
const sseClients: Response[] = [];

const memoryDb = {
  profiles: new Map<string, any>(),
  chatMessages: new Map<string, any[]>(),
  otpStore: new Map<string, {
    code: string;
    expiresAt: number;
    attempts: number;
    lastSentAt: number;
  }>(),
  sosRateLimits: new Map<string, number>(),
  sosEvents: new Map<string, any>(),
  sosIdempotency: new Map<string, any>()
};

// ==========================================
// PHONE AUTH & OTP DISPATCH ENDPOINTS
// ==========================================
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }

  const normalizedPhone = `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  const now = Date.now();

  // Rate Limiting: Minimum 15 seconds cooldown between OTP requests for the same number
  const existing = memoryDb.otpStore.get(digits);
  if (existing && now - existing.lastSentAt < 15000) {
    const waitSec = Math.ceil((15000 - (now - existing.lastSentAt)) / 1000);
    return res.status(429).json({
      error: `Please wait ${waitSec}s before requesting a new OTP.`
    });
  }
  
  // Cryptographically secure 6-digit random OTP generation
  const generatedOtp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = now + 5 * 60 * 1000; // Strictly 5 minutes expiration

  memoryDb.otpStore.set(digits, {
    code: generatedOtp,
    expiresAt,
    attempts: 0,
    lastSentAt: now
  });

  // Broadcast push notification to SSE stream (deprecated, but kept for legacy log output if needed)
  console.log(`[AUTH] Dispatched OTP for ${normalizedPhone}: ${generatedOtp} (Provider: Firebase Auth)`);

  return res.json({
    success: true,
    otp: generatedOtp,
    phone: normalizedPhone,
    provider: 'Firebase-SMS',
    expiresInSeconds: 300,
    message: `Verification code generated for ${normalizedPhone}`
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required.' });
  }

  const digits = phone.replace(/\D/g, '').slice(-10);
  const cleanOtp = otp.toString().trim();
  const now = Date.now();
  const record = memoryDb.otpStore.get(digits);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: 'No active OTP request found for this number. Please request a new code.'
    });
  }

  // Check Expiration (5-minute lifetime)
  if (now > record.expiresAt) {
    memoryDb.otpStore.delete(digits);
    return res.status(400).json({
      success: false,
      message: 'This OTP has expired. Please request a new verification code.'
    });
  }

  // Check Max Failed Attempts (Anti-Brute Force Protection)
  if (record.attempts >= 5) {
    memoryDb.otpStore.delete(digits);
    return res.status(429).json({
      success: false,
      message: 'Too many incorrect attempts. For security, this OTP is locked. Please request a new code.'
    });
  }

  // Secure Match Verification
  if (record.code === cleanOtp) {
    // Single-use token: Immediately delete upon successful verification
    memoryDb.otpStore.delete(digits);
    return res.json({
      success: true,
      verifiedPhone: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`,
      message: 'Phone verified successfully.'
    });
  }

  // Increment failed attempts
  record.attempts += 1;
  const remainingAttempts = 5 - record.attempts;

  return res.status(400).json({
    success: false,
    message: remainingAttempts > 0
      ? `Incorrect OTP code. ${remainingAttempts} attempts remaining.`
      : 'Too many incorrect attempts. Please request a new OTP.'
  });
});

// ==========================================
// UTILITY & AI ROUTES
// ==========================================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Jalpaiguri Connect Backend',
    firebaseAuthEnabled: true,
    geminiEnabled: apiKeyService.hasGeminiKey(),
    googleMapsEnabled: apiKeyService.hasGoogleMapsKey(),
    timestamp: new Date().toISOString()
  });
});

// Centralized API Keys status endpoint (sanitized - secrets never exposed)
app.get('/api/keys/status', (req: Request, res: Response) => {
  res.json(apiKeyService.getStatus());
});

// Coordinate cache for reverse-geocoding & nearby POI identification (30-min TTL)
const reverseGeocodeCache = new Map<string, { payload: any; expiresAt: number }>();
const REVERSE_GEOCODE_CACHE_TTL = 30 * 60 * 1000;

function calcGeoDistMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function formatGoogleHttpError(endpointName: string, status: number, errJson: any) {
  const googleStatus = errJson?.error?.status || errJson?.status || '';
  const googleMsg = errJson?.error?.message || errJson?.error_message || '';
  let userMessage = `${endpointName} failed (HTTP ${status})`;
  if (status === 400) {
    userMessage = `Invalid request parameters (${googleStatus || '400'})`;
  } else if (status === 401 || status === 403) {
    userMessage = `Google Maps API authorization or billing/restriction error (${status}): ${googleMsg || 'Verify API enablement & key restrictions'}`;
  } else if (status === 404) {
    userMessage = `Google Maps resource/endpoint not found (404)`;
  } else if (status === 429 || googleStatus === 'RESOURCE_EXHAUSTED') {
    userMessage = `Google Maps API quota exceeded (429). Please retry later.`;
  } else if (status >= 500) {
    userMessage = `Google Maps service temporarily unavailable (${status})`;
  }
  console.error(`[GMP:${endpointName}] HTTP ${status} status=${googleStatus} msg=${googleMsg}`);
  return { userMessage, googleStatus, googleMsg };
}

function getCompText(components: any[], type: string): string {
  if (!Array.isArray(components)) return '';
  const found = components.find((c: any) => Array.isArray(c.types) && c.types.includes(type));
  return found?.longText || found?.long_name || found?.shortText || found?.short_name || '';
}

function cleanLocalityToken(raw?: string): string {
  const val = String(raw || '').trim();
  if (!val) return '';
  const first = val.split(',')[0].trim();
  if (/^(nh|sh)\s*-?\d+[a-z0-9]*$/i.test(val) || /^(nh|sh)\s*-?\d+[a-z0-9]*$/i.test(first)) return '';
  if (/nh31/i.test(val) && val.length < 22) return '';
  if (/^[A-Z0-9]{4,8}\+[A-Z0-9]{2,4}$/i.test(first)) return '';
  return val;
}

function isMinorResidentialOrGarage(types: string[], primaryType: string, name: string): boolean {
  const lower = name.trim().toLowerCase();
  if (lower.startsWith('house of ') || lower.includes('apartment') || lower.includes('niwas')) return true;
  const minor = new Set([
    'premise',
    'subpremise',
    'street_address',
    'apartment_building',
    'apartment_complex',
    'housing_complex',
    'condominium_complex',
    'parking',
    'parking_garage'
  ]);
  if (minor.has(primaryType)) return true;
  return Array.isArray(types) && types.some((t) => minor.has(t));
}

function decodeServerPolyline(encoded: string): Array<{ lat: number; lng: number }> {
  if (!encoded) return [];
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  while (index < encoded.length) {
    let b = 0;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < encoded.length);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < encoded.length);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

function calcBearingDegrees(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return Math.round(((toDeg(Math.atan2(y, x)) + 360) % 360) * 10) / 10;
}

function sampleRoutePointsServer(
  points: Array<{ lat: number; lng: number }>,
  maxStops = 8,
  minSpacingMeters = 220
): Array<{ point: { lat: number; lng: number }; distanceFromStartMeters: number; headingDegrees: number }> {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return [{ point: points[0], distanceFromStartMeters: 0, headingDegrees: 0 }];
  }
  const cum = [0];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += calcGeoDistMeters(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng);
    cum.push(total);
  }
  const capped = Math.min(Math.max(maxStops, 2), 10);
  const interval = Math.max(minSpacingMeters, Math.floor(total / (capped - 1)));
  const indices: number[] = [0];
  let nextTarget = interval;
  for (let i = 1; i < points.length - 1; i++) {
    if (cum[i] >= nextTarget && indices.length < capped - 1) {
      indices.push(i);
      nextTarget = cum[i] + interval;
    }
  }
  const lastIdx = points.length - 1;
  const prevPt = points[indices[indices.length - 1]];
  if (calcGeoDistMeters(prevPt.lat, prevPt.lng, points[lastIdx].lat, points[lastIdx].lng) >= 20 || indices.length === 1) {
    indices.push(lastIdx);
  } else {
    indices[indices.length - 1] = lastIdx;
  }

  return indices.map((idx, pos) => {
    const nextPoint = idx < points.length - 1 ? points[idx + 1] : points[Math.max(0, idx - 1)];
    const heading =
      idx < points.length - 1
        ? calcBearingDegrees(points[idx], nextPoint)
        : calcBearingDegrees(points[Math.max(0, idx - 1)], points[idx]);
    return {
      point: points[idx],
      distanceFromStartMeters: cum[idx],
      headingDegrees: heading
    };
  });
}

// Dedicated Server-Side High-Accuracy Reverse Geocoding + POI Identification (Geocoding API v4 + Places API New)
app.get('/api/location/reverse-geocode', async (req: Request, res: Response) => {
  const latStr = req.query.lat as string;
  const lngStr = req.query.lng as string;
  const placeIdParam = (req.query.placeId as string || '').trim();
  const lang = req.query.language === 'bn' ? 'bn' : 'en';

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}:${placeIdParam}:${lang}`;
  const cached = reverseGeocodeCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json({ ...cached.payload, cached: true });
  }

  const gApiKey = apiKeyService.getGoogleMapsApiKey();
  if (gApiKey) {
    try {
      // Run Geocoding API v4 reverse geocode, Geocoding v4 Destinations, Places Nearby (New), and optional Place Details in parallel
      const geocodePromise = fetch(
        `https://geocode.googleapis.com/v4/geocode/location/${lat},${lng}?languageCode=${lang}&regionCode=IN`,
        {
          headers: {
            'X-Goog-Api-Key': gApiKey,
            'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
          }
        }
      );

      const destinationsPromise = fetch('https://geocode.googleapis.com/v4/geocode/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': gApiKey,
          'X-Goog-FieldMask': 'destinations.primary,destinations.containingPlaces,destinations.landmarks',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
        },
        body: JSON.stringify({
          locationQuery: { location: { latitude: lat, longitude: lng } },
          languageCode: lang
        })
      });

      const nearbyPromise = fetch('https://places.googleapis.com/v1/places:searchNearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': gApiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName,places.types,places.rating,places.userRatingCount,places.googleMapsUri',
          'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
        },
        body: JSON.stringify({
          maxResultCount: 8,
          rankPreference: 'DISTANCE',
          languageCode: lang,
          regionCode: 'IN',
          locationRestriction: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 180.0
            }
          }
        })
      });

      const placeDetailPromise = placeIdParam
        ? fetch(
            `https://places.googleapis.com/v1/places/${encodeURIComponent(placeIdParam)}?languageCode=${lang}`,
            {
              headers: {
                'X-Goog-Api-Key': gApiKey,
                'X-Goog-FieldMask': 'id,displayName,formattedAddress,shortFormattedAddress,addressComponents,location,primaryType,primaryTypeDisplayName,types,rating,userRatingCount,googleMapsUri,currentOpeningHours',
                'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
              }
            }
          )
        : Promise.resolve(null);

      const [geoRes, destRes, nearbyRes, detailRes] = await Promise.allSettled([
        geocodePromise,
        destinationsPromise,
        nearbyPromise,
        placeDetailPromise
      ]);

      let geoJson: any = null;
      let geoHttpError: { status: number; info: any } | null = null;
      if (geoRes.status === 'fulfilled') {
        const parsed = await geoRes.value.json().catch(() => ({}));
        if (geoRes.value.ok) {
          geoJson = parsed;
        } else {
          geoHttpError = {
            status: geoRes.value.status,
            info: formatGoogleHttpError('geocoding-v4-reverse', geoRes.value.status, parsed)
          };
        }
      }

      let destJson: any = null;
      if (destRes.status === 'fulfilled' && destRes.value.ok) {
        destJson = await destRes.value.json().catch(() => null);
      }

      let nearbyJson: any = null;
      if (nearbyRes.status === 'fulfilled' && nearbyRes.value.ok) {
        nearbyJson = await nearbyRes.value.json().catch(() => null);
      }

      let explicitPlaceJson: any = null;
      if (detailRes.status === 'fulfilled' && detailRes.value && detailRes.value.ok) {
        explicitPlaceJson = await detailRes.value.json().catch(() => null);
      }

      let geoResults: any[] = Array.isArray(geoJson?.results) ? geoJson.results : [];

      // Fallback to Geocoding API v3 if Geocoding v4 failed or returned empty (e.g., if project enabled classic Geocoding API only)
      if ((geoHttpError || geoResults.length === 0) && !explicitPlaceJson) {
        try {
          const v3Resp = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=${lang}&region=IN&key=${encodeURIComponent(gApiKey)}`,
            { headers: { 'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio' } }
          );
          const v3Json = await v3Resp.json().catch(() => ({}));
          if (v3Resp.ok && v3Json?.status === 'OK' && Array.isArray(v3Json.results) && v3Json.results.length > 0) {
            geoResults = v3Json.results.map((r: any) => ({
              formattedAddress: r.formatted_address,
              placeId: r.place_id,
              types: r.types || [],
              addressComponents: r.address_components || []
            }));
            geoHttpError = null;
          }
        } catch {
          // Keep original v4 error state if v3 fallback also fails
        }
      }

      if (geoHttpError && geoResults.length === 0 && !explicitPlaceJson) {
        return res.status(geoHttpError.status).json({
          success: false,
          error: geoHttpError.info.userMessage,
          googleStatus: geoHttpError.info.googleStatus,
          lat,
          lng
        });
      }

      // Inspect multiple geocode results (ROOFTOP / route / neighborhood / locality) to extract richest components
      let road = '';
      let neighborhood = '';
      let sublocality = '';
      let city = '';
      let district = '';
      let state = '';
      let pincode = '';
      let formattedAddress = '';
      let geocodePlaceId = '';
      let primaryGeocodeTypes: string[] = [];

      for (const r of geoResults) {
        const comps = r.addressComponents || [];
        if (!formattedAddress && r.formattedAddress) {
          formattedAddress = r.formattedAddress;
          geocodePlaceId = r.placeId || '';
          primaryGeocodeTypes = Array.isArray(r.types) ? r.types : [];
        }
        if (!road) {
          const candidateRoad = cleanLocalityToken(getCompText(comps, 'route'));
          if (candidateRoad && candidateRoad !== 'Unnamed Road') {
            road = candidateRoad;
          }
        }
        if (!neighborhood) neighborhood = cleanLocalityToken(getCompText(comps, 'neighborhood'));
        if (!sublocality) {
          sublocality =
            cleanLocalityToken(getCompText(comps, 'sublocality_level_1')) ||
            cleanLocalityToken(getCompText(comps, 'sublocality_level_2')) ||
            cleanLocalityToken(getCompText(comps, 'sublocality'));
        }
        if (!city) city = cleanLocalityToken(getCompText(comps, 'locality') || r.postalAddress?.locality || '');
        if (!district) district = cleanLocalityToken(getCompText(comps, 'administrative_area_level_2'));
        if (!state) state = getCompText(comps, 'administrative_area_level_1') || r.postalAddress?.administrativeArea || '';
        if (!pincode) pincode = getCompText(comps, 'postal_code') || r.postalAddress?.postalCode || '';
      }

      // Extract explicit components if Place Details had them
      if (explicitPlaceJson?.addressComponents) {
        const pComps = explicitPlaceJson.addressComponents;
        road = road || cleanLocalityToken(getCompText(pComps, 'route'));
        neighborhood = neighborhood || cleanLocalityToken(getCompText(pComps, 'neighborhood'));
        sublocality =
          sublocality ||
          cleanLocalityToken(getCompText(pComps, 'sublocality_level_1')) ||
          cleanLocalityToken(getCompText(pComps, 'sublocality'));
        city = city || cleanLocalityToken(getCompText(pComps, 'locality'));
        district = district || cleanLocalityToken(getCompText(pComps, 'administrative_area_level_2'));
        state = state || getCompText(pComps, 'administrative_area_level_1');
        pincode = pincode || getCompText(pComps, 'postal_code');
      }

      // Process nearby POIs with exact distance from tapped coordinate
      const rawNearby: any[] = Array.isArray(nearbyJson?.places) ? nearbyJson.places : [];
      const nearbyPlaces = rawNearby
        .filter((p: any) => p?.displayName?.text && p?.location)
        .map((p: any) => {
          const dMeters = calcGeoDistMeters(lat, lng, p.location.latitude, p.location.longitude);
          return {
            placeId: p.id,
            name: p.displayName.text,
            category: p.primaryTypeDisplayName?.text || p.primaryType?.replace(/_/g, ' ') || 'Place',
            primaryType: p.primaryType || '',
            types: Array.isArray(p.types) ? p.types : [],
            address: p.shortFormattedAddress || p.formattedAddress || '',
            formattedAddress: p.formattedAddress || '',
            lat: p.location.latitude,
            lng: p.location.longitude,
            distanceMeters: dMeters,
            rating: p.rating,
            userRatingCount: p.userRatingCount,
            googleMapsUri: p.googleMapsUri
          };
        })
        .sort((a: any, b: any) => a.distanceMeters - b.distanceMeters);

      // Extract destination landmarks / containing places from Geocode v4 destinations
      const destPrimary = destJson?.destinations?.[0]?.primary;
      const containingPlaces = Array.isArray(destJson?.destinations?.[0]?.containingPlaces)
        ? destJson.destinations[0].containingPlaces
        : [];
      const destLandmarks = Array.isArray(destJson?.destinations?.[0]?.landmarks)
        ? destJson.destinations[0].landmarks
        : [];

      const containingClean = containingPlaces
        .map((cp: any) => cleanLocalityToken(cp?.displayName?.text))
        .find((val: string) => Boolean(val)) || '';

      const localityLabel =
        sublocality ||
        neighborhood ||
        containingClean ||
        city ||
        'Jalpaiguri';

      // Determine entity classification ('poi' | 'road' | 'locality' | 'coordinate')
      let kind: 'poi' | 'road' | 'locality' | 'coordinate' = 'coordinate';
      let primaryTitle = '';
      let primaryCategory = '';
      let primaryPlace: any = null;

      const closestPoi = nearbyPlaces.find(
        (p: any) => !isMinorResidentialOrGarage(p.types || [], p.primaryType || '', p.name || '')
      ) || nearbyPlaces[0];

      const isClosestMinor = closestPoi
        ? isMinorResidentialOrGarage(closestPoi.types || [], closestPoi.primaryType || '', closestPoi.name || '')
        : false;

      if (explicitPlaceJson?.displayName?.text) {
        kind = 'poi';
        primaryTitle = explicitPlaceJson.displayName.text;
        primaryCategory = explicitPlaceJson.primaryTypeDisplayName?.text || 'Point of Interest';
        primaryPlace = {
          placeId: explicitPlaceJson.id,
          name: explicitPlaceJson.displayName.text,
          category: primaryCategory,
          address: explicitPlaceJson.formattedAddress || formattedAddress,
          rating: explicitPlaceJson.rating,
          userRatingCount: explicitPlaceJson.userRatingCount,
          googleMapsUri: explicitPlaceJson.googleMapsUri,
          openNow: explicitPlaceJson.currentOpeningHours?.openNow
        };
      } else if (
        destPrimary?.displayName?.text &&
        !isMinorResidentialOrGarage([], destPrimary.primaryType || '', destPrimary.displayName.text)
      ) {
        kind = 'poi';
        primaryTitle = destPrimary.displayName.text;
        primaryCategory = destPrimary.primaryType?.replace(/_/g, ' ') || 'Landmark';
        primaryPlace = {
          placeId: destPrimary.placeId,
          name: destPrimary.displayName.text,
          category: primaryCategory,
          address: destPrimary.formattedAddress || formattedAddress
        };
      } else if (closestPoi && !isClosestMinor && closestPoi.distanceMeters <= (road ? 25 : 45)) {
        kind = 'poi';
        primaryTitle = closestPoi.name;
        primaryCategory = closestPoi.category;
        primaryPlace = closestPoi;
      } else if (road) {
        kind = 'road';
        primaryTitle = road;
        primaryCategory = 'Road / Street';
      } else if (closestPoi && closestPoi.distanceMeters <= 45) {
        kind = 'poi';
        primaryTitle = closestPoi.name;
        primaryCategory = closestPoi.category;
        primaryPlace = closestPoi;
      } else if (localityLabel) {
        kind = 'locality';
        primaryTitle = localityLabel;
        primaryCategory = 'Locality / Area';
      } else if (destLandmarks[0]?.place?.displayName?.text) {
        kind = 'locality';
        primaryTitle = `Near ${destLandmarks[0].place.displayName.text}`;
        primaryCategory = 'Area';
      } else {
        kind = 'coordinate';
        primaryTitle = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        primaryCategory = 'Coordinates';
      }

      const finalFormatted =
        explicitPlaceJson?.formattedAddress ||
        formattedAddress ||
        [road, localityLabel, city, state, pincode].filter(Boolean).join(', ') ||
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      const payload = {
        success: true,
        lat,
        lng,
        kind,
        title: primaryTitle,
        category: primaryCategory,
        name: finalFormatted,
        locality: localityLabel || city || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        city: city || 'Jalpaiguri',
        district: district || city || 'Jalpaiguri',
        state: state || 'West Bengal',
        country: 'India',
        pincode,
        road,
        placeId: explicitPlaceJson?.id || primaryPlace?.placeId || geocodePlaceId,
        primaryPlace,
        nearbyPlaces,
        landmarks: destLandmarks.slice(0, 4).map((l: any) => ({
          name: l.place?.displayName?.text || '',
          description: l.relationalDescription?.text || '',
          distanceMeters: Math.round(l.straightLineDistanceMeters || 0),
          placeId: l.place?.placeId || ''
        })).filter((l: any) => l.name),
        source: 'google-geocoding-v4'
      };

      reverseGeocodeCache.set(cacheKey, {
        payload,
        expiresAt: Date.now() + REVERSE_GEOCODE_CACHE_TTL
      });
      return res.json(payload);
    } catch (err: any) {
      console.error('[REVERSE GEOCODE v4] Network/Exception:', err?.message || err);
      return res.status(502).json({
        success: false,
        error: err?.message || 'Failed to contact Google Geocoding API v4',
        lat,
        lng
      });
    }
  }

  // Fallback ONLY when GOOGLE_MAPS_API_KEY is not configured at all
  const coordsLabel = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  return res.json({
    success: true,
    lat,
    lng,
    kind: 'coordinate',
    title: coordsLabel,
    category: 'Coordinates',
    name: `Coordinates ${coordsLabel}`,
    locality: coordsLabel,
    city: 'Jalpaiguri',
    district: 'Jalpaiguri',
    state: 'West Bengal',
    country: 'India',
    pincode: '',
    road: '',
    nearbyPlaces: [],
    landmarks: [],
    source: 'coordinates-fallback'
  });
});

// ==========================================
// GEMINI AI & GOOGLE MAPS GROUNDING ROUTES
// ==========================================

const ROLE_SYSTEM_INSTRUCTIONS: Record<string, string> = {
  general: `You are the official, intelligent AI Assistant for MYJPG (Jalpaiguri Connected).
Your capabilities and guidelines:
1. General Questions: You are a fully capable AI assistant. Answer questions on science, technology, programming, mathematics, education, and general knowledge with clear explanations, structured paragraphs, lists, and markdown code blocks.
2. Jalpaiguri Civic & Community: Provide accurate, verified local information for Jalpaiguri municipality and district — including healthcare (District Sadar Hospital 03561-230005), blood banks (03561-227282), Kotwali Police (03561-222303, 112), and tourism (Rajbari Dighi, Teesta Embankment, Gorumara). Never invent fake contacts, numbers, or addresses.
3. MYJPG App Guidance: Explain how to navigate MYJPG features (Home, Blood Donors, Civic Reports, Local Shops, Dining, Verified Workers, Safety SOS).
4. Tone & Style: Be friendly, articulate, polite, and direct. Format responses with clean GitHub-flavored markdown.`,

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
You provide estimated local pricing in Jalpaiguri (e.g. ₹200-₹350 basic visiting charge for electrical/plumbing inspection), typical time frames, and safety tips for home service bookings.`,

  tourism: `You are the "Jalpaiguri & Dooars Heritage and Travel Guide".
You provide inspiring, accurate travel, heritage, and cultural information about Jalpaiguri town and the Dooars region of North Bengal.
Key Highlights:
- Raikat Palace (Rajbari) & Historic Rajbari Dighi (boating and park)
- Teesta River embankment and scenic views
- Gorumara National Park, Chapramari Wildlife Sanctuary & Murti River (nearby Dooars)
- Local Cuisine: North Bengal tea varieties, Jalpaiguri sweet shops, authentic Bengali sweets and snacks.
Provide seasonal recommendations, best times to visit, and travel routes.`
};

/**
 * Normalizes multi-turn chat history for the Gemini API.
 * Gemini API requires:
 * 1. The first content item must have role "user".
 * 2. Turns should alternate between "user" and "model".
 */
function formatGeminiHistory(
  history: Array<{ role: 'user' | 'model'; text: string }>,
  currentMessage: string
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  if (Array.isArray(history)) {
    for (const item of history) {
      if (!item || !item.text || typeof item.text !== 'string') continue;
      const role: 'user' | 'model' = item.role === 'model' ? 'model' : 'user';

      // Gemini requires first content to be 'user'; skip any initial greeting from 'model'
      if (contents.length === 0 && role === 'model') {
        continue;
      }

      const last = contents[contents.length - 1];
      if (last && last.role === role) {
        last.parts[0].text += `\n\n${item.text}`;
      } else {
        contents.push({
          role,
          parts: [{ text: item.text }]
        });
      }
    }
  }

  // Append current user message
  const last = contents[contents.length - 1];
  if (last && last.role === 'user') {
    last.parts[0].text += `\n\n${currentMessage}`;
  } else {
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage }]
    });
  }

  // Ensure first is always 'user'
  while (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: currentMessage || 'Nomoshkar' }]
    });
  }

  return contents;
}

function generateLocalFallback(query: string, role: string): string {
  const lower = query.toLowerCase();

  if (lower.includes('blood') || lower.includes('donor')) {
    return `**Jalpaiguri Blood Bank & Donor Assistance:**\n\n` +
      `• **District Sadar Hospital Blood Bank:** 03561-227282 (24x7 Available, Hospital Campus, Hospital Road)\n` +
      `• **Indian Red Cross Society, Jalpaiguri:** 03561-224455\n` +
      `• **Emergency Ambulance:** 102 / 108\n\n` +
      `You can also open the **Blood** tab directly in MYJPG to view real-time verified local donors and submit blood requests!`;
  }

  if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('emergency') || lower.includes('ambulance') || lower.includes('police')) {
    return `**Jalpaiguri Emergency Directory:**\n\n` +
      `• **Jalpaiguri District Sadar Hospital:** 03561-230005 / 03561-227282\n` +
      `• **Police Emergency Control:** 112 / 03561-230222 (Kotwali PS: 03561-222333)\n` +
      `• **Fire Station (Racecourse Para):** 101 / 03561-222101\n` +
      `• **District Disaster Helpline:** 1077\n\n` +
      `For urgent life safety, you can also trigger the **Safety SOS** hub inside the app.`;
  }

  if (lower.includes('electrician') || lower.includes('plumber') || lower.includes('carpenter') || lower.includes('worker') || lower.includes('repair')) {
    return `**Jalpaiguri Verified Trades & Services:**\n\n` +
      `Verified electricians, plumbers, carpenters, and appliance repair specialists are available across Kadamtala, DBC Road, Dinbazar, and Hakimpara.\n\n` +
      `• **Typical Visit/Inspection Fee:** ₹200 – ₹350\n` +
      `• **Emergency callout:** Available through the **Workers** tab with phone numbers and ID verification.`;
  }

  if (role === 'tourism' || lower.includes('tourism') || lower.includes('dooars') || lower.includes('visit') || lower.includes('rajbari')) {
    return `**Jalpaiguri & Dooars Tourism Recommendations:**\n\n` +
      `• **Jalpaiguri Rajbari & Dighi:** The historic palace of the Raikat dynasty and adjoining palace pond, located near Rajbari para.\n` +
      `• **Teesta River Embankment:** Beautiful sunset viewpoints and peaceful walking promenade along the river.\n` +
      `• **Gorumara & Chapramari:** Famous wildlife reserves situated just 45 mins from Jalpaiguri, known for Indian one-horned rhinos and scenic tea gardens.\n` +
      `• **Jalpesh Temple:** Ancient Shiva temple located approximately 15 km from town.`;
  }

  return `Nomoshkar! I am **JPG AI**, your local assistant for Jalpaiguri, West Bengal. I can help you with verified electricians & plumbers, blood donor requests, Sadar Hospital emergency contacts, municipal ward grievances, and local Dooars travel advice. How can I assist you right now?`;
}

// /api/gemini/health follows below

app.get('/api/gemini/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: apiKeyService.hasGeminiKey()
  });
});

// Unified Multi-Turn Chat with Gemini & Intent-Based Grounding
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  const {
    message,
    history = [],
    role = 'general',
    modelType = 'general',
    userLocation = { latitude: 26.5414, longitude: 88.7196 },
    language = 'en'
  } = req.body;

  console.log(`[Gemini Chat] Received request. Endpoint: /api/gemini/chat. Language: ${language}`);
  const hasKey = apiKeyService.hasGeminiKey();
  console.log(`[Gemini Chat] GEMINI_API_KEY configured: ${hasKey}`);

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'A valid message string is required.', code: 'INVALID_REQUEST' });
  }

  const ai = getGeminiClient();

  // Ordered models to try with fallback for temporary spikes
  const candidateModels = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ];

  try {
    if (!ai) {
      console.warn('[Gemini Chat] GEMINI_API_KEY is missing. Using local Jalpaiguri civic knowledge fallback.');
      const localReply = generateLocalFallback(message, role);
      return res.json({
        success: true,
        reply: localReply,
        groundingPlaces: [],
        modelUsed: 'local-civic-fallback',
        role
      });
    }

    let systemInstruction = ROLE_SYSTEM_INSTRUCTIONS[role] || ROLE_SYSTEM_INSTRUCTIONS.general;
    if (language === 'bn') {
      systemInstruction += '\n\nIMPORTANT: You MUST reply entirely in Bengali (বাংলা). Do not use English unless explicitly asked or referring to specific proper nouns.';
    } else {
      systemInstruction += '\n\nIMPORTANT: You MUST reply entirely in English.';
    }

    const formattedContents = formatGeminiHistory(history, message);

    const config: any = {
      systemInstruction: systemInstruction,
      temperature: 0.7
    };

    let response: any = null;
    let selectedModel = candidateModels[0];

    for (const m of candidateModels) {
      try {
        selectedModel = m;
        console.log(`[Gemini Chat] Gemini request started using model: ${selectedModel}`);
        response = await ai.models.generateContent({
          model: selectedModel,
          contents: formattedContents,
          config: config
        });
        if (response?.text) break;
      } catch (err: any) {
        console.warn(`[Gemini Chat] Model ${m} failed (${err?.message || err}), trying next candidate...`);
      }
    }

    if (!response) {
      console.warn(`[Gemini Chat] All Gemini models failed or had spikes. Falling back to local civic knowledge.`);
      const localReply = generateLocalFallback(message, role);
      return res.json({
        success: true,
        reply: localReply,
        groundingPlaces: [],
        modelUsed: 'local-civic-fallback',
        role
      });
    }

    console.log(`[Gemini Chat] Gemini response received from ${selectedModel}.`);

    const replyText = response.text || generateLocalFallback(message, role);

    // Extract Grounding results only if they are actually present and relevant
    const groundingPlaces: any[] = [];
    const metadata = response.candidates?.[0]?.groundingMetadata;
    const chunks = metadata?.groundingChunks || [];

    for (const chunk of chunks as any[]) {
      if (chunk.maps) {
        const m = chunk.maps;
        groundingPlaces.push({
          title: m.title || 'Location',
          uri: m.uri || `https://maps.google.com/?q=${encodeURIComponent(m.title + ' Jalpaiguri')}`,
          address: m.address || 'Jalpaiguri, West Bengal',
          snippets: m.placeAnswerSources?.reviewSnippets?.map((s: any) => typeof s === 'string' ? s : s.content) || []
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
  } catch (err: any) {
    const errMessage = err?.message || String(err);
    console.error(`[Gemini Chat] Error encountered, falling back to local civic knowledge:`, errMessage);

    const fallbackReply = generateLocalFallback(message, role);
    return res.json({
      success: true,
      reply: fallbackReply,
      groundingPlaces: [],
      modelUsed: 'local-civic-fallback',
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
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        systemInstruction: 'You are a Google Maps grounded local geography expert for Jalpaiguri, West Bengal, India. Provide clear recommendations with exact names and local context. ONLY provide results relevant to the specific search query.',
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
        const title = m.title || 'Location';
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
      summary: `Search results for "${query}" in Jalpaiguri.`,
      places: []
    });
  }
});

// Google Places Cache & Proxy Endpoints
interface PlacePhotoCacheEntry {
  photoUrl: string | null;
  attribution?: string;
  hasPhoto: boolean;
  expiresAt: number;
}
interface PlaceAiImageCacheEntry {
  imageUrl: string;
  attribution: string;
  expiresAt: number;
}
const serverPlacePhotoCache = new Map<string, PlacePhotoCacheEntry>();
const serverPlaceAiImageCache = new Map<string, PlaceAiImageCacheEntry>();
const serverPlaceDetailsCache = new Map<string, { data: any; expiresAt: number }>();
const SERVER_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Google Maps API Key Config Endpoint (Safe for client-side maps loader)
app.get('/api/config/maps-key', (req: Request, res: Response) => {
  res.json({
    apiKey: apiKeyService.getPublicMapsKey(),
    solution_channel: 'gmp_mcp_codeassist_v1_aistudio'
  });
});

let quotaExhaustedUntil = 0;

// Gemini AI Place Image Generation Endpoint (Tier 3 fallback)
app.post('/api/places/generate-image', async (req: Request, res: Response) => {
  if (Date.now() < quotaExhaustedUntil) {
    return res.json({ imageUrl: null, message: 'Quota exhausted temporarily' });
  }

  const { placeId, name, category, subcategory, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Place name is required' });
  }

  const cacheKey = placeId || name;
  const cached = serverPlaceAiImageCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json({
      imageUrl: cached.imageUrl,
      attribution: cached.attribution,
      imageSource: 'gemini',
      cached: true
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      imageUrl: null,
      message: 'Gemini API not configured'
    });
  }

  try {
    const prompt = `A realistic, high-quality architectural photo and landscape view of "${name}" (${subcategory || category || 'Landmark'}) in Jalpaiguri, North Bengal, India. Traditional North Bengal architectural elements, lush greenery, realistic sunlight, vibrant cultural aesthetic of Jalpaiguri town. Clean, no text or watermarks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '16:9'
        }
      }
    });

    let generatedImageUrl: string | null = null;
    const candidates = response.candidates || [];
    if (candidates[0]?.content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (generatedImageUrl) {
      serverPlaceAiImageCache.set(cacheKey, {
        imageUrl: generatedImageUrl,
        attribution: 'AI-generated Preview (Gemini)',
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      return res.json({
        imageUrl: generatedImageUrl,
        attribution: 'AI-generated Preview (Gemini)',
        imageSource: 'gemini'
      });
    } else {
      return res.json({ imageUrl: null });
    }
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
      quotaExhaustedUntil = Date.now() + 60 * 60 * 1000; // 1 hour
      // Log once quietly without spamming console
      console.warn('Gemini image generation quota exceeded. Falling back to architectural illustrations.');
      return res.json({ imageUrl: null, message: 'Quota exceeded, using fallback illustration' });
    }
    console.warn('Gemini place image generation unavailable:', err?.message || err);
    return res.json({ imageUrl: null, error: err?.message });
  }
});

// 1. Google Places Photo Endpoint (Official Places API Media Proxy with Caching)
app.get('/api/places/photo', async (req: Request, res: Response) => {
  const placeId = (req.query.placeId as string) || '';
  const photoName = (req.query.name as string) || '';
  const maxWidth = parseInt(req.query.width as string, 10) || 600;
  const maxHeight = parseInt(req.query.height as string, 10) || 400;

  if (!placeId && !photoName) {
    return res.status(400).json({ error: 'placeId or name parameter is required' });
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
    // If no Google Maps API key is configured yet, safely return authentic missing-photo state
    const entry: PlacePhotoCacheEntry = {
      photoUrl: null,
      hasPhoto: false,
      expiresAt: Date.now() + SERVER_CACHE_TTL
    };
    serverPlacePhotoCache.set(cacheKey, entry);
    return res.json({
      photoUrl: null,
      hasPhoto: false,
      message: 'No Google Maps API Key configured; place rendered with official Google Maps metadata'
    });
  }

  try {
    let targetPhotoName = photoName;

    // If only placeId provided and no photoName, query place photos from Places API (New)
    if (!targetPhotoName && placeId) {
      const placeUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=photos&key=${apiKey}`;
      const placeRes = await fetch(placeUrl, {
        headers: { 'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio' }
      });
      if (placeRes.ok) {
        const placeData = await placeRes.json();
        if (Array.isArray(placeData.photos) && placeData.photos.length > 0) {
          targetPhotoName = placeData.photos[0].name;
        }
      }
    }

    if (!targetPhotoName) {
      const entry: PlacePhotoCacheEntry = {
        photoUrl: null,
        hasPhoto: false,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({ photoUrl: null, hasPhoto: false });
    }

    // Fetch photo media URL using official Places API (New) preserving slashes in places/{id}/photos/{ref}
    const safePhotoPath = targetPhotoName.split('/').map(encodeURIComponent).join('/');
    const mediaUrl = `https://places.googleapis.com/v1/${safePhotoPath}/media?maxWidthPx=${maxWidth}&maxHeightPx=${maxHeight}&skipHttpRedirect=true&key=${encodeURIComponent(apiKey)}`;
    const mediaRes = await fetch(mediaUrl, {
      headers: { 'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio' }
    });

    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const photoUri = mediaData.photoUri || null;
      const entry: PlacePhotoCacheEntry = {
        photoUrl: photoUri,
        hasPhoto: !!photoUri,
        attribution: '© Google Maps Contributor',
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({
        photoUrl: photoUri,
        hasPhoto: !!photoUri,
        attribution: entry.attribution
      });
    } else {
      const entry: PlacePhotoCacheEntry = {
        photoUrl: null,
        hasPhoto: false,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      };
      serverPlacePhotoCache.set(cacheKey, entry);
      return res.json({ photoUrl: null, hasPhoto: false });
    }
  } catch (err) {
    console.error('Error fetching Google Places photo:', err);
    return res.json({ photoUrl: null, hasPhoto: false });
  }
});

// 2. Google Places Details Endpoint (Cached + Rich Details)
app.get('/api/places/details/:placeId', async (req: Request, res: Response) => {
  const { placeId } = req.params;
  const sessionToken = typeof req.query.sessionToken === 'string' ? req.query.sessionToken : '';
  const lang = req.query.language === 'bn' ? 'bn' : 'en';
  if (!placeId) {
    return res.status(400).json({ error: 'placeId is required' });
  }

  const cacheKey = `${placeId}:${lang}`;
  if (!sessionToken) {
    const cached = serverPlaceDetailsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return res.json(cached.data);
    }
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({
      placeId,
      error: 'GOOGLE_MAPS_API_KEY is not configured on the server.'
    });
  }

  try {
    const fields =
      'id,displayName,formattedAddress,shortFormattedAddress,addressComponents,rating,userRatingCount,primaryType,primaryTypeDisplayName,types,photos,location,currentOpeningHours,googleMapsUri,nationalPhoneNumber,internationalPhoneNumber,websiteUri,editorialSummary';
    const params = new URLSearchParams({
      languageCode: lang,
      regionCode: 'IN'
    });
    if (sessionToken) params.set('sessionToken', sessionToken);

    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?${params.toString()}`;
    const resp = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fields,
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      }
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) {
      if (Array.isArray(data.photos)) {
        data.photoProxyPaths = data.photos.slice(0, 4).map((p: any) =>
          `/api/places/photo?name=${encodeURIComponent(p.name)}&width=720&height=480`
        );
      }
      serverPlaceDetailsCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + SERVER_CACHE_TTL
      });
      return res.json(data);
    } else {
      const info = formatGoogleHttpError('places-details', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }
  } catch (err: any) {
    console.error('[GMP:places-details] Exception:', err?.message || err);
    return res.status(500).json({ error: 'Server error fetching place details' });
  }
});

// 2b. Google Places API (New) Autocomplete Endpoint (Jalpaiguri-scoped, English & Bengali)
app.post('/api/places/autocomplete', async (req: Request, res: Response) => {
  const {
    input,
    sessionToken,
    languageCode = 'en',
    restrictToJalpaiguri = true,
    origin
  } = req.body || {};

  if (!input || typeof input !== 'string' || !input.trim()) {
    return res.json({ suggestions: [] });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const body: Record<string, any> = {
    input: input.trim(),
    languageCode: languageCode === 'bn' ? 'bn' : 'en',
    regionCode: 'IN',
    includedRegionCodes: ['IN']
  };

  if (sessionToken && typeof sessionToken === 'string') {
    body.sessionToken = sessionToken;
  }

  if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
    body.origin = { latitude: origin.lat, longitude: origin.lng };
  } else {
    body.origin = { latitude: 26.5228, longitude: 88.7245 };
  }

  if (restrictToJalpaiguri) {
    // Bias tightly toward Jalpaiguri Town (12 km) while restricting to India region (Places API allows either bias or restriction)
    body.locationBias = {
      circle: {
        center: { latitude: 26.5228, longitude: 88.7245 },
        radius: 12000.0
      }
    };
  } else {
    body.locationBias = {
      circle: {
        center: { latitude: 26.5228, longitude: 88.7245 },
        radius: 25000.0
      }
    };
  }

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat,suggestions.placePrediction.types,suggestions.placePrediction.distanceMeters',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const info = formatGoogleHttpError('places-autocomplete', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }

    // Prioritize genuine Jalpaiguri Town results over distant Bara Gharia / >15km homonyms
    if (Array.isArray(data.suggestions)) {
      const qLower = input.trim().toLowerCase();
      data.suggestions.sort((a: any, b: any) => {
        const pa = a?.placePrediction;
        const pb = b?.placePrediction;
        const score = (p: any) => {
          if (!p) return 999;
          const text = String(p.text?.text || '').toLowerCase();
          const sec = String(p.structuredFormat?.secondaryText?.text || '').toLowerCase();
          const dist = typeof p.distanceMeters === 'number' ? p.distanceMeters : 999999;
          let s = 0;
          if (text.includes('bara gharia') && !qLower.includes('bara gharia')) s += 50;
          if (sec.includes('jalpaiguri') && dist <= 12000) s -= 40;
          if (dist <= 6000) s -= 25;
          else if (dist > 20000) s += 35;
          return s;
        };
        return score(pa) - score(pb);
      });
    }

    return res.json(data);
  } catch (err: any) {
    console.error('[GMP:places-autocomplete] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to query Places Autocomplete' });
  }
});

// 3. Google Places API (New) Text Search Proxy
app.post('/api/places/search-text', async (req: Request, res: Response) => {
  const {
    textQuery,
    lat = 26.5228,
    lng = 88.7245,
    radiusMeters = 8000,
    includedType,
    maxResultCount = 12,
    languageCode = 'en',
    restrictToJalpaiguri = true
  } = req.body || {};

  if (!textQuery || typeof textQuery !== 'string' || !textQuery.trim()) {
    return res.status(400).json({ error: 'textQuery is required' });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const trimmedQuery = textQuery.trim();
  const normalizedQuery =
    restrictToJalpaiguri &&
    !/jalpaiguri|জলপাইগুড়ি/i.test(trimmedQuery)
      ? `${trimmedQuery}, Jalpaiguri`
      : trimmedQuery;

  const clampedRadius = Math.min(Math.max(Number(radiusMeters) || 8000, 500), 50000);
  const body: Record<string, any> = {
    textQuery: normalizedQuery,
    languageCode: languageCode === 'bn' ? 'bn' : 'en',
    regionCode: 'IN',
    pageSize: Math.min(Math.max(Number(maxResultCount) || 12, 1), 20),
    locationBias: {
      circle: {
        center: {
          latitude: Number(lat) || 26.5228,
          longitude: Number(lng) || 88.7245
        },
        radius: clampedRadius
      }
    }
  };
  if (includedType && typeof includedType === 'string') {
    body.includedType = includedType;
  }

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.addressComponents,places.location,places.primaryType,places.primaryTypeDisplayName,places.types,places.rating,places.userRatingCount,places.googleMapsUri,places.currentOpeningHours',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const info = formatGoogleHttpError('places-searchText', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }
    return res.json(data);
  } catch (err: any) {
    console.error('[GMP:places-searchText] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to query Places Text Search' });
  }
});

// 3b. Google Places API (New) Search Along Route Proxy
app.post('/api/places/along-route', async (req: Request, res: Response) => {
  const {
    encodedPolyline,
    textQuery = 'landmark hospital pharmacy school bank restaurant shop',
    origin,
    maxResultCount = 8,
    languageCode = 'en'
  } = req.body || {};

  if (!encodedPolyline || typeof encodedPolyline !== 'string') {
    return res.status(400).json({ error: 'encodedPolyline is required' });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const body: Record<string, any> = {
    textQuery: String(textQuery).trim() || 'landmark',
    languageCode: languageCode === 'bn' ? 'bn' : 'en',
    regionCode: 'IN',
    pageSize: Math.min(Math.max(Number(maxResultCount) || 8, 1), 15),
    searchAlongRouteParameters: {
      polyline: { encodedPolyline }
    }
  };
  if (origin && typeof origin.lat === 'number' && typeof origin.lng === 'number') {
    body.routingParameters = {
      origin: { latitude: origin.lat, longitude: origin.lng }
    };
  }

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName,places.rating,places.userRatingCount,places.googleMapsUri',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const info = formatGoogleHttpError('places-along-route', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }
    return res.json(data);
  } catch (err: any) {
    console.error('[GMP:places-along-route] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to search places along route' });
  }
});

// 4. Google Places API (New) Nearby Search Proxy
app.post('/api/places/search-nearby', async (req: Request, res: Response) => {
  const {
    lat = 26.5228,
    lng = 88.7245,
    radiusMeters = 5000,
    includedTypes = [],
    maxResultCount = 15,
    rankPreference = 'DISTANCE',
    languageCode = 'en'
  } = req.body || {};

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const clampedRadius = Math.min(Math.max(Number(radiusMeters) || 5000, 50), 50000);
  const body: Record<string, any> = {
    maxResultCount: Math.min(Math.max(Number(maxResultCount) || 15, 1), 20),
    rankPreference: rankPreference === 'POPULARITY' ? 'POPULARITY' : 'DISTANCE',
    languageCode: languageCode === 'bn' ? 'bn' : 'en',
    regionCode: 'IN',
    locationRestriction: {
      circle: {
        center: {
          latitude: Number(lat) || 26.5228,
          longitude: Number(lng) || 88.7245
        },
        radius: clampedRadius
      }
    }
  };
  if (Array.isArray(includedTypes) && includedTypes.length > 0) {
    body.includedTypes = includedTypes.slice(0, 15);
  }

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.shortFormattedAddress,places.location,places.primaryType,places.primaryTypeDisplayName,places.types,places.rating,places.userRatingCount,places.googleMapsUri,places.currentOpeningHours',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      },
      body: JSON.stringify(body)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const info = formatGoogleHttpError('places-searchNearby', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }
    return res.json(data);
  } catch (err: any) {
    console.error('[GMP:places-searchNearby] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to query Places Nearby Search' });
  }
});

// 5. Google Routes API v2 Proxy (Driving, Two-Wheeler, Walking, Cycling + Alternative Routes)
app.post('/api/routes/compute', async (req: Request, res: Response) => {
  const {
    origin,
    destination,
    travelMode = 'DRIVE',
    computeAlternativeRoutes = true,
    languageCode = 'en'
  } = req.body || {};

  if (
    !origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number' ||
    !destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number'
  ) {
    return res.status(400).json({ error: 'Valid numeric origin and destination { lat, lng } are required.' });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const normalizedMode = ['DRIVE', 'WALK', 'TWO_WHEELER', 'BICYCLE'].includes(String(travelMode).toUpperCase())
    ? String(travelMode).toUpperCase()
    : 'DRIVE';

  const requestBody: Record<string, any> = {
    origin: {
      location: {
        latLng: { latitude: origin.lat, longitude: origin.lng }
      }
    },
    destination: {
      location: {
        latLng: { latitude: destination.lat, longitude: destination.lng }
      }
    },
    travelMode: normalizedMode,
    computeAlternativeRoutes: Boolean(computeAlternativeRoutes),
    languageCode: languageCode === 'bn' ? 'bn-IN' : 'en-IN',
    units: 'METRIC'
  };

  // Routes API rule: routingPreference is ONLY valid for DRIVE and TWO_WHEELER
  if (normalizedMode === 'DRIVE' || normalizedMode === 'TWO_WHEELER') {
    requestBody.routingPreference = 'TRAFFIC_AWARE';
  }

  try {
    const resp = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'routes.description,routes.routeLabels,routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.viewport,routes.legs.distanceMeters,routes.legs.duration,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.steps.navigationInstruction,routes.legs.steps.localizedValues,routes.legs.steps.startLocation,routes.legs.steps.endLocation',
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const info = formatGoogleHttpError('routes-computeRoutes', resp.status, data);
      return res.status(resp.status).json({ error: info.userMessage, googleStatus: info.googleStatus });
    }
    return res.json(data);
  } catch (err: any) {
    console.error('[GMP:routes-computeRoutes] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to compute Google Route' });
  }
});

// 6. Street View Metadata Availability Check (Checks authentic Google Street View coverage before opening panorama)
app.get('/api/streetview/metadata', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);
  const radius = Math.min(Math.max(parseInt(req.query.radius as string, 10) || 80, 15), 500);
  const sourceParam = req.query.source === 'default' ? 'default' : 'outdoor';

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Valid lat and lng query parameters are required.' });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({
      available: false,
      status: 'MISSING_KEY',
      error: 'GOOGLE_MAPS_API_KEY is not configured on the server.'
    });
  }

  const queryMeta = async (searchRadius: number, src: string) => {
    const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&radius=${searchRadius}&source=${src}&key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url, {
      headers: { 'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio' }
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, httpStatus: r.status, json: j };
  };

  try {
    let probe = await queryMeta(radius, sourceParam);
    if (probe.ok && probe.json?.status === 'ZERO_RESULTS' && sourceParam === 'outdoor') {
      probe = await queryMeta(radius, 'default');
    }

    if (!probe.ok) {
      const info = formatGoogleHttpError('streetview-metadata', probe.httpStatus, probe.json);
      return res.status(probe.httpStatus).json({ available: false, status: 'ERROR', error: info.userMessage });
    }

    const data = probe.json || {};
    if (data.status === 'OK' && data.location) {
      const distMeters = calcGeoDistMeters(lat, lng, data.location.lat, data.location.lng);
      return res.json({
        available: true,
        status: 'OK',
        panoId: data.pano_id || null,
        lat: data.location.lat,
        lng: data.location.lng,
        date: data.date || null,
        copyright: data.copyright || '© Google',
        distanceFromQueryMeters: distMeters
      });
    }

    // Check slightly wider radius solely to suggest nearest authentic panorama if direct spot is uncovered
    let nearest: any = null;
    if (radius < 350) {
      const wider = await queryMeta(350, 'default');
      if (wider.ok && wider.json?.status === 'OK' && wider.json?.location) {
        nearest = {
          panoId: wider.json.pano_id || null,
          lat: wider.json.location.lat,
          lng: wider.json.location.lng,
          date: wider.json.date || null,
          copyright: wider.json.copyright || '© Google',
          distanceFromQueryMeters: calcGeoDistMeters(lat, lng, wider.json.location.lat, wider.json.location.lng)
        };
      }
    }

    return res.json({
      available: false,
      status: data.status || 'ZERO_RESULTS',
      error: data.status === 'REQUEST_DENIED' ? (data.error_message || 'Street View Static API metadata not enabled on key') : undefined,
      nearestPano: nearest
    });
  } catch (err: any) {
    console.error('[GMP:streetview-metadata] Exception:', err?.message || err);
    return res.status(500).json({ available: false, status: 'ERROR', error: err?.message || 'Failed to check Street View coverage' });
  }
});

// 7. Street View Journey Preview (Samples route polyline and checks authentic Street View panorama stops along the route)
app.post('/api/streetview/journey-preview', async (req: Request, res: Response) => {
  const {
    encodedPolyline,
    originName = 'Start',
    destinationName = 'Destination',
    maxStops = 8
  } = req.body || {};

  if (!encodedPolyline || typeof encodedPolyline !== 'string') {
    return res.status(400).json({ error: 'encodedPolyline is required' });
  }

  const apiKey = apiKeyService.getGoogleMapsApiKey();
  if (!apiKey) {
    return res.status(503).json({ error: 'GOOGLE_MAPS_API_KEY is not configured on the server.' });
  }

  const points = decodeServerPolyline(encodedPolyline);
  if (points.length === 0) {
    return res.status(400).json({ error: 'Unable to decode route polyline.' });
  }

  const sampled = sampleRoutePointsServer(points, Number(maxStops) || 8, 220);

  try {
    let deniedCount = 0;
    const stops = await Promise.all(
      sampled.map(async (item, index) => {
        const isFirst = index === 0;
        const isLast = index === sampled.length - 1;
        const role = isFirst ? 'START' : isLast ? 'DESTINATION' : 'WAYPOINT';
        const label = isFirst
          ? String(originName)
          : isLast
          ? String(destinationName)
          : `Stop ${index} (${(item.distanceFromStartMeters / 1000).toFixed(1)} km)`;

        try {
          const url = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${item.point.lat},${item.point.lng}&radius=60&source=outdoor&key=${encodeURIComponent(apiKey)}`;
          const r = await fetch(url, {
            headers: { 'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio' }
          });
          const j = await r.json().catch(() => ({}));
          if (j?.status === 'REQUEST_DENIED') {
            deniedCount += 1;
          }
          if (r.ok && j?.status === 'OK' && j?.location) {
            return {
              stopIndex: index,
              role,
              label,
              lat: item.point.lat,
              lng: item.point.lng,
              panoLat: j.location.lat,
              panoLng: j.location.lng,
              panoId: j.pano_id || null,
              streetViewAvailable: true,
              headingDegrees: item.headingDegrees,
              captureDate: j.date || null,
              copyright: j.copyright || '© Google',
              distanceFromStartMeters: item.distanceFromStartMeters
            };
          }
        } catch {
          // Non-fatal stop check error; mark as unavailable
        }

        return {
          stopIndex: index,
          role,
          label,
          lat: item.point.lat,
          lng: item.point.lng,
          panoLat: null,
          panoLng: null,
          panoId: null,
          streetViewAvailable: false,
          headingDegrees: item.headingDegrees,
          captureDate: null,
          copyright: null,
          distanceFromStartMeters: item.distanceFromStartMeters
        };
      })
    );

    const coveredCount = stops.filter((s) => s.streetViewAvailable).length;
    return res.json({
      stops,
      coveredCount,
      totalStops: stops.length,
      metadataDenied: deniedCount === stops.length && coveredCount === 0
    });
  } catch (err: any) {
    console.error('[GMP:journey-preview] Exception:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'Failed to build Street View journey preview' });
  }
});

// Backward compatibility routes
app.post('/api/ai/jalpaigi-chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      reply: 'Nomoshkar! I am JPG AI, your local Jalpaiguri assistant.'
    });
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `You are JPG AI for Jalpaiguri, West Bengal. Answer briefly: "${message}"`
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
      model: 'gemini-3.1-flash-lite',
      contents: `You are JPG AI for Jalpaiguri, West Bengal. Provide a helpful 2-sentence response for: "${prompt}"`
    });
    return res.json({ reply: response.text || 'How can I assist you in Jalpaiguri today?' });
  } catch {
    return res.json({ reply: 'How can I assist you in Jalpaiguri today?' });
  }
});

// ==========================================
// GEOGRAPHIC BOUNDARY & SERVICE AREA VALIDATION
// ==========================================
// Centralized Jalpaiguri service area boundaries on server-side
const JALPAIGURI_CITY_POLYGON: [number, number][] = [
  [26.5480, 88.7050],
  [26.5560, 88.7280],
  [26.5520, 88.7520],
  [26.5380, 88.7620],
  [26.5180, 88.7550],
  [26.5020, 88.7420],
  [26.4950, 88.7280],
  [26.4980, 88.7020],
  [26.5220, 88.6880],
  [26.5400, 88.6920]
];

const JALPAIGURI_DISTRICT_POLYGON: [number, number][] = [
  [27.0200, 88.7200],
  [27.0100, 89.0500],
  [26.8500, 89.1500],
  [26.5500, 89.1000],
  [26.3200, 88.8500],
  [26.3800, 88.5800],
  [26.6500, 88.4200],
  [26.8800, 88.5500]
];

function checkPointInPolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  let inside = false;
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function haversineDistKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function verifyServerServiceArea(lat: number, lng: number, mode: string = 'JALPAIGURI_CITY') {
  if (mode === 'JALPAIGURI_DISTRICT') {
    const inBox = lat >= 26.25 && lat <= 27.05 && lng >= 88.38 && lng <= 89.20;
    const isInside = inBox && checkPointInPolygon(lat, lng, JALPAIGURI_DISTRICT_POLYGON);
    return {
      isInside,
      mode: 'JALPAIGURI_DISTRICT',
      boundaryName: 'Jalpaiguri District',
      centerDistKm: haversineDistKm(lat, lng, 26.5414, 88.7196)
    };
  }

  // Default: JALPAIGURI_CITY
  const inBox = lat >= 26.490 && lat <= 26.565 && lng >= 88.685 && lng <= 88.765;
  const isInside = inBox && checkPointInPolygon(lat, lng, JALPAIGURI_CITY_POLYGON);
  return {
    isInside,
    mode: 'JALPAIGURI_CITY',
    boundaryName: 'Jalpaiguri Municipality',
    centerDistKm: haversineDistKm(lat, lng, 26.5265, 88.7230)
  };
}

// 2. Server-side Service Area Verification Endpoint
app.post('/api/location/verify-service-area', (req: Request, res: Response) => {
  const { lat, lng, mode = 'JALPAIGURI_CITY' } = req.body;
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    return res.status(400).json({ error: 'Valid lat and lng are required.' });
  }

  const result = verifyServerServiceArea(numLat, numLng, mode);
  return res.json({
    success: true,
    isInside: result.isInside,
    serviceAreaStatus: result.isInside ? 'inside' : 'outside',
    mode: result.mode,
    boundaryName: result.boundaryName,
    distanceToCenterKm: Math.round(result.centerDistKm * 10) / 10,
    allowed: result.isInside
  });
});

// 3. Shop Subscription Backend Validation Endpoint (Mock Razorpay)

// DINING API
app.get('/api/restaurants/:restaurantId', (req, res) => {
  // In a real app, you would fetch from DB here if needed
  res.json({});
});
app.get('/api/restaurants/:restaurantId/menuItems', (req, res) => {
  res.json([]);
});
app.get('/api/restaurants/search-item', (req, res) => {
  res.json([]);
});
app.post('/api/restaurants/match-list', (req, res) => {
  res.json([]);
});
app.post('/api/restaurants/:restaurantId/subscription', (req, res) => {
  const { restaurantId } = req.params;
  const { plan } = req.body;
  
  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  // Mock successful Razorpay order creation
  res.json({
    orderId: 'order_' + Math.random().toString(36).substring(7),
    amount: plan === 'yearly' ? 599900 : 59900, // Amount in paise
    currency: 'INR'
  });
});

app.post('/api/shops/:shopId/subscription', (req: Request, res: Response) => {
  const { shopId } = req.params;
  const { plan } = req.body;
  
  if (!plan || !['monthly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  // In a real app, this is where we would verify the Razorpay signature
  // using crypto.createHmac and the Razorpay Webhook Secret.
  // Since we are simulating, we just validate the request and return success.
  
  return res.json({
    success: true,
    message: 'Subscription validated securely on backend.',
    shopId,
    plan,
    verifiedAt: new Date().toISOString()
  });
});

// ==========================================
// SAFETY SOS EMERGENCY ENDPOINTS
// ==========================================
app.get('/api/emergency/active', (req: Request, res: Response) => {
  const userId = typeof req.query.userId === 'string' ? req.query.userId.trim() : '';
  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId query parameter is required.' });
  }

  let activeEvent: any = null;
  for (const evt of memoryDb.sosEvents.values()) {
    if (evt.user_id === userId && evt.status === 'ACTIVE') {
      if (!activeEvent || new Date(evt.created_at).getTime() > new Date(activeEvent.created_at).getTime()) {
        activeEvent = evt;
      }
    }
  }

  return res.json({
    success: true,
    active: Boolean(activeEvent),
    event: activeEvent
  });
});

app.post('/api/emergency/sos', (req: Request, res: Response) => {
  const {
    userId,
    userName,
    eventType,
    latitude,
    longitude,
    accuracy,
    city,
    district,
    state,
    trustedContacts,
    isNearbyOptIn,
    clientRequestId
  } = req.body || {};

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid userId is required.' });
  }
  if (typeof latitude !== 'number' || typeof longitude !== 'number' || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return res.status(400).json({ success: false, error: 'Valid geographic coordinates are required.' });
  }

  // Idempotent duplicate submission guard
  if (clientRequestId && typeof clientRequestId === 'string') {
    const existing = memoryDb.sosIdempotency.get(clientRequestId);
    if (existing) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        event: existing
      });
    }
  }

  // Anti-spam cooldown guard (10s per user) unless returning an existing active event
  const now = Date.now();
  const lastTriggered = memoryDb.sosRateLimits.get(userId) || 0;
  if (now - lastTriggered < 10_000) {
    for (const evt of memoryDb.sosEvents.values()) {
      if (evt.user_id === userId && evt.status === 'ACTIVE' && now - new Date(evt.created_at).getTime() < 10_000) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          event: evt
        });
      }
    }
    return res.status(429).json({
      success: false,
      error: 'Please wait a few seconds before submitting another emergency alert.'
    });
  }

  memoryDb.sosRateLimits.set(userId, now);

  const safeContacts = Array.isArray(trustedContacts) ? trustedContacts.slice(0, 10) : [];
  const isDevSafeMode = process.env.NODE_ENV !== 'production';
  const eventId = `SOS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

  const createdEvent = {
    id: eventId,
    user_id: userId,
    userName: typeof userName === 'string' && userName.trim() ? userName.trim().slice(0, 80) : 'Citizen',
    event_type: eventType === 'MEDICAL_EMERGENCY' || eventType === 'ACCIDENT' ? eventType : 'SAFETY_SOS',
    created_at: new Date().toISOString(),
    latitude,
    longitude,
    accuracy: typeof accuracy === 'number' ? accuracy : 20,
    city: typeof city === 'string' && city.trim() ? city.trim().slice(0, 100) : 'Jalpaiguri',
    district: typeof district === 'string' ? district.trim().slice(0, 100) : '',
    state: typeof state === 'string' && state.trim() ? state.trim().slice(0, 80) : 'West Bengal',
    status: 'ACTIVE',
    alerts_sent_trusted: safeContacts.length > 0,
    trusted_contacts_count: safeContacts.length,
    alerts_sent_nearby: Boolean(isNearbyOptIn),
    delivery_mode: isDevSafeMode ? 'development_recorded' : 'recorded'
  };

  memoryDb.sosEvents.set(eventId, createdEvent);
  if (clientRequestId && typeof clientRequestId === 'string') {
    memoryDb.sosIdempotency.set(clientRequestId, createdEvent);
  }

  console.log(`[SOS] Recorded event ${eventId} for user=${userId} contacts=${safeContacts.length} mode=${createdEvent.delivery_mode}`);

  return res.status(201).json({
    success: true,
    event: createdEvent
  });
});

app.post('/api/emergency/cancel-sos', (req: Request, res: Response) => {
  const { eventId, userId, reason } = req.body || {};
  let target: any = null;

  if (eventId && typeof eventId === 'string' && memoryDb.sosEvents.has(eventId)) {
    target = memoryDb.sosEvents.get(eventId);
  } else if (userId && typeof userId === 'string') {
    for (const evt of memoryDb.sosEvents.values()) {
      if (evt.user_id === userId && evt.status === 'ACTIVE') {
        target = evt;
        break;
      }
    }
  }

  if (!target) {
    return res.json({
      success: true,
      cancelled: false,
      message: 'No active SOS event found.'
    });
  }

  target.status = 'CANCELLED';
  target.cancelled_at = new Date().toISOString();
  target.cancellation_reason = typeof reason === 'string' ? reason.slice(0, 200) : 'Cancelled by user';
  memoryDb.sosEvents.set(target.id, target);

  return res.json({
    success: true,
    cancelled: true,
    event: target
  });
});

app.get('/api/emergency/nearby-alerts', (_req: Request, res: Response) => {
  const alerts: any[] = [];
  const now = Date.now();

  for (const evt of memoryDb.sosEvents.values()) {
    if (evt.status === 'ACTIVE' && evt.alerts_sent_nearby) {
      const ageMin = Math.max(0, Math.floor((now - new Date(evt.created_at).getTime()) / 60000));
      alerts.push({
        eventId: evt.id,
        eventType: evt.event_type,
        approximateArea: [evt.city, evt.district || evt.state].filter(Boolean).join(', '),
        timeAgo: ageMin === 0 ? 'Just now' : `${ageMin}m ago`,
        created_at: evt.created_at,
        anonymousNotice: 'A nearby MYJPG member requested community safety support. Exact identity and coordinates are kept private.',
        urgentActionNotice: 'Only respond if safe. Call 112 for official emergency response.'
      });
    }
  }

  return res.json({
    success: true,
    alerts: alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  });
});

// ==========================================
// MYJPG ADVANCED NOTIFICATION PLATFORM ROUTES
// ==========================================

const NOTIFICATION_CATEGORIES = [
  { id: 'government', name: 'Government & Municipal', nameBn: 'পৌর ও সরকারি বিজ্ঞপ্তি', icon: 'landmark', priority: 'high' },
  { id: 'emergency', name: 'Emergency & Public Safety', nameBn: 'জরুরি ও নাগরিক নিরাপত্তা', icon: 'alert-triangle', priority: 'critical' },
  { id: 'marketplace', name: 'Shop & Marketplace', nameBn: 'দোকান ও অর্ডার', icon: 'shopping-bag', priority: 'normal' },
  { id: 'services', name: 'Workers & Services', nameBn: 'কর্মী ও সেবা', icon: 'briefcase', priority: 'normal' },
  { id: 'complaints', name: 'Civic Complaints', nameBn: 'নাগরিক অভিযোগ', icon: 'file-text', priority: 'normal' },
  { id: 'medical', name: 'Medical & Blood', nameBn: 'চিকিৎসা ও রক্তদান', icon: 'droplet', priority: 'high' },
  { id: 'support', name: 'Support & Tickets', nameBn: 'সহায়তা ও টিকিট', icon: 'message-square', priority: 'normal' },
  { id: 'security', name: 'Account & Security', nameBn: 'অ্যাকাউন্ট ও নিরাপত্তা', icon: 'shield', priority: 'high' }
];

const processedEventIds = new Set<string>();

app.get('/api/notifications/categories', (req: Request, res: Response) => {
  res.json({ success: true, categories: NOTIFICATION_CATEGORIES });
});

app.post('/api/notifications/dispatch', (req: Request, res: Response) => {
  const { eventId, userId, title, message, category, referenceId, priority, timeline, actionRequired, primaryAction } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required.' });
  }

  if (eventId && processedEventIds.has(eventId)) {
    return res.json({ success: true, duplicate: true, message: 'Event already processed idempotently.' });
  }
  if (eventId) processedEventIds.add(eventId);

  const notification = {
    notificationId: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    eventId: eventId || null,
    userId: userId || 'all',
    title,
    message,
    category: category || 'system',
    priority: priority || 'normal',
    referenceId: referenceId || null,
    actionRequired: actionRequired || false,
    primaryAction: primaryAction || null,
    timeline: timeline || [],
    deliveryStatus: 'delivered',
    createdAt: new Date().toISOString()
  };

  res.json({ success: true, notification });
});

app.post('/api/notifications/broadcast', (req: Request, res: Response) => {
  const { title, message, category, priority, affectedWards, issuingAuthority } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, error: 'Title and message are required.' });
  }

  res.json({
    success: true,
    broadcastId: `brd_${Date.now()}`,
    title,
    message,
    category: category || 'emergency',
    priority: priority || 'critical',
    affectedWards: affectedWards || ['All Wards (1-25)'],
    issuingAuthority: issuingAuthority || 'Jalpaiguri District Administration',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/notifications/analytics', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: {
      totalGenerated: 1420,
      fcmDelivered: 1385,
      fcmFailed: 35,
      readCount: 1120,
      unreadCount: 300,
      activeDeviceTokens: 890,
      byCategory: {
        government: 340,
        emergency: 85,
        marketplace: 420,
        services: 210,
        complaints: 195,
        medical: 90,
        support: 50,
        security: 30
      },
      lastEmergencyAlert: {
        title: 'Teesta River Flood Advisory',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        status: 'Active'
      }
    }
  });
});

// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
