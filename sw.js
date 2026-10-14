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
  'remedy',
  'mapamundi',
  'webhealth',
  'droppy',
  'childsgame',
  'email-collector',
  'quran-reader',
  'quran-amp',
  'quran-majeed-v3',
  'api-job-finder',
  'works',
  'karamat-al-awliya'
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
  'quran-majeed-v3',
  'api-job-finder',
  'mapamundi',
  'works',
  'droppy',
  'webhealth',
  'email-collector',
  'childsgame',
  'remedy',
  'karamat-al-awliya'
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
  'https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800;900&family=DM+Serif+Display&family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@300;400;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Cairo:wght@400;600;800&family=Poppins:wght@400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&display=swap',
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;600;700;800;900&display=swap'
];
const CDN_HOSTS = ['cdn.tailwindcss.com', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'unpkg.com'];

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
const DATA_MARKER = '/__bookdata-v7';

const ASSET_EXT = /\.(?:html?|css|js|mjs|json|png|jpe?g|gif|webp|svg|ico|webmanifest|woff2?|ttf|otf|mp3|ogg|wav|wasm|dzi)(?:[?#]|$)/i;

// Resolve a referenced URL (relative or absolute, query preserved) to an
// app-local path under /<s>/, or null when it is not a local app asset.
function localPath(v, s) {
  if (!v || /^(data:|#|mailto:|javascript:|\/\/)/i.test(v)) return null;
  let u;
  try { u = new URL(v, 'https://local.invalid/' + s + '/index.html'); } catch (e) { return null; }
  if (u.origin !== 'https://local.invalid') return null;
  const p = u.pathname + u.search;
  return p.startsWith('/' + s + '/') ? p : null;
}

// Every local asset reference we can find in an app's index.html or its own
// sw.js: src/href attributes plus quoted string literals (catches lazy files,
// multi-page links like webhealth's actualites.html, fonts, etc.).
function assetRefs(text, s) {
  const out = new Set();
  for (const m of text.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const p = localPath(m[1], s); if (p) out.add(p);
  }
  for (const m of text.matchAll(/["'`]([^"'`\s]+)["'`]/g)) {
    const v = m[1];
    if (!ASSET_EXT.test(v)) continue;
    const p = localPath(v, s); if (p) out.add(p);
  }
  return [...out];
}

// Cache a cross-origin asset. Prefer a CORS fetch (needed for fonts to render
// offline); fall back to an opaque fetch for hosts that reject CORS.
async function cacheCross(cache, url) {
  try { await cache.add(url); return; } catch (e) {}
  await cacheOpaque(cache, url);
}

// Mirror an app's own service-worker precache list. This is what makes
// multi-page apps (webhealth), secondary pages (droppy/get.html) and their CDN
// fonts/icons work offline from a works-only visit, without opening the app.
async function syncAppSW(shell, cdn, s) {
  try {
    const r = await fetch('/' + s + '/sw.js', { cache: 'no-store' });
    if (!r || !r.ok) return;
    const txt = await r.text();
    const locals = assetRefs(txt, s);
    if (locals.length) await precache(shell, locals, 6);
    for (const m of txt.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) {
      let u;
      try { u = new URL(m[1]); } catch (e) { continue; }
      if (CDN_HOSTS.includes(u.hostname)) await cacheCross(cdn, u.href);
    }
  } catch (e) {}
}

// Read a Google Fonts stylesheet over CORS and cache every woff2 it references,
// so Arabic text renders with the right font even when it was never fetched
// online. Opaque CSS alone is not enough (fonts need CORS responses).
async function cacheFontFiles(cdn, cssUrl) {
  try {
    const r = await fetch(cssUrl, { mode: 'cors' });
    if (!r || !r.ok) return;
    await cdn.put(cssUrl, r.clone());
    const txt = await r.text();
    const urls = [...new Set((txt.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g) || [])
      .map((u) => u.slice(4, -1).replace(/["']/g, '')))];
    await precache(cdn, urls, 3);
  } catch (e) {}
}

async function cacheAppData(shell, cdn, s) {
  try {
    const r = await fetch('/' + s + '/data/manifest.json', { cache: 'no-store' });
    if (r && r.ok) {
      const man = await r.clone().json();
      await shell.put('/' + s + '/data/manifest.json', r);
      await precache(shell, (man.chunks || []).map((c) => '/' + s + '/' + c.file), 6);
    }
  } catch (e) {}
  try {
    const r = await fetch('/' + s + '/data/index.json', { cache: 'no-store' });
    if (r && r.ok) {
      const list = await r.clone().json();
      await shell.put('/' + s + '/data/index.json', r);
      const files = [...new Set((list || []).map((x) => x.file).filter(Boolean))];
      await precache(shell, files.map((f) => '/' + s + '/data/' + f + '.json'), 6);
    }
  } catch (e) {}
  try {
    const r = await fetch('/' + s + '/manifest.json', { cache: 'no-store' });
    if (r && r.ok) {
      const man = await r.clone().json();
      await shell.put('/' + s + '/manifest.json', r);
      if (Array.isArray(man)) {
        const files = [...new Set(man.map((x) => x && x.file).filter(Boolean))];
        await precache(shell, files.map((f) => localPath(f, s) || ('/' + s + '/' + f)), 6);
      }
    }
  } catch (e) {}
  try {
    const r = await fetch('/' + s + '/index.html', { cache: 'no-store' });
    if (r && r.ok) await precache(shell, assetRefs(await r.text(), s), 6);
  } catch (e) {}
  await syncAppSW(shell, cdn, s);
}

async function prefetchBookData() {
  const shell = await caches.open(SHELL_CACHE);
  const cdn = await caches.open(CDN_CACHE);
  if (await shell.match(DATA_MARKER)) return;
  await Promise.all(SHELLS.map((s) => cacheAppData(shell, cdn, s)));
  await Promise.all(CDN.filter((u) => u.includes('fonts.googleapis.com')).map((u) => cacheFontFiles(cdn, u)));
  await shell.put(DATA_MARKER, new Response('1'));
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
    } else if (/\.[a-z0-9]+$/i.test(path)) {
      // Navigation to an actual HTML file (multi-page apps, e.g.
      // /webhealth/actualites.html or /droppy/get.html). These are mirrored
      // from each app's own sw.js precache list.
      event.respondWith(
        caches.open(SHELL_CACHE).then((c) => c.match(req, { ignoreSearch: true })).then((hit) =>
          hit || fetch(req).then((res) => {
            if (res && res.ok) caches.open(SHELL_CACHE).then((c) => c.put(req, res.clone()));
            return res;
          })
        ).catch(() => caches.match(req, { ignoreSearch: true }).then((h) => h || fetch(req)))
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
