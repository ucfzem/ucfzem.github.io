const CACHE = 'ajwiba-v1.0.1';
const CORE = [
  './',
  './index.html',
  './import.html',
  './styles.css',
  './app.js',
  './parser.js',
  './search.js',
  './db.js',
  './import.js',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './data/book.md',
  './fonts/fonts.css',
  './fonts/amiri-J7aRnpd8CGxBHpUgtLMA7w.woff2',
  './fonts/amiri-J7aRnpd8CGxBHpUrtLMA7w.woff2',
  './fonts/amiri-J7aRnpd8CGxBHpUutLM.woff2',
  './fonts/amiri-J7acnpd8CGxBHp2VkaY6zp5yGw.woff2',
  './fonts/amiri-J7acnpd8CGxBHp2VkaY_zp4.woff2',
  './fonts/amiri-J7acnpd8CGxBHp2VkaYxzp5yGw.woff2',
  './fonts/cairo-SLXVc1nY6HkvangtZmpQdkhzfH5lkSscQyyS4J0.woff2',
  './fonts/cairo-SLXVc1nY6HkvangtZmpQdkhzfH5lkSscRiyS.woff2',
  './fonts/cairo-SLXVc1nY6HkvangtZmpQdkhzfH5lkSscSCyS4J0.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(CORE.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('ajwiba-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;

  // التنقل بين الصفحات: من الذاكرة ثم الشبكة ثم index.html
  if (e.request.mode === 'navigate') {
    e.respondWith(
      caches.match(e.request, { ignoreSearch: true })
        .then((cached) => cached || fetch(e.request))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  if (!sameOrigin) return;

  // نص الكتاب: الشبكة أولاً لملامسة أحدث المحتوى، مع الكاش احتياطاً دون إنترنت
  if (url.pathname.endsWith('/data/book.md')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((cached) => {
      const fetched = fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
