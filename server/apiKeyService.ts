import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Service to manage API keys securely in the application.
 * Ensures GEMINI_API_KEY and GOOGLE_MAPS_API_KEY are initialized safely
 * from environment variables with lazy loading, graceful fallback,
 * and zero exposure of sensitive server secrets to the client.
 */

export interface ApiKeyServiceStatus {
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

class ApiKeyService {
  private geminiClient: GoogleGenAI | null = null;
  private isGeminiInitialized = false;

  constructor() {
    // Note: Do not throw at construction time if keys are missing
    // Environment variables might be injected dynamically or configured in AI Studio Settings > Secrets
  }

  /**
   * Safely retrieve the Gemini API key from server environment
   */
  public getGeminiApiKey(): string | undefined {
    return process.env.GEMINI_API_KEY?.trim() || undefined;
  }

  /**
   * Check if Gemini API key is configured
   */
  public hasGeminiKey(): boolean {
    return Boolean(this.getGeminiApiKey());
  }

  /**
   * Lazy initialization for GoogleGenAI client with official User-Agent telemetry
   */
  public getGeminiClient(): GoogleGenAI | null {
    const key = this.getGeminiApiKey();
    if (!key) {
      return null;
    }

    if (!this.geminiClient) {
      try {
        this.geminiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        this.isGeminiInitialized = true;
        console.log('[ApiKeyService] GoogleGenAI client initialized successfully with User-Agent telemetry.');
      } catch (err: any) {
        console.error('[ApiKeyService] Failed to initialize GoogleGenAI client:', err?.message || err);
        return null;
      }
    }

    return this.geminiClient;
  }

  /**
   * Safely retrieve the Google Maps API key for server-side REST proxies
   */
  public getGoogleMapsApiKey(): string | undefined {
    return (
      process.env.GOOGLE_MAPS_API_KEY?.trim() ||
      process.env.VITE_GOOGLE_MAPS_API_KEY?.trim() ||
      undefined
    );
  }

  /**
   * Check if Google Maps API key is configured
   */
  public hasGoogleMapsKey(): boolean {
    return Boolean(this.getGoogleMapsApiKey());
  }

  /**
   * Safe public accessor for Google Maps JS API loader (Web client)
   */
  public getPublicMapsKey(): string {
    return this.getGoogleMapsApiKey() || '';
  }

  /**
   * Returns sanitized status of API keys (never leaks secret values)
   */
  public getStatus(): ApiKeyServiceStatus {
    const hasGemini = this.hasGeminiKey();
    const hasMaps = this.hasGoogleMapsKey();

    return {
      gemini: {
        configured: hasGemini,
        model: 'gemini-3.8-flash / gemini-3.1-pro-preview',
        initialized: this.isGeminiInitialized
      },
      googleMaps: {
        configured: hasMaps,
        service: 'Places API (New) & Maps JavaScript API',
        hasPublicLoaderKey: hasMaps
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verifies incoming authorization header format for protected API endpoints
   */
  public extractBearerToken(authHeader?: string): string | null {
    if (!authHeader || typeof authHeader !== 'string') return null;
    const parts = authHeader.trim().split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      return parts[1];
    }
    return null;
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
