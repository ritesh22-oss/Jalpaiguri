const CACHE_NAME = 'myjpg-static-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png'
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

// Fetch Event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CRITICAL SECURITY RULE: Do NOT cache non-GET requests or private/sensitive APIs
  if (request.method !== 'GET') {
    return;
  }

  // Strictly skip caching Firebase Auth, Firestore, and any external private APIs
  if (
    url.origin.includes('googleapis.com') ||
    url.origin.includes('firebase') ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/donor') ||
    url.pathname.startsWith('/api/messages') ||
    url.pathname.startsWith('/api/profile') ||
    url.pathname.startsWith('/api/user')
  ) {
    // Network-only strategy for any private or Firebase operations
    return;
  }

  // Network-First, falling back to cache if offline
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // If it is a safe static asset, save a copy in the cache
        if (
          networkResponse.status === 200 &&
          (url.pathname.startsWith('/assets/') || ASSETS_TO_CACHE.includes(url.pathname))
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
            return caches.match('/index.html');
          }
        });
      })
  );
});
