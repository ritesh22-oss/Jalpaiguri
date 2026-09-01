import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables from client or default
let supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  (import.meta as any).env?.SUPABASE_URL ||
  '';

let supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.SUPABASE_PUBLISHABLE_KEY ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  (import.meta as any).env?.SUPABASE_ANON_KEY ||
  '';

export let isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('YOUR_SUPABASE_URL')
);

export let supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        fetch: (...args: Parameters<typeof fetch>) => {
          const fetchFn = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch : fetch;
          return fetchFn(...args);
        }
      }
    })
  : null;

/**
 * Backend API Client fallback
 * If Supabase direct client isn't configured with live keys, calls our Express backend endpoints
 */
export const apiFetch = async <T>(endpoint: string, options?: RequestInit): Promise<T | null> => {
  try {
    const fetchFn = typeof window !== 'undefined' && typeof window.fetch === 'function' ? window.fetch : fetch;
    const res = await fetchFn(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (data && typeof data === 'object') {
        return data as T;
      }
      throw new Error(`Request failed with status ${res.status}`);
    }
    return data as T;
  } catch (error: any) {
    console.warn(`API call to ${endpoint} note:`, error);
    return null;
  }
};

