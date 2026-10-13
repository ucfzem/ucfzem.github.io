// Root service worker for https://ucfzem.github.io  (scope: "/")
//
// Problem it solves: each app registers its own SW with scope "/app/", which
// can NEVER intercept the bare URL "/app" (no trailing slash). Offline, a typed
// "/app" makes Chrome try the network to get GitHub's 301 -> ERR_INTERNET_DISCONNECTED.
//
// This SW catches bare app URLs and answers with the same 301 redirect GitHub
// would send, so the browser then requests "/app/", which the app's own SW
// serves from cache while offline.
//
// It does nothing else: only navigations, only known slugs, only bare paths.

const APPS = [
  'al-tibb-al-nabawi',
  'nuzhat-al-mushtaq',
  'asrar-al-kawn',
  'al-adhama',
  'tarikh-ibn-khaldun',
  'mujam-al-buldan',
  'al-adhkiya',
  'livre-al-istibsar',
  'quran-reader',
  'quran-amp',
  'api-job-finder',
  'works',
  'droppy',
  'webhealth',
  'email-collector',
  'childsgame'
];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return;

  const slug = url.pathname.replace(/^\//, '');
  if (slug.endsWith('/') || slug.indexOf('/') !== -1 || slug === '') return;
  if (!APPS.includes(slug)) return;

  const target = url.origin + '/' + slug + '/';
  const html = '<!doctype html><html lang="ar"><head><meta charset="utf-8">' +
    '<title>جاري التحويل…</title></head><body>' +
    '<script>location.replace(' + JSON.stringify(target) + ')<\/script>' +
    '</body></html>';
  event.respondWith(new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  }));
});
