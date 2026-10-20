const CACHE = 'jawab-v1.0.0';
const CORE = [
  './',
  './index.html',
  './fonts.css?v=1',
  './manifest.json',
  './data/manifest.json',
  './data/vol_1.json',
  './data/vol_1.en.json',
  './data/vol_1.fr.json',
  './data/vol_1.es.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './fonts/amiri-400-arabic.woff2',
  './fonts/amiri-400-latin-ext.woff2',
  './fonts/amiri-400-latin.woff2',
  './fonts/amiri-700-arabic.woff2',
  './fonts/amiri-700-latin-ext.woff2',
  './fonts/amiri-700-latin.woff2',
  './fonts/cairo-400-arabic.woff2',
  './fonts/cairo-400-latin-ext.woff2',
  './fonts/cairo-400-latin.woff2',
  './fonts/cairo-700-arabic.woff2',
  './fonts/cairo-700-latin-ext.woff2',
  './fonts/cairo-700-latin.woff2'
];
const CDN = [];

function fetchTO(url, opts, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: c.signal })).finally(() => clearTimeout(t));
}

async function precacheAll(cache, urls, concurrency = 4) {
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      const put = async () => {
        const r = await fetchTO(u);
        if (r && (r.ok || r.type === 'opaque')) await cache.put(u, r);
      };
      try { await put(); }
      catch (e) {
        try { await new Promise((r) => setTimeout(r, 300)); await put(); } catch (_) {}
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function cacheCdn(cache, url) {
  for (let t = 0; t < 3; t++) {
    try {
      const r = await fetch(url, { mode: 'no-cors' });
      if (r) { await cache.put(url, r); }
      return;
    }
    catch (e) { await new Promise((r) => setTimeout(r, 300)); }
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await precacheAll(cache, CORE);
    await Promise.all(CDN.map((u) => cacheCdn(cache, u)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('jawab-')).map((k) => caches.delete(k))))
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
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then((h) => h || caches.match(req, { ignoreSearch: true })))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
