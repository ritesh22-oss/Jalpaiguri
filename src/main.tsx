// Ensure window.fetch is writable and compatible across iframe sandbox environments
(function() {
  function makeFetchWritable(obj: any) {
    if (!obj) return;
    try {
      let originalFetch = typeof obj.fetch === 'function' ? obj.fetch.bind(obj) : null;
      if (!originalFetch && typeof fetch === 'function') {
        originalFetch = fetch;
      }
      let storedFetch = originalFetch;
      Object.defineProperty(obj, 'fetch', {
        get() {
          return storedFetch || (typeof window !== 'undefined' && window !== obj && typeof window.fetch === 'function' ? window.fetch : fetch);
        },
        set(val) {
          storedFetch = val;
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

