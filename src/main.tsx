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
