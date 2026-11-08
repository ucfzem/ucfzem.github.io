const VERSION = 'masail-v1';
const SHELL = 'masail-shell-' + VERSION;
const RUNTIME = 'masail-runtime-' + VERSION;
const CORE = ['./','./index.html','./masail.json','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600&display=swap';
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL);
    await Promise.all(CORE.map((u) => shell.add(u).catch(() => {})));
    const runtime = await caches.open(RUNTIME);
    await runtime.add(FONT_CSS).catch(() => {});
    self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('masail-') && k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});
async function cacheFirst(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try { const res = await fetch(req); if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; } catch (e) { return Response.error(); }
}
async function networkFirst(cacheName, req, fallbackKey) {
  const cache = await caches.open(cacheName);
  try { const res = await fetch(req); if (res && res.ok) cache.put(fallbackKey || req, res.clone()); return res; } catch (e) { return (await cache.match(fallbackKey || req, { ignoreSearch: true })) || Response.error(); }
}
async function staleWhileRevalidate(cacheName, req) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const update = fetch(req).then((res) => { if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone()); return res; }).catch(() => null);
  return hit || (await update) || Response.error();
}
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin === self.location.origin) {
    if (req.mode === 'navigate' || req.destination === 'document') event.respondWith(networkFirst(SHELL, req, './index.html'));
    else if (url.pathname.endsWith('/masail.json')) event.respondWith(networkFirst(SHELL, req, './masail.json'));
    else event.respondWith(cacheFirst(SHELL, req));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com') { event.respondWith(staleWhileRevalidate(RUNTIME, req)); return; }
  if (url.hostname === 'fonts.gstatic.com') { event.respondWith(cacheFirst(RUNTIME, req)); return; }
});
