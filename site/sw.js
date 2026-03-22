const CACHE_NAME = 'lockclub-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/products.html',
  '/cases.html',
  '/tech.html',
  '/journal.html',
  '/contact.html',
  '/privacy.html',
  '/css/style.css',
  '/js/main.js'
];

// Install: cache static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: CacheFirst for images/fonts, NetworkFirst for HTML
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin (except CDN)
  if (request.method !== 'GET') return;
  if (!url.origin.match(/lockclub\.wangjile\.cn|lock\.club|localhost/)) return;

  if (url.pathname.match(/\.(jpg|jpeg|png|webp|svg|ico|woff2?|ttf|eot)/)) {
    // Images/fonts: CacheFirst
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return resp;
      }).catch(() => cached || resp)).catch(() => null)
    );
  } else {
    // HTML/JS/CSS: NetworkFirst with cache fallback
    e.respondWith(
      fetch(request).then(resp => {
        if (resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return resp;
      }).catch(() => caches.match(request).then(cached => cached || new Response('Offline', { status: 503 }))).catch(() => null)
    );
  }
});
