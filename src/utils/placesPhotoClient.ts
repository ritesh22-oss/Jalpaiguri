/**
 * MYJPG - Google Places Photo Client & Multi-Tier Fallback Engine
 * 
 * Strict Requirement:
 * EVERY place card ALWAYS has a visible image. NO place card should ever appear without an image.
 * 
 * Priority Hierarchy:
 * 1. Google Places official photo (via /api/places/photo)
 * 2. Existing database photo (place.photoUrl)
 * 3. Gemini Image Generation API (via /api/places/generate-image)
 * 4. Category-specific Bengal architectural SVG illustration fallback
 * 
 * Attribution Rules:
 * - Real Google photo -> 'Google Photo' badge
 * - Curated DB photo -> 'Verified Photo' badge
 * - Gemini AI photo -> 'AI Preview' / 'AI-generated' badge (NEVER labeled as real)
 * - Category vector -> 'Local Illustration' badge
 */

import { ExplorePlaceItem } from '../types';
import { getCategoryIllustrationUri } from './placeCategoryIllustrations';
import { apiClient } from './apiClient';

export type PlaceImageSourceType = 'google' | 'database' | 'gemini' | 'category_illustration' | 'admin_approved';

export interface ResolvedPlaceImage {
  imageUrl: string;
  sourceType: PlaceImageSourceType;
  badgeLabel: 'Google Photo' | 'Verified Photo' | 'AI Preview' | 'Local Illustration' | 'Stock Photo' | 'Community Photo' | 'Verified Community Photo';
  attribution?: string;
  isAiGenerated: boolean;
}

interface CachedPhotoData {
  photoUrl: string | null;
  attribution?: string;
  hasPhoto: boolean;
  timestamp: number;
}

const MEMORY_CACHE = new Map<string, CachedPhotoData>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const LOCAL_STORAGE_PREFIX = 'jpg_place_photo_';
const AI_IMAGE_STORAGE_PREFIX = 'jpg_place_ai_img_';
let clientAiQuotaExhaustedUntil = 0;

function getStorageCache(key: string): CachedPhotoData | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed: CachedPhotoData = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${key}`);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setStorageCache(key: string, data: CachedPhotoData) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota limits
  }
}

export async function fetchPlacePhoto(
  placeId: string,
  photoResourceName?: string,
  maxWidth = 600,
  maxHeight = 400
): Promise<{ photoUrl: string | null; attribution?: string; hasPhoto: boolean }> {
  const cacheKey = `${placeId}_${maxWidth}`;

  // 1. Check in-memory cache
  const inMem = MEMORY_CACHE.get(cacheKey);
  if (inMem && Date.now() - inMem.timestamp < CACHE_TTL_MS) {
    return inMem;
  }

  // 2. Check localStorage cache
  const inStore = getStorageCache(cacheKey);
  if (inStore) {
    MEMORY_CACHE.set(cacheKey, inStore);
    return inStore;
  }

  // 3. Dynamic fetch via centralized apiClient to prevent CORS and safeguard API credentials
  try {
    const data = await apiClient.getPlacePhoto({
      placeId,
      name: photoResourceName,
      width: maxWidth,
      height: maxHeight
    });

    const result: CachedPhotoData = {
      photoUrl: data.photoUrl || null,
      attribution: data.attribution,
      hasPhoto: Boolean(data.photoUrl),
      timestamp: Date.now()
    };

    MEMORY_CACHE.set(cacheKey, result);
    setStorageCache(cacheKey, result);
    return result;
  } catch {
    // Silently handle error and return missing-photo state
    const fallbackData: CachedPhotoData = {
      photoUrl: null,
      hasPhoto: false,
      timestamp: Date.now()
    };
    MEMORY_CACHE.set(cacheKey, fallbackData);
    return fallbackData;
  }
}


/**
 * Resolves the absolute best available image for any Explore Place
 * Guarantees that a high-resolution, thematic image is ALWAYS returned.
 */
export async function resolvePlaceImage(
  place: ExplorePlaceItem,
  maxWidth = 600,
  maxHeight = 400
): Promise<ResolvedPlaceImage> {
  // Step 0: Priority to Administrator approved custom photo submission
  try {
    const customThumbs = JSON.parse(localStorage.getItem('jpg_custom_thumbnails') || '{}');
    if (customThumbs[place.placeId]) {
      return {
        imageUrl: customThumbs[place.placeId],
        sourceType: 'database',
        badgeLabel: 'Verified Community Photo',
        attribution: 'Jalpaiguri Citizen & Admin Verified',
        isAiGenerated: false
      };
    }
  } catch {}

  // Step 1: Attempt official Google Places photo
  try {
    const googleRes = await fetchPlacePhoto(place.placeId, place.photoResourceName, maxWidth, maxHeight);
    if (googleRes.hasPhoto && googleRes.photoUrl) {
      return {
        imageUrl: googleRes.photoUrl,
        sourceType: 'google',
        badgeLabel: 'Google Photo',
        attribution: googleRes.attribution || '© Google Maps Contributor',
        isAiGenerated: false
      };
    }
  } catch {
    // Proceed to next tier
  }

  // Step 2: Check database curated photo
  if (place.photoUrl) {
    return {
      imageUrl: place.photoUrl,
      sourceType: 'database',
      badgeLabel: 'Verified Photo',
      attribution: place.photoAttribution || 'Verified Landmark Archive',
      isAiGenerated: false
    };
  }

  // Step 3: Check cached or request Gemini AI image generation
  try {
    const aiStorageKey = `${AI_IMAGE_STORAGE_PREFIX}${place.placeId}`;
    const cachedAi = localStorage.getItem(aiStorageKey);
    if (cachedAi) {
      const parsed = JSON.parse(cachedAi);
      if (parsed.imageUrl) {
        return {
          imageUrl: parsed.imageUrl,
          sourceType: 'gemini',
          badgeLabel: 'AI Preview',
          attribution: 'AI-generated Preview (Gemini)',
          isAiGenerated: true
        };
      }
    }

    if (Date.now() < clientAiQuotaExhaustedUntil) {
      // Quota is temporarily exhausted; skip request and proceed to architectural illustration fallback immediately
      return {
        imageUrl: getCategoryIllustrationUri(place.category),
        sourceType: 'category_illustration',
        badgeLabel: 'Local Illustration',
        attribution: 'Jalpaiguri Municipal Heritage Illustration',
        isAiGenerated: false
      };
    }

    const aiData = await apiClient.generatePlaceImage({
      placeId: place.placeId,
      name: place.name,
      category: place.category,
      subcategory: place.subcategory,
      address: place.formattedAddress
    });

    if (aiData?.imageUrl) {
      try {
        localStorage.setItem(aiStorageKey, JSON.stringify({ imageUrl: aiData.imageUrl }));
      } catch {
        // Ignore quota
      }
      return {
        imageUrl: aiData.imageUrl,
        sourceType: 'gemini',
        badgeLabel: 'AI Preview',
        attribution: aiData.attribution || 'AI-generated Preview (Gemini)',
        isAiGenerated: true
      };
    } else {
      // If server returned quota or null, avoid hammering API for 10 minutes
      clientAiQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
    }
  } catch {
    clientAiQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
    // Proceed to Tier 4
  }

  // Step 4: Category-Specific Bengal Architectural Vector Illustration Fallback
  // Guarantees zero blank spaces or broken icons under all circumstances
  return {
    imageUrl: getCategoryIllustrationUri(place.category),
    sourceType: 'category_illustration',
    badgeLabel: 'Local Illustration',
    attribution: 'Jalpaiguri Municipal Heritage Illustration',
    isAiGenerated: false
  };
}

export function getAdminPlaceThumbnails(placeId: string): string[] {
  try {
    const raw = localStorage.getItem(`jpg_admin_thumbnails_${placeId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(0, 4);
    }
  } catch {}
  return [];
}

export function setAdminPlaceThumbnails(placeId: string, photos: string[]): void {
  try {
    localStorage.setItem(`jpg_admin_thumbnails_${placeId}`, JSON.stringify(photos.slice(0, 4)));
    window.dispatchEvent(new Event('jpg_thumbnails_updated'));
  } catch {}
}

export function getUserPlacePhotos(placeId: string): string[] {
  try {
    const raw = localStorage.getItem(`jpg_user_place_photos_${placeId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function addUserPlacePhoto(placeId: string, photoUrl: string): void {
  try {
    const existing = getUserPlacePhotos(placeId);
    if (!existing.includes(photoUrl)) {
      const updated = [photoUrl, ...existing];
      localStorage.setItem(`jpg_user_place_photos_${placeId}`, JSON.stringify(updated));
      window.dispatchEvent(new Event('jpg_thumbnails_updated'));
    }
  } catch {}
}

