const CACHE = 'maktaba-main-v1';
const CORE = [
  './',
  './index.html',
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
  'https://ucfzem.github.io/mapamundi/icon.svg',
  'https://ucfzem.github.io/works/assets/maktaba-icon.png',
  'https://ucfzem.github.io/works/assets/quran.png',
  'https://ucfzem.github.io/works/assets/tanger.png',
  'https://ucfzem.azer-tyu199p.workers.dev/droppy/dl/4851aaca/1794599242989.jpg'
];

function fetchTO(url, opts, ms = 8000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return fetch(url, Object.assign({}, opts, { signal: c.signal })).finally(() => clearTimeout(t));
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map((u) => fetchTO(u).then((r) => {
      if (r && (r.ok || r.type === 'opaque')) return cache.put(u, r);
    }).catch(() => {})));
    await Promise.all(EXTERNAL.map((u) =>
      fetchTO(u, { mode: 'no-cors' }).then((r) => {
        if (r) return cache.put(u, r);
      }).catch(() => {})
    ));
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
    const isLibrary = url.pathname === '/works/Maktaba/library' ||
      url.pathname.startsWith('/works/Maktaba/library/');
    const fallback = isLibrary ? './library/index.html' : './index.html';
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-cache' });
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true })) ||
          (await caches.match(fallback)) ||
          (await caches.match('./'));
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        return (await caches.match(request, { ignoreSearch: true })) || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) {
        const cache = await caches.open(CACHE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch {
      return Response.error();
    }
  })());
});
