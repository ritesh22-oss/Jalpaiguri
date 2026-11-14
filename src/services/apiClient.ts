import { auth } from '../lib/firebase';

/**
 * Centralized Client Utility for Making Authorized API Requests
 * 
 * Capabilities:
 * - Automatically attaches Firebase Auth tokens (`Authorization: Bearer <token>`)
 * - Configures request timeouts and abort controllers
 * - Provides typed methods for Gemini AI and Google Maps / Places services
 * - Graceful error handling and network resilience
 */

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  public status: number;
  public endpoint: string;
  public data?: any;

  constructor(message: string, status: number, endpoint: string, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.endpoint = endpoint;
    this.data = data;
  }
}

export interface ApiKeysStatusResponse {
  gemini: {
    configured: boolean;
    model: string;
    initialized: boolean;
  };
  googleMaps: {
    configured: boolean;
    service: string;
    hasPublicLoaderKey: boolean;
  };
  timestamp: string;
}

export interface GeminiChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  role?: 'general' | 'emergency' | 'civic' | 'services' | 'tourism';
  modelType?: 'complex' | 'general' | 'fast' | 'pro' | 'lite';
  useMaps?: boolean;
  userLocation?: { latitude: number; longitude: number };
  language?: 'en' | 'bn';
}

export interface GroundingPlace {
  title: string;
  uri: string;
  address?: string;
  snippets?: string[];
  category?: string;
}

export interface GeminiChatResponse {
  reply: string;
  groundingPlaces?: GroundingPlace[];
  modelUsed?: string;
  role?: string;
}

export interface MapsGroundingRequest {
  query: string;
  category?: string;
  userLocation?: { latitude: number; longitude: number };
}

export interface MapsGroundingResponse {
  query: string;
  summary: string;
  places: GroundingPlace[];
}

export interface EnhanceReportRequest {
  description: string;
  category?: string;
  location?: string;
}

export interface EnhanceReportResponse {
  enhancedDescription: string;
  suggestedCategory: string;
  missingInfo: string[];
  isAiAssisted: boolean;
}

export interface PlacePhotoParams {
  placeId?: string;
  name?: string;
  width?: number;
  height?: number;
}

export interface PlacePhotoResponse {
  photoUrl: string | null;
  attribution?: string;
  hasPhoto: boolean;
  cached?: boolean;
  message?: string;
}

export interface PlaceImageGenerateParams {
  placeId?: string;
  name: string;
  category?: string;
  subcategory?: string;
  address?: string;
}

export interface PlaceImageGenerateResponse {
  imageUrl: string | null;
  attribution?: string;
  imageSource?: string;
  cached?: boolean;
  error?: string;
}

export interface NearbyPoiSummary {
  placeId: string;
  name: string;
  category: string;
  primaryType?: string;
  address?: string;
  formattedAddress?: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

export interface ReverseGeocodeResponse {
  success: boolean;
  lat: number;
  lng: number;
  kind?: 'poi' | 'road' | 'locality' | 'coordinate';
  title?: string;
  category?: string;
  name: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  road?: string;
  placeId?: string;
  primaryPlace?: {
    placeId?: string;
    name: string;
    category?: string;
    address?: string;
    rating?: number;
    userRatingCount?: number;
    googleMapsUri?: string;
    openNow?: boolean;
  } | null;
  nearbyPlaces?: NearbyPoiSummary[];
  landmarks?: Array<{
    name: string;
    description?: string;
    distanceMeters?: number;
    placeId?: string;
  }>;
  rawAddress?: any;
  source: string;
}

export interface GooglePlaceNewResult {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  location?: { latitude: number; longitude: number };
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  currentOpeningHours?: { openNow?: boolean };
}

export interface AutocompletePredictionItem {
  placePrediction?: {
    placeId: string;
    text?: { text: string };
    structuredFormat?: {
      mainText?: { text: string };
      secondaryText?: { text: string };
    };
    types?: string[];
    distanceMeters?: number;
  };
}

export interface RoutesComputeRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  travelMode?: 'DRIVE' | 'WALK' | 'TWO_WHEELER' | 'BICYCLE';
  computeAlternativeRoutes?: boolean;
  languageCode?: 'en' | 'bn';
}

export interface RouteStepSummary {
  distanceMeters?: number;
  staticDuration?: string;
  navigationInstruction?: {
    maneuver?: string;
    instructions?: string;
  };
  startLocation?: { latLng?: { latitude: number; longitude: number } };
  endLocation?: { latLng?: { latitude: number; longitude: number } };
}

export interface RoutesComputeResponse {
  routes?: Array<{
    description?: string;
    routeLabels?: string[];
    distanceMeters?: number;
    duration?: string;
    polyline?: { encodedPolyline?: string };
    viewport?: {
      low?: { latitude: number; longitude: number };
      high?: { latitude: number; longitude: number };
    };
    legs?: Array<{
      distanceMeters?: number;
      duration?: string;
      steps?: RouteStepSummary[];
    }>;
  }>;
}

export interface StreetViewMetadataResponse {
  available: boolean;
  status: string;
  panoId?: string | null;
  lat?: number;
  lng?: number;
  date?: string | null;
  copyright?: string;
  distanceFromQueryMeters?: number;
  nearestPano?: {
    panoId?: string | null;
    lat: number;
    lng: number;
    date?: string | null;
    copyright?: string;
    distanceFromQueryMeters?: number;
  } | null;
  error?: string;
}

export interface JourneyPreviewStop {
  stopIndex: number;
  role: 'START' | 'WAYPOINT' | 'DESTINATION';
  label: string;
  lat: number;
  lng: number;
  panoLat: number | null;
  panoLng: number | null;
  panoId: string | null;
  streetViewAvailable: boolean;
  headingDegrees: number;
  captureDate: string | null;
  copyright: string | null;
  distanceFromStartMeters: number;
}

export interface JourneyPreviewResponse {
  stops: JourneyPreviewStop[];
  coveredCount: number;
  totalStops: number;
  metadataDenied?: boolean;
}

class ApiClient {
  private defaultTimeoutMs = 20000;

  /**
   * Automatically acquire current Firebase user token if available
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
    } catch {
      // Non-blocking: continue without auth token if unavailable
    }
    return null;
  }

  /**
   * Resolve API base URL from Vite or Expo environment variables,
   * with automatic fallback to production backend for Android WebView / PWA.
   */
  private getBaseUrl(): string {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      return (import.meta.env.VITE_API_URL as string).replace(/\/+$/, '');
    }
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_URL) {
      return (process.env.EXPO_PUBLIC_API_URL as string).replace(/\/+$/, '');
    }

    if (typeof window !== 'undefined') {
      const origin = window.location.origin || '';
      const isNativeApp =
        origin.includes('appassets.androidplatform.net') ||
        origin.startsWith('file:') ||
        (typeof document !== 'undefined' && document.documentElement?.getAttribute('data-native-app') === 'true') ||
        (window as any).AndroidGoogleAuth !== undefined;

      if (isNativeApp) {
        return 'https://jalpaiguri-zxml.vercel.app';
      }
    }

    return '';
  }

  /**
   * Centralized HTTP request execution
   */
  public async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = this.defaultTimeoutMs, skipAuth = false, headers = {}, signal: externalSignal, ...fetchOptions } = options;

    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);

    const onExternalAbort = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        throw new ApiClientError('Request cancelled', 499, endpoint);
      }
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }

    const baseUrl = this.getBaseUrl();
    const targetUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const mergedHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(headers as Record<string, string>)
    };

    if (!skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        mergedHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(targetUrl, {
        ...fetchOptions,
        headers: mergedHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);

      if (!response.ok) {
        let errData: any = null;
        try {
          errData = await response.json();
        } catch {
          // ignore non-json error responses
        }

        if (
          typeof window !== 'undefined' &&
          (response.status === 429 || errData?.error?.status === 'RESOURCE_EXHAUSTED' || errData?.status === 'RESOURCE_EXHAUSTED')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }

        console.error('MYJPG API ERROR', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          googleStatus: errData?.googleStatus || errData?.error?.status,
          message: errData?.error?.message || errData?.error || errData?.message
        });

        const rawErr = errData?.error || errData?.message;
        const parsedMsg = typeof rawErr === 'string' ? rawErr : rawErr?.message;
        let errorMsg = parsedMsg;
        if (!errorMsg) {
          if (response.status === 400) errorMsg = `Invalid request parameters (${endpoint})`;
          else if (response.status === 401 || response.status === 403) errorMsg = `Authorization or API restriction issue (${response.status})`;
          else if (response.status === 404) errorMsg = `Maps service endpoint unavailable (404) on backend — redeploy latest server for ${endpoint}`;
          else if (response.status === 429) errorMsg = `API rate or quota limit reached (429)`;
          else if (response.status >= 500) errorMsg = `Server or Google service error (${response.status})`;
          else errorMsg = `API request to ${endpoint} failed with status ${response.status}`;
        }

        throw new ApiClientError(errorMsg, response.status, endpoint, errData);
      }

      try {
        return (await response.json()) as T;
      } catch {
        throw new ApiClientError(`Invalid JSON response from ${endpoint}`, 502, endpoint);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort);
      if (err?.name === 'AbortError') {
        if (didTimeout) {
          throw new ApiClientError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408, endpoint);
        }
        throw new ApiClientError('Request cancelled', 499, endpoint);
      }
      if (err instanceof ApiClientError) {
        throw err;
      }
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      throw new ApiClientError(
        isOffline ? 'No internet connection detected.' : err?.message || `Network failure calling ${endpoint}`,
        0,
        endpoint
      );
    }
  }

  // Convenience HTTP Methods
  public get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  public put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
  }

  public delete<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // ==========================================
  // GEMINI AI AUTHORIZED METHODS
  // ==========================================

  /**
   * Multi-turn chat with Gemini AI, role instructions, and Google Maps Grounding
   */
  public geminiChat(params: GeminiChatRequest): Promise<GeminiChatResponse> {
    return this.post<GeminiChatResponse>('/api/gemini/chat', params, { skipAuth: true });
  }

  /**
   * Dedicated Google Maps Grounded Place Search with Gemini
   */
  public geminiMapsGrounding(params: MapsGroundingRequest): Promise<MapsGroundingResponse> {
    return this.post<MapsGroundingResponse>('/api/gemini/maps-grounding', params);
  }

  /**
   * AI-assisted civic complaint enhancement and categorization
   */
  public enhanceCivicReport(params: EnhanceReportRequest): Promise<EnhanceReportResponse> {
    return this.post<EnhanceReportResponse>('/api/reports/enhance-report', params);
  }

  // ==========================================
  // GOOGLE MAPS & PLACES AUTHORIZED METHODS
  // ==========================================

  /**
   * Retrieve Google Maps configuration / API key for JavaScript SDK Loader
   */
  public async getGoogleMapsKey(): Promise<{ apiKey: string }> {
    try {
      return await this.get<{ apiKey: string }>('/api/config/maps-key');
    } catch {
      return { apiKey: '' };
    }
  }

  /**
   * Fetch place photo via server-side Google Places API (New) proxy
   */
  public getPlacePhoto(params: PlacePhotoParams): Promise<PlacePhotoResponse> {
    const searchParams = new URLSearchParams();
    if (params.placeId) searchParams.set('placeId', params.placeId);
    if (params.name) searchParams.set('name', params.name);
    if (params.width) searchParams.set('width', params.width.toString());
    if (params.height) searchParams.set('height', params.height.toString());

    return this.get<PlacePhotoResponse>(`/api/places/photo?${searchParams.toString()}`);
  }

  /**
   * Request Gemini place image generation fallback
   */
  public generatePlaceImage(params: PlaceImageGenerateParams): Promise<PlaceImageGenerateResponse> {
    return this.post<PlaceImageGenerateResponse>('/api/places/generate-image', params);
  }

  /**
   * Fetch place details via server-side Google Places API (New) proxy
   */
  public getPlaceDetails(
    placeId: string,
    options?: { sessionToken?: string; language?: 'en' | 'bn'; signal?: AbortSignal }
  ): Promise<any> {
    const sp = new URLSearchParams();
    if (options?.sessionToken) sp.set('sessionToken', options.sessionToken);
    if (options?.language) sp.set('language', options.language);
    const qs = sp.toString();
    return this.get<any>(`/api/places/details/${encodeURIComponent(placeId)}${qs ? `?${qs}` : ''}`, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Programmatic Places API (New) Autocomplete (Jalpaiguri-scoped)
   */
  public autocompletePlaces(
    params: {
      input: string;
      sessionToken?: string;
      languageCode?: 'en' | 'bn';
      restrictToJalpaiguri?: boolean;
      origin?: { lat: number; lng: number };
    },
    options?: { signal?: AbortSignal }
  ): Promise<{ suggestions?: AutocompletePredictionItem[] }> {
    return this.post<{ suggestions?: AutocompletePredictionItem[] }>('/api/places/autocomplete', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * High-accuracy server-side reverse geocoding + nearby POI identification
   */
  public reverseGeocode(
    lat: number,
    lng: number,
    options?: { placeId?: string; language?: 'en' | 'bn'; signal?: AbortSignal }
  ): Promise<ReverseGeocodeResponse> {
    const sp = new URLSearchParams({ lat: String(lat), lng: String(lng) });
    if (options?.placeId) sp.set('placeId', options.placeId);
    if (options?.language) sp.set('language', options.language);
    return this.get<ReverseGeocodeResponse>(`/api/location/reverse-geocode?${sp.toString()}`, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Search places using Places API (New) Text Search proxy
   */
  public searchPlacesText(
    params: {
      textQuery: string;
      lat?: number;
      lng?: number;
      radiusMeters?: number;
      includedType?: string;
      maxResultCount?: number;
      languageCode?: 'en' | 'bn';
      restrictToJalpaiguri?: boolean;
    },
    options?: { signal?: AbortSignal }
  ): Promise<{ places?: GooglePlaceNewResult[] }> {
    return this.post<{ places?: GooglePlaceNewResult[] }>('/api/places/search-text', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Search places located along an encoded route polyline
   */
  public searchPlacesAlongRoute(
    params: {
      encodedPolyline: string;
      textQuery?: string;
      origin?: { lat: number; lng: number };
      maxResultCount?: number;
      languageCode?: 'en' | 'bn';
    },
    options?: { signal?: AbortSignal }
  ): Promise<{ places?: GooglePlaceNewResult[] }> {
    return this.post<{ places?: GooglePlaceNewResult[] }>('/api/places/along-route', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Search nearby places using Places API (New) Nearby Search proxy
   */
  public searchPlacesNearby(
    params: {
      lat: number;
      lng: number;
      radiusMeters?: number;
      includedTypes?: string[];
      maxResultCount?: number;
      rankPreference?: 'DISTANCE' | 'POPULARITY';
      languageCode?: 'en' | 'bn';
    },
    options?: { signal?: AbortSignal }
  ): Promise<{ places?: GooglePlaceNewResult[] }> {
    return this.post<{ places?: GooglePlaceNewResult[] }>('/api/places/search-nearby', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Compute turn-by-turn route using official Google Routes API v2 proxy
   */
  public computeRoute(params: RoutesComputeRequest, options?: { signal?: AbortSignal }): Promise<RoutesComputeResponse> {
    return this.post<RoutesComputeResponse>('/api/routes/compute', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Check authentic Google Street View panorama availability at coordinates
   */
  public getStreetViewMetadata(
    lat: number,
    lng: number,
    options?: { radius?: number; source?: 'outdoor' | 'default'; signal?: AbortSignal }
  ): Promise<StreetViewMetadataResponse> {
    const sp = new URLSearchParams({
      lat: String(lat),
      lng: String(lng),
      radius: String(options?.radius ?? 80)
    });
    if (options?.source) sp.set('source', options.source);
    return this.get<StreetViewMetadataResponse>(`/api/streetview/metadata?${sp.toString()}`, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  /**
   * Build ordered Street View panorama stops along a route polyline
   */
  public getJourneyStreetPreview(
    params: {
      encodedPolyline: string;
      originName?: string;
      destinationName?: string;
      maxStops?: number;
    },
    options?: { signal?: AbortSignal }
  ): Promise<JourneyPreviewResponse> {
    return this.post<JourneyPreviewResponse>('/api/streetview/journey-preview', params, {
      skipAuth: true,
      signal: options?.signal
    });
  }

  // ==========================================
  // API KEY SERVICE STATUS & HEALTH
  // ==========================================

  /**
   * Check status of initialized API keys (Gemini & Google Maps)
   */
  public getApiKeysStatus(): Promise<ApiKeysStatusResponse> {
    return this.get<ApiKeysStatusResponse>('/api/keys/status');
  }

  /**
   * Check overall backend service health
   */
  public getHealth(): Promise<{ status: string; geminiEnabled: boolean; timestamp: string }> {
    return this.get<{ status: string; geminiEnabled: boolean; timestamp: string }>('/api/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;
