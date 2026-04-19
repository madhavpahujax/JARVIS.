// JARVIS v1.1 — Force refresh service worker
const CACHE_NAME = 'jarvis-v1.7';

// On install, clear ALL old caches
self.addEventListener('install', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
  );
  self.skipWaiting();
});

// On activate, clear ALL old caches again and take control
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Always fetch from network first, fall back to cache
self.addEventListener('fetch', e => {
  // Never cache API calls or fonts
  if (e.request.url.includes('googleapis.com') || e.request.url.includes('api.anthropic.com')) {
    e.respondWith(fetch(e.request));
    return;
  }
  // Network first for everything else
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request))
  );
});
