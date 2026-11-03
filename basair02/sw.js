// basair02 offline worker — scope: /basair02/
// Caches the app shell + the i18n data so text works offline.
const CACHE = 'basair02-v4';
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

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) return;

  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  if (!url.pathname.startsWith(scopePath)) { return; }

  // Force network-first retrieval for dynamic content data with offline fallback
  if (url.pathname.endsWith('/content-data.js')) {
    e.respondWith(
      fetch(req, { cache: 'reload' })
        .then((res) => {
          if (res && res.ok) {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Navigation: try network first, fall back to cached index
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', clone));
        }
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Static assets: cache-first, update in background
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) {
        const fetchPromise = fetch(req).then((res) => {
          if (res && res.ok) {
            caches.open(CACHE).then((c) => c.put(req, res.clone()));
          }
          return res;
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.ok) {
          caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }
        return res;
      });
    })
  );
});
