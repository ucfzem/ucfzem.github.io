// Root service worker for https://ucfzem.github.io  (scope: "/")
//
// Two jobs:
//
// 1) Offline bare-URL redirect. Each app registers its own SW with scope
//    "/app/", which can NEVER intercept the bare URL "/app" (no trailing
//    slash). Offline, a typed "/app" makes Chrome try the network to get
//    GitHub's 301 -> ERR_INTERNET_DISCONNECTED. This SW answers with the same
//    redirect GitHub would send, so the browser then requests "/app/".
//
// 2) Offline app shells. It precaches each library app's index.html + icons and
//    the shared CDN assets (Tailwind, Font Awesome, Google Fonts), then serves
//    navigations to those apps from cache. Result: ANY device that has loaded a
//    page registering this SW (home, /works) can open every library app while
//    offline, even if that app was never opened online on that device. When an
//    app has its own installed SW it takes precedence; this SW is the fallback.

const SHELL_CACHE = 'ucfzem-shells-v1';
const CDN_CACHE = 'ucfzem-cdn-v1';

// Library apps whose shell (index.html + icons) is precached for offline use.
const SHELLS = [
  'al-tibb-al-nabawi',
  'nuzhat-al-mushtaq',
  'asrar-al-kawn',
  'al-adhama',
  'tarikh-ibn-khaldun',
  'mujam-al-buldan',
  'al-adhkiya',
  'al-mudhish',
  'al-jawab-al-kafi',
  'livre-al-istibsar',
  'remedy'
];

// Every app slug we know (used for the bare-URL redirect).
const APPS = [
  'al-tibb-al-nabawi',
  'nuzhat-al-mushtaq',
  'asrar-al-kawn',
  'al-adhama',
  'tarikh-ibn-khaldun',
  'mujam-al-buldan',
  'al-adhkiya',
  'al-mudhish',
  'al-jawab-al-kafi',
  'livre-al-istibsar',
  'quran-reader',
  'quran-amp',
  'api-job-finder',
  'mapamundi',
  'works',
  'droppy',
  'webhealth',
  'email-collector',
  'childsgame',
  'remedy'
];

// Shared third-party assets the shells need to render offline.
const CDN = [
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;600;700;800;900&family=Cairo+Play:wght@400..700&family=IBM+Plex+Sans+Arabic:wght@500;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Amiri:wght@400;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&display=swap'
];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

async function precache(cache, urls, concurrency = 4) {
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const u = urls[i++];
      try { await cache.add(u); }
      catch (e) { try { await new Promise((r) => setTimeout(r, 300)); await cache.add(u); } catch (_) {} }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}

async function cacheOpaque(cache, url) {
  for (let t = 0; t < 3; t++) {
    try { const r = await fetch(url, { mode: 'no-cors' }); if (r) { await cache.put(url, r); } return; }
    catch (e) { await new Promise((r) => setTimeout(r, 300)); }
  }
}

// Discover and cache one app's runtime data bundle (the book text). Books like
// tarikh-ibn-khaldun (data/manifest.json + chunks) and mujam-al-buldan
// (data/index.json + per-letter files) fetch their text at runtime, so the shell
// alone is not enough offline. Triggered from the works page to limit the
// download to library visitors.
const DATA_MARKER = '/__bookdata-v3';

// Resolve every local src/href in an app's index.html (relative or absolute,
// query string preserved) plus quoted ".js"/".json" literals in inline scripts
// (lazily-injected files) to an app-local path we can cache.
function localRefs(html, s) {
  const base = 'https://local.invalid/' + s + '/index.html';
  const out = new Set();
  const add = (v) => {
    if (!v || /^(https?:|data:|#|mailto:|javascript:|\/\/)/i.test(v)) return;
    let u;
    try { u = new URL(v, base); } catch (e) { return; }
    if (u.origin !== 'https://local.invalid') return;
    const p = u.pathname + u.search;
    if (p.startsWith('/' + s + '/')) out.add(p);
  };
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) add(m[1]);
  for (const m of html.matchAll(/["']([^"'\s]+\.(?:js|json))["']/g)) add(m[1]);
  return [...out];
}

async function cacheAppData(cache, s) {
  try {
    const r = await fetch('/' + s + '/data/manifest.json', { cache: 'no-store' });
    if (r && r.ok) {
      const man = await r.clone().json();
      await cache.put('/' + s + '/data/manifest.json', r);
      await precache(cache, (man.chunks || []).map((c) => '/' + s + '/' + c.file), 6);
    }
  } catch (e) {}
  try {
    const r = await fetch('/' + s + '/data/index.json', { cache: 'no-store' });
    if (r && r.ok) {
      const list = await r.clone().json();
      await cache.put('/' + s + '/data/index.json', r);
      const files = [...new Set((list || []).map((x) => x.file).filter(Boolean))];
      await precache(cache, files.map((f) => '/' + s + '/data/' + f + '.json'), 6);
    }
  } catch (e) {}
  try {
    const r = await fetch('/' + s + '/index.html', { cache: 'no-store' });
    if (r && r.ok) await precache(cache, localRefs(await r.text(), s), 6);
  } catch (e) {}
}

async function prefetchBookData() {
  const cache = await caches.open(SHELL_CACHE);
  if (await cache.match(DATA_MARKER)) return;
  for (const s of SHELLS) await cacheAppData(cache, s);
  await cache.put(DATA_MARKER, new Response('1'));
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'prefetch-book-data') event.waitUntil(prefetchBookData());
});


self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    const urls = [];
    for (const s of SHELLS) {
      urls.push(
        '/' + s + '/index.html',
        '/' + s + '/icon.svg',
        '/' + s + '/icon-192.png',
        '/' + s + '/manifest.json',
        '/' + s + '/site.webmanifest'
      );
    }
    await precache(shell, urls, 4);
    const cdn = await caches.open(CDN_CACHE);
    await Promise.all(CDN.map((u) => cacheOpaque(cdn, u)));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) =>
      (k.startsWith('ucfzem-shells-') || k.startsWith('ucfzem-cdn-')) &&
      k !== SHELL_CACHE && k !== CDN_CACHE
    ).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // ---- cross-origin shared CDN: cache-first ----
  if (url.origin !== self.location.origin) {
    if (CDN_HOSTS.includes(url.hostname)) {
      event.respondWith(
        caches.open(CDN_CACHE).then((c) => c.match(req).then((hit) =>
          hit || fetch(req).then((res) => {
            if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
            return res;
          })
        )).catch(() => caches.match(req).then((h) => h || fetch(req)))
      );
    }
    return;
  }

  const path = url.pathname;
  const first = path.split('/').filter(Boolean)[0] || '';
  if (!APPS.includes(first)) return;

  // ---- navigation to an app ----
  if (req.mode === 'navigate') {
    if (path.endsWith('/')) {
      // Serve the precached shell; fall back to the network when online.
      event.respondWith(
        caches.open(SHELL_CACHE).then((c) => c.match('/' + first + '/index.html')).then((hit) =>
          hit || fetch(req).then((res) => {
            if (res && res.ok) caches.open(SHELL_CACHE).then((c) => c.put('/' + first + '/index.html', res.clone()));
            return res;
          })
        ).catch(() => caches.match('/' + first + '/index.html').then((h) => h || fetch(req)))
      );
    } else {
      // Bare "/app" -> offline redirect to "/app/" (matches GitHub's 301).
      const target = url.origin + '/' + first + '/';
      const html = '<!doctype html><html lang="ar"><head><meta charset="utf-8">' +
        '<title>جاري التحويل…</title></head><body>' +
        '<script>location.replace(' + JSON.stringify(target) + ')<\/script>' +
        '</body></html>';
      event.respondWith(new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }));
    }
    return;
  }

  // ---- same-origin asset under an app path (icons, manifest, data) ----
  event.respondWith(
    caches.open(SHELL_CACHE).then((c) => c.match(req, { ignoreSearch: true })).then((hit) =>
      hit || fetch(req).then((res) => {
        if (res && res.ok) caches.open(SHELL_CACHE).then((c) => c.put(req, res.clone()));
        return res;
      })
    ).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || fetch(req)))
  );
});
