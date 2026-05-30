self.addEventListener('fetch', function(e) {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/liens/') || url.pathname === '/liens') {
    e.respondWith(Response.redirect('/', 302));
  }
});
self.addEventListener('install', function() { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });
