const CACHE_NAME = 'photosplit-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/app',
  '/convert',
  '/crop',
  '/resize',
  '/passport',
  '/transcribe',
  '/css/style.css',
  '/js/app.js',
  '/js/worker.js',
  '/js/transcribe.js',
  '/js/whisper-worker.js',
  '/manifest.json',
  '/assets/images/logo.png',
  '/assets/images/logo-animated.svg'
];

// Install event: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Inside waitUntil to avoid race
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: network-first strategy for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // For Hugging Face models and external scripts, bypass cache
  if (event.request.url.includes('cdn.jsdelivr.net') || event.request.url.includes('huggingface.co')) {
    return;
  }

  const acceptHeader = event.request.headers.get('accept') || '';
  const isHtml = acceptHeader.includes('text/html');

  if (isHtml) {
    // Network-first for HTML pages so users get the latest version
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for CSS, JS, Images
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) return response;
          return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const resClone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
            }
            return networkResponse;
          });
        })
    );
  }
});
