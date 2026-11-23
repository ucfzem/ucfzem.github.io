const CACHE = 'tanger-v4';
const CORE = [
  './',
  './index.html',
  './histoire/',
  './histoire/index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(CORE.map((url) => cache.add(new Request(url, { cache: 'reload' }))))
    ).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('tanger-') && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req, { cache: 'no-store' });
        if (res && res.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, res.clone()).catch(() => {});
          const path = url.pathname.replace(/\/+$/, '') || '/';
          if (path.endsWith('/histoire')) cache.put('./histoire/index.html', res.clone()).catch(() => {});
          if (path.endsWith('/tanger')) cache.put('./index.html', res.clone()).catch(() => {});
        }
        return res;
      } catch {
        return (await caches.match(req)) ||
          (await caches.match(url.pathname.endsWith('/histoire') || url.pathname.endsWith('/histoire/') ? './histoire/index.html' : './index.html')) ||
          new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><body style="font-family:system-ui;padding:2rem;background:#0a0805;color:#f3cf5d">Hors connexion / Offline. Reconnectez-vous puis rechargez.</body>', { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(req);
    const fetchPromise = fetch(req).then(async (res) => {
      if (res && res.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone()).catch(() => {});
      }
      return res;
    }).catch(() => null);
    return cached || (await fetchPromise) || new Response('', { status: 504 });
  })());
});
