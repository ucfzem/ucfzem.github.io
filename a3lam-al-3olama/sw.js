const APP_PREFIX = 'a3lam-al-3olama-v1';
const STATIC_CACHE = `${APP_PREFIX}-static`;
const RUNTIME_CACHE = `${APP_PREFIX}-runtime`;
const CORE_ASSETS = [
  './',
  './index.html',
  './icon.svg',
  './fonts/cairo-arabic.woff2',
  './fonts/cairo-latin-ext.woff2',
  './fonts/cairo-latin.woff2',
  './pictures/abdelkafy.jpg',
  './pictures/adnaan.jpg',
  './pictures/ahmed.jpg',
  './pictures/amri.jpg',
  './pictures/ayman.jpg',
  './pictures/belal.jpg',
  './pictures/benhamza.jpg',
  './pictures/eyad.jpg',
  './pictures/hamza.jpg',
  './pictures/huwaini.jpg',
  './pictures/masood.jpg',
  './pictures/menk.jpg',
  './pictures/nabil.jpg',
  './pictures/nafi.jpg',
  './pictures/nouman.jpg',
  './pictures/omar.jpg',
  './pictures/othman.jpg',
  './pictures/ourayfi.jpg',
  './pictures/philips.jpg',
  './pictures/said.jpg',
  './pictures/siraj.jpg',
  './pictures/suhaib.jpg',
  './pictures/tariq.jpg',
  './pictures/yahya.jpg',
  './pictures/yaqoubi.jpg',
  './pictures/yasir.jpg',
  './pictures/zakir.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const allowed = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k.startsWith('a3lam-al-3olama-') && !allowed.includes(k)).map((k) => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(fetch(request).then((response) => {
      if (response && response.ok) { const copy = response.clone(); caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)); }
      return response;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => {
    if (response && response.ok) { const copy = response.clone(); caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)); }
    return response;
  }).catch(() => new Response('Offline', { status: 503 }))));
});
