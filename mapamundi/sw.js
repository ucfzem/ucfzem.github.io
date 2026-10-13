// Service worker for /mapamundi/ — offline app shell + runtime caching.
const CACHE = 'mapamundi-cache-v1.0.5';

// App shell that must be available offline.
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './assets/offline/map.dzi',
  './assets/offline/map_files/0/0_0.jpg',
  './assets/offline/map_files/1/0_0.jpg',
  './assets/offline/map_files/2/0_0.jpg',
  './assets/offline/map_files/3/0_0.jpg',
  './assets/offline/map_files/4/0_0.jpg',
  './assets/offline/map_files/5/0_0.jpg',
  './assets/offline/map_files/6/0_0.jpg',
  './assets/offline/map_files/7/0_0.jpg',
  './assets/offline/map_files/8/0_0.jpg',
  './assets/offline/map_files/9/0_0.jpg',
  './assets/offline/map_files/10/0_0.jpg',
  './assets/offline/map_files/11/0_0.jpg',
  './assets/offline/map_files/11/1_0.jpg',
  './assets/offline/map_files/11/0_1.jpg',
  './assets/offline/map_files/11/1_1.jpg',
  './assets/offline/map_files/12/0_0.jpg',
  './assets/offline/map_files/12/1_0.jpg',
  './assets/offline/map_files/12/2_0.jpg',
  './assets/offline/map_files/12/0_1.jpg',
  './assets/offline/map_files/12/1_1.jpg',
  './assets/offline/map_files/12/2_1.jpg',
  './assets/offline/map_files/12/0_2.jpg',
  './assets/offline/map_files/12/1_2.jpg',
  './assets/offline/map_files/12/2_2.jpg',
  './assets/offline/map_files/12/0_3.jpg',
  './assets/offline/map_files/12/1_3.jpg',
  './assets/offline/map_files/12/2_3.jpg',
  './assets/offline/map_files/13/0_0.jpg',
  './assets/offline/map_files/13/1_0.jpg',
  './assets/offline/map_files/13/2_0.jpg',
  './assets/offline/map_files/13/3_0.jpg',
  './assets/offline/map_files/13/4_0.jpg',
  './assets/offline/map_files/13/5_0.jpg',
  './assets/offline/map_files/13/0_1.jpg',
  './assets/offline/map_files/13/1_1.jpg',
  './assets/offline/map_files/13/2_1.jpg',
  './assets/offline/map_files/13/3_1.jpg',
  './assets/offline/map_files/13/4_1.jpg',
  './assets/offline/map_files/13/5_1.jpg',
  './assets/offline/map_files/13/0_2.jpg',
  './assets/offline/map_files/13/1_2.jpg',
  './assets/offline/map_files/13/2_2.jpg',
  './assets/offline/map_files/13/3_2.jpg',
  './assets/offline/map_files/13/4_2.jpg',
  './assets/offline/map_files/13/5_2.jpg',
  './assets/offline/map_files/13/0_3.jpg',
  './assets/offline/map_files/13/1_3.jpg',
  './assets/offline/map_files/13/2_3.jpg',
  './assets/offline/map_files/13/3_3.jpg',
  './assets/offline/map_files/13/4_3.jpg',
  './assets/offline/map_files/13/5_3.jpg',
  './assets/offline/map_files/13/0_4.jpg',
  './assets/offline/map_files/13/1_4.jpg',
  './assets/offline/map_files/13/2_4.jpg',
  './assets/offline/map_files/13/3_4.jpg',
  './assets/offline/map_files/13/4_4.jpg',
  './assets/offline/map_files/13/5_4.jpg',
  './assets/offline/map_files/13/0_5.jpg',
  './assets/offline/map_files/13/1_5.jpg',
  './assets/offline/map_files/13/2_5.jpg',
  './assets/offline/map_files/13/3_5.jpg',
  './assets/offline/map_files/13/4_5.jpg',
  './assets/offline/map_files/13/5_5.jpg',
  './assets/offline/map_files/13/0_6.jpg',
  './assets/offline/map_files/13/1_6.jpg',
  './assets/offline/map_files/13/2_6.jpg',
  './assets/offline/map_files/13/3_6.jpg',
  './assets/offline/map_files/13/4_6.jpg',
  './assets/offline/map_files/13/5_6.jpg',
  './assets/offline/map_files/14/0_0.jpg',
  './assets/offline/map_files/14/1_0.jpg',
  './assets/offline/map_files/14/2_0.jpg',
  './assets/offline/map_files/14/3_0.jpg',
  './assets/offline/map_files/14/4_0.jpg',
  './assets/offline/map_files/14/5_0.jpg',
  './assets/offline/map_files/14/6_0.jpg',
  './assets/offline/map_files/14/7_0.jpg',
  './assets/offline/map_files/14/8_0.jpg',
  './assets/offline/map_files/14/9_0.jpg',
  './assets/offline/map_files/14/10_0.jpg',
  './assets/offline/map_files/14/11_0.jpg',
  './assets/offline/map_files/14/0_1.jpg',
  './assets/offline/map_files/14/1_1.jpg',
  './assets/offline/map_files/14/2_1.jpg',
  './assets/offline/map_files/14/3_1.jpg',
  './assets/offline/map_files/14/4_1.jpg',
  './assets/offline/map_files/14/5_1.jpg',
  './assets/offline/map_files/14/6_1.jpg',
  './assets/offline/map_files/14/7_1.jpg',
  './assets/offline/map_files/14/8_1.jpg',
  './assets/offline/map_files/14/9_1.jpg',
  './assets/offline/map_files/14/10_1.jpg',
  './assets/offline/map_files/14/11_1.jpg',
  './assets/offline/map_files/14/0_2.jpg',
  './assets/offline/map_files/14/1_2.jpg',
  './assets/offline/map_files/14/2_2.jpg',
  './assets/offline/map_files/14/3_2.jpg',
  './assets/offline/map_files/14/4_2.jpg',
  './assets/offline/map_files/14/5_2.jpg',
  './assets/offline/map_files/14/6_2.jpg',
  './assets/offline/map_files/14/7_2.jpg',
  './assets/offline/map_files/14/8_2.jpg',
  './assets/offline/map_files/14/9_2.jpg',
  './assets/offline/map_files/14/10_2.jpg',
  './assets/offline/map_files/14/11_2.jpg',
  './assets/offline/map_files/14/0_3.jpg',
  './assets/offline/map_files/14/1_3.jpg',
  './assets/offline/map_files/14/2_3.jpg',
  './assets/offline/map_files/14/3_3.jpg',
  './assets/offline/map_files/14/4_3.jpg',
  './assets/offline/map_files/14/5_3.jpg',
  './assets/offline/map_files/14/6_3.jpg',
  './assets/offline/map_files/14/7_3.jpg',
  './assets/offline/map_files/14/8_3.jpg',
  './assets/offline/map_files/14/9_3.jpg',
  './assets/offline/map_files/14/10_3.jpg',
  './assets/offline/map_files/14/11_3.jpg',
  './assets/offline/map_files/14/0_4.jpg',
  './assets/offline/map_files/14/1_4.jpg',
  './assets/offline/map_files/14/2_4.jpg',
  './assets/offline/map_files/14/3_4.jpg',
  './assets/offline/map_files/14/4_4.jpg',
  './assets/offline/map_files/14/5_4.jpg',
  './assets/offline/map_files/14/6_4.jpg',
  './assets/offline/map_files/14/7_4.jpg',
  './assets/offline/map_files/14/8_4.jpg',
  './assets/offline/map_files/14/9_4.jpg',
  './assets/offline/map_files/14/10_4.jpg',
  './assets/offline/map_files/14/11_4.jpg',
  './assets/offline/map_files/14/0_5.jpg',
  './assets/offline/map_files/14/1_5.jpg',
  './assets/offline/map_files/14/2_5.jpg',
  './assets/offline/map_files/14/3_5.jpg',
  './assets/offline/map_files/14/4_5.jpg',
  './assets/offline/map_files/14/5_5.jpg',
  './assets/offline/map_files/14/6_5.jpg',
  './assets/offline/map_files/14/7_5.jpg',
  './assets/offline/map_files/14/8_5.jpg',
  './assets/offline/map_files/14/9_5.jpg',
  './assets/offline/map_files/14/10_5.jpg',
  './assets/offline/map_files/14/11_5.jpg',
  './assets/offline/map_files/14/0_6.jpg',
  './assets/offline/map_files/14/1_6.jpg',
  './assets/offline/map_files/14/2_6.jpg',
  './assets/offline/map_files/14/3_6.jpg',
  './assets/offline/map_files/14/4_6.jpg',
  './assets/offline/map_files/14/5_6.jpg',
  './assets/offline/map_files/14/6_6.jpg',
  './assets/offline/map_files/14/7_6.jpg',
  './assets/offline/map_files/14/8_6.jpg',
  './assets/offline/map_files/14/9_6.jpg',
  './assets/offline/map_files/14/10_6.jpg',
  './assets/offline/map_files/14/11_6.jpg',
  './assets/offline/map_files/14/0_7.jpg',
  './assets/offline/map_files/14/1_7.jpg',
  './assets/offline/map_files/14/2_7.jpg',
  './assets/offline/map_files/14/3_7.jpg',
  './assets/offline/map_files/14/4_7.jpg',
  './assets/offline/map_files/14/5_7.jpg',
  './assets/offline/map_files/14/6_7.jpg',
  './assets/offline/map_files/14/7_7.jpg',
  './assets/offline/map_files/14/8_7.jpg',
  './assets/offline/map_files/14/9_7.jpg',
  './assets/offline/map_files/14/10_7.jpg',
  './assets/offline/map_files/14/11_7.jpg',
  './assets/offline/map_files/14/0_8.jpg',
  './assets/offline/map_files/14/1_8.jpg',
  './assets/offline/map_files/14/2_8.jpg',
  './assets/offline/map_files/14/3_8.jpg',
  './assets/offline/map_files/14/4_8.jpg',
  './assets/offline/map_files/14/5_8.jpg',
  './assets/offline/map_files/14/6_8.jpg',
  './assets/offline/map_files/14/7_8.jpg',
  './assets/offline/map_files/14/8_8.jpg',
  './assets/offline/map_files/14/9_8.jpg',
  './assets/offline/map_files/14/10_8.jpg',
  './assets/offline/map_files/14/11_8.jpg',
  './assets/offline/map_files/14/0_9.jpg',
  './assets/offline/map_files/14/1_9.jpg',
  './assets/offline/map_files/14/2_9.jpg',
  './assets/offline/map_files/14/3_9.jpg',
  './assets/offline/map_files/14/4_9.jpg',
  './assets/offline/map_files/14/5_9.jpg',
  './assets/offline/map_files/14/6_9.jpg',
  './assets/offline/map_files/14/7_9.jpg',
  './assets/offline/map_files/14/8_9.jpg',
  './assets/offline/map_files/14/9_9.jpg',
  './assets/offline/map_files/14/10_9.jpg',
  './assets/offline/map_files/14/11_9.jpg',
  './assets/offline/map_files/14/0_10.jpg',
  './assets/offline/map_files/14/1_10.jpg',
  './assets/offline/map_files/14/2_10.jpg',
  './assets/offline/map_files/14/3_10.jpg',
  './assets/offline/map_files/14/4_10.jpg',
  './assets/offline/map_files/14/5_10.jpg',
  './assets/offline/map_files/14/6_10.jpg',
  './assets/offline/map_files/14/7_10.jpg',
  './assets/offline/map_files/14/8_10.jpg',
  './assets/offline/map_files/14/9_10.jpg',
  './assets/offline/map_files/14/10_10.jpg',
  './assets/offline/map_files/14/11_10.jpg',
  './assets/offline/map_files/14/0_11.jpg',
  './assets/offline/map_files/14/1_11.jpg',
  './assets/offline/map_files/14/2_11.jpg',
  './assets/offline/map_files/14/3_11.jpg',
  './assets/offline/map_files/14/4_11.jpg',
  './assets/offline/map_files/14/5_11.jpg',
  './assets/offline/map_files/14/6_11.jpg',
  './assets/offline/map_files/14/7_11.jpg',
  './assets/offline/map_files/14/8_11.jpg',
  './assets/offline/map_files/14/9_11.jpg',
  './assets/offline/map_files/14/10_11.jpg',
  './assets/offline/map_files/14/11_11.jpg',
  './assets/offline/map_files/14/0_12.jpg',
  './assets/offline/map_files/14/1_12.jpg',
  './assets/offline/map_files/14/2_12.jpg',
  './assets/offline/map_files/14/3_12.jpg',
  './assets/offline/map_files/14/4_12.jpg',
  './assets/offline/map_files/14/5_12.jpg',
  './assets/offline/map_files/14/6_12.jpg',
  './assets/offline/map_files/14/7_12.jpg',
  './assets/offline/map_files/14/8_12.jpg',
  './assets/offline/map_files/14/9_12.jpg',
  './assets/offline/map_files/14/10_12.jpg',
  './assets/offline/map_files/14/11_12.jpg'
];

// Third-party resources fetched cross-origin (stored opaquely, served offline).
const CDN = [
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/openseadragon.min.js',
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/home_rest.png',
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/zoomin_rest.png',
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/zoomout_rest.png',
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/fullpage_rest.png',
  'https://cdn.jsdelivr.net/npm/openseadragon@5.0.1/build/openseadragon/images/button_rest.png'
];

async function addAllWithRetry(cache, urls, concurrency = 4) {
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      try { await cache.add(u); }
      catch (e) {
        try { await new Promise((r) => setTimeout(r, 300)); await cache.add(u); } catch (_) {}
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
    } catch (e) { await new Promise((r) => setTimeout(r, 300)); }
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await addAllWithRetry(cache, CORE, 8);
    await Promise.all(CDN.map((u) => cacheCdn(cache, u)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('mapamundi-') && k !== CACHE).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigations: network-first, fall back to the cached shell.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // Same-origin assets: network-first with cache fallback.
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Cross-origin (CDN, remote tiles): cache-first, then network + store.
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
