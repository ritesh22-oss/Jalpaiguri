const CACHE_NAME = 'myjpg-static-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/screenshots/screenshot-mobile.png',
  '/screenshots/screenshot-desktop.png'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching static assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[Service Worker] Pre-cache failed for some assets:', err);
      });
    })
  );
});

// Activate Event (Cleanup old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Handle skipWaiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL SECURITY RULE: Do NOT cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strictly skip caching Firebase Auth, Firestore, Google APIs, and backend API routes
  if (
    url.origin.includes('googleapis.com') ||
    url.origin.includes('firebase') ||
    url.origin.includes('firestore') ||
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin
  ) {
    // Network-only strategy for private APIs and cross-origin authentication
    return;
  }

  // Network-First, falling back to cache if offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // If it is a safe static asset or app asset, save a copy in the cache
        if (
          networkResponse.status === 200 &&
          (url.pathname.startsWith('/assets/') || 
           url.pathname.startsWith('/icons/') || 
           url.pathname.startsWith('/screenshots/') ||
           ASSETS_TO_CACHE.includes(url.pathname))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache for static assets or the main entry point (app-shell)
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // For SPA navigation: route fallback to index.html if offline
          if (request.mode === 'navigate') {
            return caches.match('/index.html') || caches.match('/');
          }
        });
      })
  );
});

