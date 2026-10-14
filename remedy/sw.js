const CACHE = 'remedy-v1.1.0';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];
const CDN_CSS = 'https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&display=swap';
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

async function cacheFonts(cache) {
  try {
    const r = await fetch(CDN_CSS, { mode: 'cors' });
    if (!r || !r.ok) return;
    const clone = r.clone();
    await cache.put(CDN_CSS, r);
    const txt = await clone.text();
    const urls = [...new Set((txt.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g) || [])
      .map((m) => m.replace(/^url\(/, '').replace(/\)$/, '').replace(/['"]/g, '')))];
    await Promise.all(urls.map((u) =>
      fetch(u, { mode: 'cors' }).then((f) => { if (f && f.ok) return cache.put(u, f); }).catch(() => {})
    ));
  } catch (e) {}
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(PRECACHE.map((u) => cache.add(u).catch(() => {})));
    await cacheFonts(cache);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('remedy-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true })
        .then((r) => r || caches.match('./index.html'))
        .then((r) => r || caches.match('./')))
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

  if (CDN_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && (res.ok || res.type === 'opaque')) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        });
      }).catch(() => caches.match(req))
    );
    return;
  }
});
