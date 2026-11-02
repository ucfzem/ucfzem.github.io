const CACHE = 'childsgame-v1.0.1';
const PRECACHE = ['./', './index.html'];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Cairo:wght@400;600;800&family=Poppins:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {})));
    await Promise.all(CDN.map((u) =>
      fetch(u, { mode: 'no-cors' }).then((r) => { if (r) return cache.put(u, r); }).catch(() => {})
    ));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('childsgame-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')).then((r) => r || caches.match('./')))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
    })
  );
});
