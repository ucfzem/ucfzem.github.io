// basair02 offline worker — scope: /basair02/
// Caches the app shell + the i18n data so text works offline.
const CACHE = 'basair02-v3';
const ASSETS = ['./', './index.html', './content-i18n.js', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) =>
    Promise.all(ASSETS.map((u) =>
      fetch(u, { cache: 'no-cache' })
        .then((r) => { if (r && r.ok) return c.put(u, r); })
        .catch(() => {})
    ))
  ));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE && k.startsWith('basair02-')).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Navigations: network-first so updates land immediately; cache is the offline fallback.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req, { cache: 'no-cache' })
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put('./index.html', res.clone()));
          return res;
        })
        .catch(() => caches.match('./index.html').then((h) => h || caches.match('./')))
    );
    return;
  }

  // Assets (content-i18n.js, manifest, etc.): cache-first, refresh in background.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
