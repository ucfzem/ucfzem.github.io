/* Service Worker — خريدة العجائب وفريدة الغرائب (PWA offline-first)
   Strategy:
   - App shell (index.html, data.json, manifest, icons): cache-first, precached on install.
   - Google Fonts CSS: stale-while-revalidate.
   - Google Fonts files (gstatic woff2): cache-first (opaque allowed).
   - Navigations: serve cached index.html so the app opens fully offline.
*/

const VERSION = 'kharidat-v4';
const SHELL = 'kharidat-shell-' + VERSION;
const RUNTIME = 'kharidat-runtime-' + VERSION;

const CORE = [
  './',
  './index.html',
  './data.json',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;600;700;800&family=Scheherazade+New:wght@400;700&display=swap';

// ---------- install ----------
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await Promise.all(CORE.map((u) => shell.add(u).catch(() => {})));
    await shell.add(FONT_CSS).catch(() => {});
    // The font CSS fetch handler reads from RUNTIME, so cache it there too
    // (otherwise offline the @font-face CSS request fails and fonts silently fall back).
    const runtime = await caches.open(RUNTIME);
    await runtime.add(FONT_CSS).catch(() => {});
    self.skipWaiting();
  })());
});

// ---------- activate ----------
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k.startsWith('kharidat-') && k !== SHELL && k !== RUNTIME)
          .map((k) => caches.delete(k))
    );
    await self.clients.claim();
    warmFonts();
  })());
});

// Pull the woff2 files referenced by the cached Google Fonts CSS.
async function warmFonts() {
  try {
    const cache = await caches.open(RUNTIME);
    const css = await cache.match(FONT_CSS) || await caches.match(FONT_CSS);
    if (!css) return;
    const text = await css.text();
    const urls = [...text.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((m) => m[1]);
    await Promise.all(urls.map((u) => cache.add(u).catch(() => {})));
  } catch (e) {}
}

// ---------- helpers ----------
async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  } catch (e) {
    return Response.error();
  }
}

async function staleWhileRevalidate(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const update = fetch(req).then((res) => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await update) || Response.error();
}

// ---------- fetch ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Same-origin app shell + data.
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || req.destination === 'document') {
      event.respondWith((async () => {
        const cache = await caches.open(SHELL);
        const cached = await cache.match('./index.html');
        const fresh = fetch(req).then((res) => {
          if (res && res.ok) cache.put('./index.html', res.clone());
          return res;
        }).catch(() => null);
        return cached || (await fresh) || Response.error();
      })());
    } else {
      event.respondWith(cacheFirst(SHELL, req));
    }
    return;
  }

  if (url.hostname === 'fonts.googleapis.com') {
    event.respondWith(staleWhileRevalidate(RUNTIME, req));
    return;
  }
  if (url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(RUNTIME, req));
    return;
  }
  // Everything else: network (untouched).
});

// Allow the page to ask for font warming or a manual sync.
self.addEventListener('message', (event) => {
  const d = event.data || {};
  if (d.type === 'warm-fonts') {
    const p = warmFonts();
    if (event.waitUntil) event.waitUntil(p);
  }
});
