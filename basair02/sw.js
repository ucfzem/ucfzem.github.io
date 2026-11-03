// basair02 offline worker — scope: /basair02/
// Caches the app shell, local data and the external UI libraries so the
// encyclopedia keeps working with no connection.
const CACHE = 'basair02-v6';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/favicon.svg',
  './content-i18n.js',
  './content-data.js'
];

const CDN = [
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap'
];

function fetchTO(url, opts, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: c.signal })).finally(() => clearTimeout(t));
}

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(ASSETS.map((u) =>
      fetchTO(u, { cache: 'no-cache' }).then((r) => {
        if (r && r.ok) return cache.put(u, r);
      }).catch(() => {})
    ));
    await Promise.all(CDN.map((u) =>
      fetchTO(u, { mode: 'no-cors' }).then((r) => { if (r) return cache.put(u, r); }).catch(() => {})
    ));
  })());
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

const CDN_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net'
];

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // External UI libraries / fonts: cache-first with background refresh.
  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then((cached) => {
        const network = fetch(req).then((res) => {
          if (res) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  const scopePath = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  if (!url.pathname.startsWith(scopePath)) return;

  // Dynamic content data: network-first, offline fallback.
  if (url.pathname.endsWith('/content-data.js')) {
    e.respondWith(
      fetch(req, { cache: 'reload' })
        .then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Navigation: network first, fall back to cached shell.
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

  // Static assets: cache-first, update in background.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) {
        fetch(req).then((res) => {
          if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
