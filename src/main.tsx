// Ensure window.fetch is writable and routes API requests to the production backend in native WebView
(function() {
  const PROD_BACKEND = 'https://jalpaiguri-zxml.vercel.app';

  function resolveApiUrl(input: RequestInfo | URL): RequestInfo | URL {
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) {
        const origin = typeof window !== 'undefined' ? window.location.origin || '' : '';
        const isNative = origin.includes('appassets.androidplatform.net') ||
                         origin.startsWith('file:') ||
                         (typeof document !== 'undefined' && document.documentElement?.getAttribute('data-native-app') === 'true') ||
                         (typeof window !== 'undefined' && (window as any).AndroidGoogleAuth !== undefined);
        if (isNative) {
          return `${PROD_BACKEND}${input}`;
        }
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api/') && input.origin.includes('appassets.androidplatform.net')) {
        return new URL(`${PROD_BACKEND}${input.pathname}${input.search}`);
      }
    }
    return input;
  }

  function makeFetchWritable(obj: any) {
    if (!obj) return;
    try {
      const rawFetch = typeof obj.fetch === 'function' ? obj.fetch.bind(obj) : (typeof fetch === 'function' ? fetch : null);
      if (!rawFetch) return;

      const wrappedFetch: typeof fetch = function(input: RequestInfo | URL, init?: RequestInit) {
        const resolvedInput = resolveApiUrl(input);
        return rawFetch(resolvedInput, init);
      };

      let storedFetch = wrappedFetch;
      Object.defineProperty(obj, 'fetch', {
        get() {
          return storedFetch || wrappedFetch;
        },
        set(val) {
          storedFetch = typeof val === 'function' ? function(input: RequestInfo | URL, init?: RequestInit) {
            return val(resolveApiUrl(input), init);
          } as any : val;
        },
        configurable: true,
        enumerable: true
      });
    } catch (_) {}
  }

  try {
    if (typeof window !== 'undefined') makeFetchWritable(window);
    if (typeof Window !== 'undefined' && Window.prototype) makeFetchWritable(Window.prototype);
    if (typeof globalThis !== 'undefined') makeFetchWritable(globalThis);
    if (typeof self !== 'undefined') makeFetchWritable(self);
  } catch (_) {}
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Case A (Demo Project Key) Tier 1 quota / auth-failure detection before React mounts
if (typeof window !== 'undefined') {
  const prevAuthFailure = (window as any).gm_authFailure;
  (window as any).gm_authFailure = () => {
    console.error(
      '%c[MYJPG Maps Diagnostic] Google Maps Authentication Failure (gm_authFailure) detected!\n' +
      'Root Cause Analysis & Google Cloud Console Configuration Required:\n' +
      '1. HTTP Referrer Restrictions:\n' +
      '   Ensure the API key authorizes the exact browser origins:\n' +
      '   - https://ais-dev-2kcr4ltnqit3uoxlrm5rmk-546659896182.asia-southeast1.run.app/*\n' +
      '   - https://ais-pre-2kcr4ltnqit3uoxlrm5rmk-546659896182.asia-southeast1.run.app/*\n' +
      '   - https://jalpaiguri-zxml.vercel.app/*\n' +
      '   - http://localhost:3000/*\n' +
      '2. Required APIs to Enable in Google Cloud Console:\n' +
      '   - Maps JavaScript API\n' +
      '   - Places API (New)\n' +
      '   - Geocoding API\n' +
      '   - Routes API\n' +
      '   - Street View Static API / Maps SDK for Android & iOS\n' +
      '3. Google Cloud Billing must be active for the project.\n' +
      '4. Verify that the correct API key is populated in GOOGLE_MAPS_API_KEY / VITE_GOOGLE_MAPS_API_KEY.',
      'background: #111; color: #ff3333; padding: 6px; font-weight: bold; border-radius: 4px;'
    );
    window.dispatchEvent(new Event('google-maps-auth-failure'));
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    if (typeof prevAuthFailure === 'function') {
      try { prevAuthFailure(); } catch {}
    }
  };
  const origConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (args.some((a) => typeof a === 'string' && (a.includes('OverQuotaMapError') || a.includes('QuotaExceededError') || a.includes('RefererNotAllowedMapError') || a.includes('InvalidKeyMapError') || a.includes('BillingNotEnabledMapError')))) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
    origConsoleError(...args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// The Android launch screen is released only after React has painted. This prevents the
// WebView's white document frame from ever being shown as the application startup screen.
requestAnimationFrame(() => {
  (window as any).AndroidGoogleAuth?.reportWebAppReady?.();
});

// Register service worker for Progressive Web App (PWA) support
// APK assets are already offline-capable. Do not install a PWA service worker in WebView: it
// can retain a stale app shell across APK upgrades and mask the newly bundled UI.
if ('serviceWorker' in navigator && !(window as any).AndroidGoogleAuth) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then((reg) => {
        console.log('[Service Worker] Registered successfully with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[Service Worker] Registration failed:', err);
      });
  });
}

