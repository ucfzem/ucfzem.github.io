const CACHE = 'maktaba-main-v9';
const CORE = [
  './',
  './index.html',
  './avatar.jpg',
  './maktaba-qr-v3.png',
  './icons/herbal.png',
  './library/',
  './library/index.html',
  '../fonts.css?v=1',
  '../assets/maktaba-icon.png',
  '../assets/quran.png',
  '../assets/tanger.png',
  '../fonts/cinzel-400-latin-ext.woff2',
  '../fonts/cinzel-400-latin.woff2',
  '../fonts/cinzel-700-latin-ext.woff2',
  '../fonts/cinzel-700-latin.woff2',
  '../fonts/inter-300-latin-ext.woff2',
  '../fonts/inter-300-latin.woff2',
  '../fonts/inter-400-latin-ext.woff2',
  '../fonts/inter-400-latin.woff2',
  '../fonts/inter-500-latin-ext.woff2',
  '../fonts/inter-500-latin.woff2',
  '../fonts/inter-600-latin-ext.woff2',
  '../fonts/inter-600-latin.woff2',
  '../fonts/inter-700-latin-ext.woff2',
  '../fonts/inter-700-latin.woff2'
];
const EXTERNAL = [
  'https://ucfzem.github.io/a3lam-al-dawa/icon.svg',
  'https://ucfzem.github.io/a3lam-al-3olama/icon.svg',
  'https://ucfzem.github.io/shubuhat-wa-rudud/icon.svg',
  'https://ucfzem.github.io/mapamundi/icon.svg',
  'https://ucfzem.github.io/works/assets/quran.png',
  'https://ucfzem.github.io/works/assets/tanger.png'
];

function fetchTO(url, opts, ms = 10000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: c.signal })).finally(() => clearTimeout(t));
}

async function put(cache, req, res) {
  if (!res) return;
  if (res.ok || res.type === 'opaque') { try { await cache.put(req, res.clone()); } catch (_) {} }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(CORE.map(async (u) => {
      try { const r = await fetchTO(new Request(u, { cache: 'reload' })); await put(cache, u, r); } catch (_) {}
    }));
    await Promise.allSettled(EXTERNAL.map(async (u) => {
      try { const r = await fetchTO(u, { mode: 'no-cors' }); await put(cache, u, r); } catch (_) {}
    }));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('maktaba-main-') && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    const isLibrary = url.pathname === '/works/Maktaba/library' || url.pathname.startsWith('/works/Maktaba/library/');
    const fallback = isLibrary ? './library/index.html' : './index.html';
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request);
        if (response && response.ok) await put(cache, request, response);
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true })) ||
          (await caches.match(fallback, { ignoreSearch: true })) ||
          (await caches.match('./index.html', { ignoreSearch: true })) ||
          new Response('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><body style="font-family:system-ui;background:#0d0d0d;color:#c9a84c;padding:2rem">Offline. Reconnect and reload.</body>', { headers: { 'Content-Type': 'text/html;charset=utf-8' } });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await caches.match(request, { ignoreSearch: true });
    try {
      const response = await fetch(request, url.origin === self.location.origin ? {} : { mode: 'cors' });
      await put(cache, request, response);
      return response.ok || response.type === 'opaque' ? response : (cached || response);
    } catch {
      if (cached) return cached;
      if (url.origin !== self.location.origin) {
        try {
          const opaque = await fetch(request, { mode: 'no-cors' });
          await put(cache, request, opaque);
          return opaque;
        } catch (_) {}
      }
      return Response.error();
    }
  })());
});
