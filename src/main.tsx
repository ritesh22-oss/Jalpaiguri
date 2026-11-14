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
        if (isNative || (!origin.includes('localhost') && !origin.includes('127.0.0.1') && !origin.includes('0.0.0.0'))) {
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

// Service Worker Handling:
// PWA browsers use service workers for offline caching.
// Native Android WebView has bundled assets; unregister any previously cached service workers
// so updated APK assets are always loaded immediately without cache retention.
if ('serviceWorker' in navigator) {
  if ((window as any).AndroidGoogleAuth) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().then(() => {
          console.log('[Service Worker] Unregistered stale worker in native app');
        });
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  } else {
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
}

