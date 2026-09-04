/**
 * Jalpaiguri Connect - Google Maps JavaScript API Loader
 * 
 * Complies strictly with Google Maps Platform guidelines:
 * - Uses dynamic asynchronous bootstrap script loader
 * - Injects solution_channel: 'gmp_mcp_codeassist_v1_aistudio'
 * - Requests modern libraries: 'maps', 'marker', 'places', 'geometry'
 * - Fetches API key securely via server backend config endpoint
 */

import { apiClient } from './apiClient';

let gmpLoaderPromise: Promise<any> | null = null;

export async function loadGoogleMapsJsApi(): Promise<any> {
  if (typeof window !== 'undefined' && (window as any).google?.maps?.importLibrary) {
    return (window as any).google.maps;
  }

  if (gmpLoaderPromise) {
    return gmpLoaderPromise;
  }

  gmpLoaderPromise = new Promise(async (resolve, reject) => {
    try {
      // 1. Check if already globally loaded
      if (typeof window !== 'undefined' && (window as any).google?.maps) {
        return resolve((window as any).google.maps);
      }

      // 2. Fetch server-provided API key safely via centralized apiClient
      let apiKey = '';
      try {
        const config = await apiClient.getGoogleMapsKey();
        apiKey = config?.apiKey || '';
      } catch {
        // Fallback without key or with prototype demo key
      }

      // 3. Configure Google Maps bootstrap script with solution attribution
      const callbackName = '__initGoogleMapsJsLoaderCallback';
      (window as any)[callbackName] = () => {
        resolve((window as any).google.maps);
      };

      const params = new URLSearchParams({
        v: 'weekly',
        libraries: 'maps,marker,places,geometry',
        solution_channel: 'gmp_mcp_codeassist_v1_aistudio',
        callback: callbackName
      });

      if (apiKey) {
        params.set('key', apiKey);
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.onerror = (err) => {
        reject(new Error('Google Maps script failed to load.'));
      };

      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });

  return gmpLoaderPromise;
}
