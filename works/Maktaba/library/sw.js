const CACHE = 'maktaba-library-v2';
const CORE = ['./', './index.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async (u) => {
      try { await cache.put(u, await fetch(new Request(u, { cache: 'reload' }))); } catch (_) {}
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('maktaba-library-') && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) (await caches.open(CACHE)).put(request, response.clone()).catch(() => {});
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true })) || (await caches.match('./index.html')) || (await caches.match('./'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    try {
      const response = await fetch(request);
      if (response && response.ok) (await caches.open(CACHE)).put(request, response.clone()).catch(() => {});
      return response;
    } catch {
      return cached || Response.error();
    }
  })());
});
