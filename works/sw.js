const CACHE = 'works-v1.0.5';
const CORE = [
  './',
  './index.html',
  './assets/al-tibb-al-nabawi.svg',
  './assets/avatar.png',
  './assets/cv-icon.png',
  './assets/quran.png',
  './assets/remedy.svg',
  './assets/tanger.png',
  './assets/tarikh-ibn-khaldun.svg',
  './assets/web-dev-logo.png',
  'https://ucfzem.github.io/nuzhat-al-mushtaq/icon.svg',
  'https://ucfzem.github.io/mapamundi/icon.svg',
  'https://ucfzem.github.io/al-mudhish/icon.svg',
  'https://ucfzem.github.io/al-jawab-al-kafi/icon.svg',
  'https://ucfzem.github.io/asrar-al-kawn/icon.svg',
  'https://ucfzem.github.io/al-adhama/icon.svg',
  'https://ucfzem.github.io/karamat-al-awliya/icon.svg'
];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.all(CORE.map((u) => cache.add(u).catch(() => {})));
    await Promise.all(CDN.map((u) =>
      fetch(u, { mode: 'no-cors' }).then((r) => { if (r) return cache.put(u, r); }).catch(() => {})
    ));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('works-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE).then((c) => c.match('./index.html').then((cached) => {
        const fresh = fetch(req).then((res) => {
          if (res && res.ok) c.put('./index.html', res.clone());
          return res;
        });
        return cached || fresh.catch(() => caches.match('./'));
      }))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req))
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
