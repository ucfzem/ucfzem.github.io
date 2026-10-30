// Service worker : fonctionnement hors-ligne complet.
// Les données sont en réseau d'abord (elles changent quand on réimporte) ; le reste en cache.
const CACHE = 'tawhid-v4';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'data/toc.json', 'data/kitab.json', 'data/fath.json', 'data/fatawa.json'];
const CDN = ['https://cdn.tailwindcss.com'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@400;600;700&family=Scheherazade+New:wght@400;700&display=swap';

function fetchTO(url, opts, ms = 10000) {
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
    await Promise.all(CDN.map((u) =>
      fetchTO(u, { mode: 'no-cors' }).then((r) => { if (r) return cache.put(u, r); }).catch(() => {})
    ));
    try {
      const r = await fetchTO(FONT_CSS);
      if (r && r.ok) {
        const css = await r.clone().text();
        await cache.put(FONT_CSS, r);
        const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))];
        await Promise.all(urls.map((u) =>
          fetchTO(u, { mode: 'no-cors' }).then((r2) => { if (r2) return cache.put(u, r2); }).catch(() => {})
        ));
      }
    } catch (e) { /* polices non mises en cache : le repli système reste lisible */ }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k.startsWith('tawhid-')).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      const c = await caches.open(CACHE);
      try {
        const fresh = await fetchTO(req, {}, 8000);
        if (fresh && fresh.ok) c.put('./index.html', fresh.clone());
        return fresh;
      } catch (e) {
        return (await c.match('./index.html')) || (await c.match('./')) ||
          new Response('غير متصل بالإنترنت، ولا توجد نسخة محفوظة بعد.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }))
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
