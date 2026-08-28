const CACHE_VERSION = 'early-pay-terms-v2';
const PRECACHE = __PRECACHE__;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname === '/__network_check__') return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_VERSION).then(async (cache) => { await cache.delete('/__offline_marker__'); await cache.put(request, copy); });
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.put('/__offline_marker__', new Response('offline'));
      return (await caches.match(request)) || (await caches.match('/')) || (await caches.match('/offline.html'));
    }));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_VERSION).then((cache) => cache.put(request, response.clone()));
    return response;
  })));
});
