const CACHE_NAME = 'a3lam-al-dawa-v30';
const PORTRAITS = ['./images/01.jpg', './images/02.jpg', './images/03.jpg', './images/04.jpg', './images/05.jpg', './images/06.jpg', './images/07.jpg', './images/08.jpg', './images/09.jpg', './images/10.jpg', './images/11.jpg', './images/12.jpg', './images/13.jpg', './images/14.jpg', './images/15.jpg', './images/16.jpg', './images/17.jpg', './images/18.jpg', './images/19.jpg', './images/20.jpg', './images/21.jpg', './images/22.jpg', './images/23.jpg', './images/24.jpg', './images/25.jpg', './images/26.jpg', './images/27.jpg', './images/28.jpg', './images/29.jpg', './images/30.jpg', './images/31.jpg', './images/32.jpg', './images/33.jpg', './images/34.jpg'];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(['./', './index.html', './manifest.json', './names.html']);
    await Promise.allSettled(PORTRAITS.map(u => cache.add(u)));
  })());
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => new Response('', { status: 503 }))));
});