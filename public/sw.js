const CACHE_NAME = 'namngam-cache-v1';
const urlsToCache = [
  '/',
  '/about',
  '/products',
  '/articles',
  '/contact',
  '/admin/login',
  '/static/js/bundle.js',
  '/static/css/main.css',
];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Fetch event with network first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }

  // Skip external requests
  if (url.origin !== self.location.origin) {
    return fetch(request);
  }

  // Check if request is for a static asset that should be cached
  const shouldCache = urlsToCache.some((cacheUrl) => {
    return url.pathname === cacheUrl || url.pathname.startsWith('/static/');
  });

  // Network first strategy for HTML pages, cache first for static assets
  const fetchStrategy = shouldCache ? 'cacheFirst' : 'networkFirst';

  event.respondWith(
    (async () => {
      // Try cache first
      if (shouldCache) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
          // Return cached response if it's not too old (1 day)
          const cachedDate = cachedResponse.headers.get('date');
          const responseDate = new Date(cachedDate);
          const now = new Date();
          const dayInMs = 24 * 60 * 60 * 1000;
          
          if (now - responseDate < dayInMs) {
            return cachedResponse;
          }
        }
      }

      // If not in cache or cache is stale, fetch from network
      try {
        const networkResponse = await fetch(request);
        
        // If successful and should be cached, store in cache
        if (networkResponse.ok && shouldCache) {
          const cache = await caches.open(CACHE_NAME);
          const responseClone = networkResponse.clone();
          
          // Add custom headers for caching
          const headers = new Headers(responseClone.headers);
          headers.set('Cache-Control', 'public, max-age=86400'); // 1 day
          headers.set('Service-Worker-Allowed', 'true');
          
          const cachedResponse = new Response(responseClone.body, {
            status: responseClone.status,
            statusText: responseClone.statusText,
            headers: headers,
          });
          
          await cache.put(request, cachedResponse);
        }
        
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed:', error);
        return new Response('Network error', { status: 500 });
      }
    })()
  );
});

// Background sync for offline support
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache.map((url) => new Request(url, { mode: 'no-cors' })));
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data.json(),
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: new Date().toISOString(),
    },
  };

  event.waitUntil(
    self.registration.showNotification('NAMNGAM Update', options)
  );
});