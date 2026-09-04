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

export interface ReverseGeocodeResponse {
  success: boolean;
  lat: number;
  lng: number;
  name: string;
  locality: string;
  city: string;
  district: string;
  state: string;
  country: string;
  pincode: string;
  road?: string;
  rawAddress?: any;
  source: string;
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
   * Centralized HTTP request execution
   */
  public async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { timeoutMs = this.defaultTimeoutMs, skipAuth = false, headers = {}, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers: mergedHeaders,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errData: any = null;
        try {
          errData = await response.json();
        } catch {
          // ignore non-json error responses
        }
        throw new ApiClientError(
          errData?.error || errData?.message || `API request to ${endpoint} failed with status ${response.status}`,
          response.status,
          endpoint,
          errData
        );
      }

      return (await response.json()) as T;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new ApiClientError(`API request to ${endpoint} timed out after ${timeoutMs}ms`, 408, endpoint);
      }
      if (err instanceof ApiClientError) {
        throw err;
      }
      throw new ApiClientError(err?.message || 'Network error occurred', 0, endpoint);
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
    return this.post<GeminiChatResponse>('/api/gemini/chat', params);
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
   * Fetch place details via server-side Google Places API proxy
   */
  public getPlaceDetails(placeId: string): Promise<any> {
    return this.get<any>(`/api/places/details/${encodeURIComponent(placeId)}`);
  }

  /**
   * High-accuracy server-side reverse geocoding
   */
  public reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResponse> {
    return this.get<ReverseGeocodeResponse>(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
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
